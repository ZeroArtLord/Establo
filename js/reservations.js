// Reservations
function setupReservationForm() {
    var reservationForm = document.getElementById('reservation-form');
    if (!reservationForm) return;

    var dateInput = document.getElementById('reservation-date');
    if (dateInput) {
        var today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    reservationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        document.querySelectorAll('#reservation-form .error-message').forEach(function(el) {
            el.textContent = '';
            el.classList.remove('is-visible');
        });

        document.querySelectorAll('#reservation-form input, #reservation-form select').forEach(function(input) {
            input.classList.remove('error');
        });

        var reservationData = {
            name: document.getElementById('reservation-name').value.trim(),
            phone: document.getElementById('reservation-phone').value.trim(),
            date: document.getElementById('reservation-date').value,
            people: document.getElementById('reservation-people').value,
            event: document.getElementById('reservation-event').value,
            notes: document.getElementById('reservation-notes').value.trim(),
            promoConsent: document.getElementById('reservation-promo-consent').checked,
            timestamp: new Date().toISOString(),
            type: 'reserva'
        };

        var isValid = true;
        var nameInput = document.getElementById('reservation-name');
        if (!reservationData.name) {
            document.getElementById('reservation-name-error').textContent = 'El nombre es obligatorio';
            document.getElementById('reservation-name-error').classList.add('is-visible');
            nameInput.classList.add('error');
            isValid = false;
        } else if (reservationData.name.length < 2) {
            document.getElementById('reservation-name-error').textContent = 'El nombre debe tener al menos 2 caracteres';
            document.getElementById('reservation-name-error').classList.add('is-visible');
            nameInput.classList.add('error');
            isValid = false;
        }

        var phoneInput = document.getElementById('reservation-phone');
        if (!reservationData.phone) {
            document.getElementById('reservation-phone-error').textContent = 'El teléfono es obligatorio';
            document.getElementById('reservation-phone-error').classList.add('is-visible');
            phoneInput.classList.add('error');
            isValid = false;
        } else if (!validatePhone(reservationData.phone)) {
            document.getElementById('reservation-phone-error').textContent = 'Formato de teléfono inválido. Usa: 0412-1234567, 4121234567, +584121234567';
            document.getElementById('reservation-phone-error').classList.add('is-visible');
            phoneInput.classList.add('error');
            isValid = false;
        }

        var dateInputLocal = document.getElementById('reservation-date');
        if (!reservationData.date) {
            document.getElementById('reservation-date-error').textContent = 'La fecha es obligatoria';
            document.getElementById('reservation-date-error').classList.add('is-visible');
            dateInputLocal.classList.add('error');
            isValid = false;
        }

        var peopleInput = document.getElementById('reservation-people');
        if (!reservationData.people) {
            document.getElementById('reservation-people-error').textContent = 'El número de personas es obligatorio';
            document.getElementById('reservation-people-error').classList.add('is-visible');
            peopleInput.classList.add('error');
            isValid = false;
        }

        if (!isValid) return;

        var submitBtn = reservationForm.querySelector('.btn-reservation');
        var originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        submitBtn.disabled = true;

        try {
            var savedToSheets = await saveReservationToSheets(reservationData);
            if (savedToSheets) {
                sendReservationWhatsApp(reservationData);
                showNotification('¡Reserva solicitada exitosamente! Te contactaremos para confirmar.', 'success');
                reservationForm.reset();
                if (dateInput) {
                    var todayReset = new Date().toISOString().split('T')[0];
                    dateInput.min = todayReset;
                }
            } else {
                showNotification('Error al guardar la reserva. Por favor, intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error en el proceso de reserva:', error);
            showNotification('Ocurrió un error. Por favor, intenta nuevamente.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

async function saveReservationToSheets(reservationData) {
    try {
        var sanitizedData = sanitizeData(reservationData);
        var payload = Object.assign({}, sanitizedData, { tipo: 'reserva' });
        var response = await fetchWithRetry(GOOGLE_SHEETS_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return response.ok;
    } catch (error) {
        console.error('Error en saveReservationToSheets:', error);
        return false;
    }
}

function sendReservationWhatsApp(reservationData) {
    var eventMap = {
        'cumpleaños': 'Cumpleaños',
        'aniversario': 'Aniversario',
        'corporativo': 'Corporativo',
        'cena-privada': 'Cena privada',
        'otro': 'Otro'
    };

    var date = new Date(reservationData.date);
    var formattedDate = date.toLocaleDateString('es-VE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    var message = '*NUEVA SOLICITUD DE RESERVA - EL ESTABLO*\n\n';
    message += '*Cliente:* ' + reservationData.name + '\n';
    message += '*Teléfono:* ' + reservationData.phone + '\n';
    message += '*Fecha:* ' + formattedDate + '\n';
    message += '*Personas:* ' + reservationData.people + ' ' + (reservationData.people === '10' ? '+' : '') + ' personas\n';

    if (reservationData.event) {
        message += '*Tipo de evento:* ' + (eventMap[reservationData.event] || reservationData.event) + '\n';
    }

    if (reservationData.notes) {
        message += '*Notas especiales:* ' + reservationData.notes + '\n';
    }

    message += '*Consentimiento promociones:* ' + (reservationData.promoConsent ? 'Sí' : 'No') + '\n';
    message += '\n*INFORMACIÓN ADICIONAL:*\n';
    message += 'Solicitud generada desde la web de El Establo\n';
    message += 'Hora de solicitud: ' + new Date().toLocaleTimeString('es-VE') + '\n';
    message += 'Fecha de solicitud: ' + new Date().toLocaleDateString('es-VE') + '\n';
    message += 'ID de reserva: RES-' + Date.now().toString().slice(-6);

    var encodedMessage = encodeURIComponent(message);
    var whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodedMessage;
    window.open(whatsappUrl, '_blank');
}
