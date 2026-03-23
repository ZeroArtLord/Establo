// Cart and checkout flow
function addToCart(product, quantity, options, finalPrice) {
    quantity = quantity || 1;
    options = options || {};
    var price = finalPrice !== null ? finalPrice : product.price;
    var cartItem = {
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: price,
        basePrice: product.price,
        quantity: quantity,
        options: options,
        total: price * quantity
    };
    cart.push(cartItem);
    updateCartUI();
    showCartToast(product, cartItem);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function changeCartQuantity(index, delta) {
    var item = cart[index];
    if (!item) return;
    var nextQty = item.quantity + delta;
    if (nextQty <= 0) {
        removeFromCart(index);
        return;
    }
    item.quantity = nextQty;
    updateCartItemTotals(item);
    updateCartUI();
}

function updateCartUI() {
    var totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    var countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = totalItems;
    saveCartToStorage();
    updateCartModal();
}

function updateCartModal() {
    var cartBody = document.querySelector('.cart-body');
    var cartTotalElement = document.getElementById('cart-total');
    if (!cartBody || !cartTotalElement) return;

    calculateOrderTotals();

    if (cart.length === 0) {
        cartBody.innerHTML = '<p class="empty-cart">El carrito está vacío.</p>';
        cartTotalElement.textContent = 'REF 0.00';
        return;
    }

    var total = cart.reduce(function(sum, item) { return sum + item.total; }, 0);
    cartTotalElement.textContent = 'REF ' + total.toFixed(2);

    var cartHTML = '\n        <div class="cart-panel">\n            <div class="cart-panel-header">\n                <h3>Carrito</h3>\n                <button class="close-modal" aria-label="Cerrar carrito">×</button>\n            </div>\n            <div class="cart-panel-info">\n                <div class="cart-info-row">\n                    <span>Entregar en:</span>\n                    <a href="#" class="cart-link">Ingresa tu ubicación</a>\n                </div>\n                <div class="cart-info-row">\n                    <span>Cuando:</span>\n                    <span>De inmediato</span>\n                </div>\n            </div>\n            <div class="cart-alert">\n                <strong>Selecciona tu ubicación para continuar</strong>\n                <span>Necesitamos saber dónde enviar tu pedido</span>\n            </div>\n    ';

    cartHTML += '<div class="cart-items">';

    cart.forEach(function(item, index) {
        var product = findProductById(item.productId) || {};
        var image = product.image || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
        var optionsText = '';
        if (item.options) {
            var parts = [];
            if (item.options.extras && item.options.extras.length > 0) {
                parts.push(item.options.extras.map(function(e) { return e.name; }).join(', '));
            }
            if (item.options.removeItems && item.options.removeItems.length > 0) {
                parts.push(item.options.removeItems.join(', '));
            }
            if (item.options.specialNotes) {
                parts.push(item.options.specialNotes);
            }
            optionsText = parts.join(' · ');
        }

        cartHTML += '\n            <div class="cart-item kfc-style" data-index="' + index + '">\n                <img src="' + image + '" alt="' + item.name + '" class="cart-item-image">\n                <div class="cart-item-main">\n                    <div class="cart-item-title">' + item.name + '</div>\n                    <div class="cart-item-sub">' + sanitizeHTML(optionsText) + '</div>\n                    <div class="cart-item-actions">\n                        <button class="link-btn btn-remove" data-index="' + index + '">Eliminar</button>\n                    </div>\n                </div>\n                <div class="cart-item-right">\n                    <div class="cart-item-price">REF ' + item.total.toFixed(2) + '</div>\n                    <div class="cart-item-quantity" aria-label="Cantidad">\n                        <button class="btn-quantity" data-index="' + index + '" data-delta="-1" aria-label="Disminuir cantidad">-</button>\n                        <span>' + item.quantity + '</span>\n                        <button class="btn-quantity" data-index="' + index + '" data-delta="1" aria-label="Aumentar cantidad">+</button>\n                    </div>\n                </div>\n            </div>\n        ';
    });

    cartHTML += '</div>';

    cartHTML += '\n        <button class="btn-clear-cart" id="clear-cart">Vaciar carrito</button>\n        <div class="cart-utensils">\n            <label class="utensils-toggle">\n                <span>¿Quieres añadir utensilios?</span>\n                <input type="checkbox" id="utensils-toggle">\n                <span class="switch"></span>\n            </label>\n            <div class="utensils-list">\n                <label><input type="checkbox"> Salsas</label>\n                <label><input type="checkbox"> Cubiertos</label>\n                <label><input type="checkbox"> Servilletas</label>\n            </div>\n        </div>\n        <div class="cart-summary">\n            <div class="summary-row"><span>Subtotal</span><span>REF ' + orderState.subtotal.toFixed(2) + '</span></div>\n            <div class="summary-row"><span>Envío</span><span>REF ' + orderState.deliveryCost.toFixed(2) + '</span></div>\n            <div class="summary-row total"><span>Total del pedido</span><span>REF ' + orderState.total.toFixed(2) + '</span></div>\n        </div>\n    ';

    cartHTML += '\n        <div class="cart-footer">\n            <button class="btn btn-primary" id="checkout-btn">Ir a pagar</button>\n            <span class="cart-footer-total">REF ' + orderState.total.toFixed(2) + '</span>\n        </div>\n        </div>\n    ';

    cartBody.innerHTML = cartHTML;

    document.querySelectorAll('.btn-remove').forEach(function(button) {
        button.addEventListener('click', function() {
            var index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });

    document.querySelectorAll('.btn-quantity').forEach(function(button) {
        button.addEventListener('click', function() {
            var index = parseInt(this.getAttribute('data-index'));
            var delta = parseInt(this.getAttribute('data-delta'));
            changeCartQuantity(index, delta);
        });
    });

    var clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            cart = [];
            updateCartUI();
        });
    }

    var checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                openDeliveryModal();
            } else {
                showNotification('El carrito está vacío. Agrega productos primero.', 'error');
            }
        });
    }
}

function setupCartIconListener() {
    var cartIcon = document.getElementById('cart-icon');
    if (!cartIcon) return;
    cartIcon.addEventListener('click', function() { openCartModal(); });
    cartIcon.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCartModal();
        }
    });
}

function openCartModal() {
    updateCartModal();
    openModal('cart-modal');
}

function openDeliveryModal() {
    var modal = document.getElementById('zone-modal');
    var modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = '\n        <button class="close-modal" aria-label="Cerrar">×</button>\n        <h2>¿Cómo quieres recibir tu pedido?</h2>\n        <div class="delivery-options">\n            <div class="delivery-option" data-type="retiro">\n                <h3>Retiro en local</h3>\n                <p>Ven a recoger tu pedido en nuestro restaurante</p>\n                <p class="delivery-cost">Sin costo adicional</p>\n                <button class="btn btn-primary btn-select-delivery">Seleccionar</button>\n            </div>\n            <div class="delivery-option" data-type="delivery">\n                <h3>Delivery a domicilio</h3>\n                <p>Te llevamos tu pedido hasta la puerta de tu casa</p>\n                <div class="zone-selection is-hidden">\n                    <label for="zone-select">Selecciona tu zona:</label>\n                    <select id="zone-select">\n                        <option value="">-- Selecciona una zona --</option>\n                        ' + deliveryZones.map(function(zone) { return '<option value="' + zone.id + '" data-cost="' + zone.cost + '">' + zone.name + ' (+$' + zone.cost.toFixed(2) + ')</option>'; }).join('') + '\n                    </select>\n                    <p class="zone-info" id="zone-info"></p>\n                </div>\n                <button class="btn btn-primary btn-select-delivery">Seleccionar</button>\n            </div>\n        </div>\n    ';
    setupDeliveryModalListeners();
    openModal('zone-modal');
}

function setupDeliveryModalListeners() {
    document.querySelectorAll('.btn-select-delivery').forEach(function(button) {
        button.addEventListener('click', function() {
            var deliveryOption = this.closest('.delivery-option');
            var deliveryType = deliveryOption.getAttribute('data-type');
            if (deliveryType === 'retiro') {
                orderState.deliveryType = 'retiro';
                orderState.deliveryZone = null;
                orderState.deliveryCost = 0;
                calculateOrderTotals();
                closeModal(document.getElementById('zone-modal'));
                openCustomerModal();
            } else if (deliveryType === 'delivery') {
                var zoneSelect = document.getElementById('zone-select');
                var selectedZone = zoneSelect.value;
                if (!selectedZone) {
                    showNotification('Por favor selecciona una zona de delivery.', 'error');
                    return;
                }
                var selectedZoneData = deliveryZones.find(function(z) { return z.id === selectedZone; });
                orderState.deliveryType = 'delivery';
                orderState.deliveryZone = selectedZoneData;
                orderState.deliveryCost = selectedZoneData.cost;
                calculateOrderTotals();
                closeModal(document.getElementById('zone-modal'));
                openCustomerModal();
            }
        });
    });

    document.querySelectorAll('.delivery-option').forEach(function(option) {
        option.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-select-delivery')) {
                var type = this.getAttribute('data-type');
                var zoneSelection = this.querySelector('.zone-selection');
                if (type === 'delivery') {
                    zoneSelection.classList.remove('is-hidden');
                }
                document.querySelectorAll('.delivery-option').forEach(function(other) {
                    if (other !== option) {
                        var otherZoneSelection = other.querySelector('.zone-selection');
                        if (otherZoneSelection) otherZoneSelection.classList.add('is-hidden');
                    }
                });
            }
        });
    });

    var zoneSelect = document.getElementById('zone-select');
    if (zoneSelect) {
        zoneSelect.addEventListener('change', function() {
            var selectedOption = this.options[this.selectedIndex];
            var cost = selectedOption.getAttribute('data-cost');
            var zoneInfo = document.getElementById('zone-info');
            if (cost) {
                zoneInfo.textContent = 'Costo de envío: $' + parseFloat(cost).toFixed(2);
                zoneInfo.classList.add('is-active');
            } else {
                zoneInfo.textContent = '';
                zoneInfo.classList.remove('is-active');
            }
        });
    }
}

function openCustomerModal() {
    var modal = document.getElementById('customer-modal');
    var modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = '\n        <button class="close-modal" aria-label="Cerrar">×</button>\n        <h2>Tus datos de contacto</h2>\n        <form id="customer-form">\n            <div class="form-group">\n                <label for="customer-name">Nombre completo *</label>\n                <input type="text" id="customer-name" name="name" required placeholder="Ej: Juan Pérez">\n                <small class="error-message" id="name-error" style="display: none; color: #e74c3c;"></small>\n            </div>\n            <div class="form-group">\n                <label for="customer-phone">Teléfono *</label>\n                <input type="tel" id="customer-phone" name="phone" required placeholder="Ej: 0412-1234567">\n                <small class="error-message" id="phone-error" style="display: none; color: #e74c3c;"></small>\n                <small class="hint">Formato: 0412-1234567, 4121234567, +584121234567</small>\n            </div>\n            <div class="form-group">\n                <label for="customer-email">Email (opcional)</label>\n                <input type="email" id="customer-email" name="email" placeholder="Ej: juan@email.com">\n                <small class="error-message" id="email-error" style="display: none; color: #e74c3c;"></small>\n            </div>\n            <div class="form-group">\n                <label class="checkbox-label">\n                    <input type="checkbox" id="promo-consent" name="promo-consent">\n                    <span>Deseo recibir promociones y ofertas especiales por WhatsApp</span>\n                </label>\n            </div>\n            <div class="modal-actions">\n                <button type="submit" class="btn btn-primary">Continuar</button>\n            </div>\n        </form>\n    ';

    var form = document.getElementById('customer-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        document.querySelectorAll('.error-message').forEach(function(el) {
            el.classList.remove('is-visible');
            el.textContent = '';
        });
        document.querySelectorAll('#customer-form input').forEach(function(input) {
            input.classList.remove('error');
        });

        var customerData = {
            name: document.getElementById('customer-name').value.trim(),
            phone: document.getElementById('customer-phone').value.trim(),
            email: document.getElementById('customer-email').value.trim(),
            promoConsent: document.getElementById('promo-consent').checked
        };

        var isValid = true;
        var nameInput = document.getElementById('customer-name');
        if (!customerData.name) {
            document.getElementById('name-error').textContent = 'El nombre es obligatorio';
            document.getElementById('name-error').classList.add('is-visible');
            nameInput.classList.add('error');
            isValid = false;
        } else if (customerData.name.length < 2) {
            document.getElementById('name-error').textContent = 'El nombre debe tener al menos 2 caracteres';
            document.getElementById('name-error').classList.add('is-visible');
            nameInput.classList.add('error');
            isValid = false;
        }

        var phoneInput = document.getElementById('customer-phone');
        if (!customerData.phone) {
            document.getElementById('phone-error').textContent = 'El teléfono es obligatorio';
            document.getElementById('phone-error').classList.add('is-visible');
            phoneInput.classList.add('error');
            isValid = false;
        } else if (!validatePhone(customerData.phone)) {
            document.getElementById('phone-error').textContent = 'Formato de teléfono inválido. Usa: 0412-1234567, 4121234567, +584121234567';
            document.getElementById('phone-error').classList.add('is-visible');
            phoneInput.classList.add('error');
            isValid = false;
        }

        var emailInput = document.getElementById('customer-email');
        if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
            document.getElementById('email-error').textContent = 'Formato de email inválido';
            document.getElementById('email-error').classList.add('is-visible');
            emailInput.classList.add('error');
            isValid = false;
        }

        if (!isValid) return;

        orderState.customerData = customerData;
        closeModal(modal);
        openCrossSellModal();
    });

    openModal('customer-modal');
}

function openCrossSellModal() {
    var modal = document.getElementById('cross-sell-modal');
    var modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = '\n        <button class="close-modal" aria-label="Cerrar">×</button>\n        <h2>¿Te gustaría agregar algo más?</h2>\n        <p>Productos que combinan perfectamente con tu pedido:</p>\n        <div class="cross-sell-grid">\n            ' + crossSellProducts.map(function(product) {
                return '\n                <div class="cross-sell-item">\n                    <h4>' + product.name + '</h4>\n                    <p class="cross-sell-desc">' + product.description + '</p>\n                    <p class="cross-sell-price">$' + product.price.toFixed(2) + '</p>\n                    <button class="btn btn-small btn-add-cross-sell" data-product-id="' + product.id + '">Agregar</button>\n                </div>';
            }).join('') + '\n        </div>\n        <div class="modal-actions">\n            <button class="btn btn-secondary" id="skip-cross-sell">Continuar sin agregar</button>\n            <button class="btn btn-primary" id="continue-cross-sell">Continuar</button>\n        </div>\n    ';
    setupCrossSellListeners();
    openModal('cross-sell-modal');
}

function setupCrossSellListeners() {
    document.querySelectorAll('.btn-add-cross-sell').forEach(function(button) {
        button.addEventListener('click', function() {
            var productId = parseInt(this.getAttribute('data-product-id'));
            var product = crossSellProducts.find(function(p) { return p.id === productId; });
            if (product) {
                addToCart(product, 1, {}, product.price);
                this.textContent = '✓ Agregado';
                this.disabled = true;
                this.classList.add('added');
                var continueBtn = document.getElementById('continue-cross-sell');
                continueBtn.textContent = 'Continuar (' + cart.length + ' productos)';
            }
        });
    });

    document.getElementById('skip-cross-sell').addEventListener('click', function() {
        closeModal(document.getElementById('cross-sell-modal'));
        completeOrder();
    });

    document.getElementById('continue-cross-sell').addEventListener('click', function() {
        closeModal(document.getElementById('cross-sell-modal'));
        completeOrder();
    });
}

function completeOrder() {
    calculateOrderTotals();
    sendWhatsAppOrder();
}

async function saveToGoogleSheets(customerData, orderSummary) {
    try {
        var sanitizedData = sanitizeData(customerData);
        var payload = {
            timestamp: new Date().toISOString(),
            customer: sanitizedData,
            order: orderSummary,
            cart: cart.map(function(item) {
                return {
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total,
                    options: item.options
                };
            }),
            delivery: {
                type: orderState.deliveryType,
                zone: orderState.deliveryZone ? orderState.deliveryZone.name : null,
                cost: orderState.deliveryCost
            },
            totals: {
                subtotal: orderState.subtotal,
                delivery: orderState.deliveryCost,
                total: orderState.total
            }
        };

        var response = await fetchWithRetry(GOOGLE_SHEETS_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) return true;
        return false;
    } catch (error) {
        console.error('Error en saveToGoogleSheets:', error);
        return false;
    }
}

async function sendWhatsAppOrder() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío.', 'error');
        return;
    }
    if (!orderState.customerData) {
        showNotification('Faltan datos del cliente.', 'error');
        return;
    }

    var orderSummary = {
        itemsCount: cart.length,
        subtotal: orderState.subtotal,
        deliveryCost: orderState.deliveryCost,
        total: orderState.total,
        timestamp: new Date().toISOString()
    };

    try {
        await saveToGoogleSheets(orderState.customerData, orderSummary);
    } catch (error) {
        console.error('Error al intentar guardar en Google Sheets:', error);
    }

    var message = '*NUEVO PEDIDO - EL ESTABLO*\n\n';
    message += '*Cliente:* ' + orderState.customerData.name + '\n';
    message += '*Teléfono:* ' + orderState.customerData.phone + '\n';
    if (orderState.customerData.email) {
        message += '*Email:* ' + orderState.customerData.email + '\n';
    }

    if (orderState.deliveryType === 'retiro') {
        message += '*Tipo de entrega:* Retiro en local\n';
    } else {
        message += '*Tipo de entrega:* Delivery\n';
        message += '*Zona:* ' + orderState.deliveryZone.name + '\n';
        message += '*Costo de envío:* $' + orderState.deliveryCost.toFixed(2) + '\n';
    }

    message += '\n*DETALLE DEL PEDIDO:*\n';

    cart.forEach(function(item, index) {
        message += (index + 1) + '. *' + item.name + '* x' + item.quantity + ' - $' + item.total.toFixed(2) + '\n';
        if (item.options) {
            if (item.options.meatDoneness) {
                var donenessMap = { 'medio': 'Medio', 'tres-cuartos': '3/4', 'bien-cocido': 'Bien cocido' };
                message += '   - Término: ' + donenessMap[item.options.meatDoneness] + '\n';
            }
            if (item.options.removeItems && item.options.removeItems.length > 0) {
                var removeMap = { 'sin-cebolla': 'Sin cebolla', 'sin-salsas': 'Sin salsas' };
                var removeText = item.options.removeItems.map(function(i) { return removeMap[i] || i; }).join(', ');
                message += '   - Quitar: ' + removeText + '\n';
            }
            if (item.options.extras && item.options.extras.length > 0) {
                var extraMap = { 'doble-tocino': 'Doble tocino', 'queso-fundido': 'Queso fundido' };
                var extrasText = item.options.extras.map(function(extra) {
                    var extraName = extraMap[extra.name] || extra.name;
                    return extraName + ' (+$' + extra.price.toFixed(2) + ')';
                }).join(', ');
                message += '   - Extras: ' + extrasText + '\n';
            }
            if (item.options.specialNotes) {
                message += '   - Notas: ' + item.options.specialNotes + '\n';
            }
        }
        if (item.price > item.basePrice) {
            message += '   - Precio base: $' + item.basePrice.toFixed(2) + ' (con extras: $' + item.price.toFixed(2) + ')\n';
        }
    });

    message += '\n*RESUMEN DE PAGO:*\n';
    message += 'Subtotal: $' + orderState.subtotal.toFixed(2) + '\n';
    if (orderState.deliveryCost > 0) {
        message += 'Costo de envío: $' + orderState.deliveryCost.toFixed(2) + '\n';
    }
    message += '*TOTAL: $' + orderState.total.toFixed(2) + '*\n\n';
    message += 'Pedido generado desde la web de El Establo\n';
    message += 'Hora: ' + new Date().toLocaleTimeString('es-VE') + '\n';
    message += 'Fecha: ' + new Date().toLocaleDateString('es-VE');

    var encodedMessage = encodeURIComponent(message);
    var whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodedMessage;

    cart = [];
    orderState = {
        deliveryType: null,
        deliveryZone: null,
        deliveryCost: 0,
        customerData: null,
        subtotal: 0,
        total: 0
    };

    updateCartUI();
    updateCartModal();

    window.open(whatsappUrl, '_blank');
    showNotification('¡Pedido enviado por WhatsApp!', 'success');
}
