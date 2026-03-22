// 1. Función para sanitizar texto para el DOM
function sanitizeHTML(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 2. Define un objeto `products` que contenga al menos 3 productos de ejemplo por categoría
const products = {
    promos: [
        {
            id: 1,
            name: "Promo Doble Establo",
            price: 15.99,
            image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "2 hamburguesas + papas + 2 bebidas",
            category: "promos"
        },
        {
            id: 2,
            name: "Tacos Night",
            price: 12.50,
            image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "6 tacos + guacamole + salsa especial",
            category: "promos"
        },
        {
            id: 3,
            name: "Parrilla Familiar",
            price: 24.99,
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Carne, pollo, chorizo, ensalada y arepas",
            category: "promos"
        }
    ],
    hamburguesas: [
        {
            id: 4,
            name: "Hamburguesa Clásica",
            price: 8.99,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Carne, queso, lechuga, tomate, cebolla",
            category: "hamburguesas"
        },
        {
            id: 5,
            name: "Hamburguesa BBQ",
            price: 10.50,
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Carne, queso cheddar, bacon, salsa BBQ",
            category: "hamburguesas"
        },
        {
            id: 6,
            name: "Hamburguesa Veggie",
            price: 9.75,
            image: "https://images.unsplash.com/photo-1559314809-2b99056a8c4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Medallón vegetal, aguacate, espinacas",
            category: "hamburguesas"
        }
    ],
    "tex-mex": [
        {
            id: 7,
            name: "Tacos de Carne",
            price: 7.50,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "3 tacos con carne molida, cilantro, cebolla",
            category: "tex-mex"
        },
        {
            id: 8,
            name: "Burrito Grande",
            price: 9.25,
            image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Tortilla gigante rellena de pollo, frijoles, arroz",
            category: "tex-mex"
        },
        {
            id: 9,
            name: "Nachos Supreme",
            price: 8.00,
            image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Nachos con queso, guacamole, jalapeños",
            category: "tex-mex"
        }
    ],
    parrilla: [
        {
            id: 10,
            name: "Churrasco",
            price: 14.99,
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Corte de res, arepa, ensalada, chimichurri",
            category: "parrilla"
        },
        {
            id: 11,
            name: "Pollo a la Parrilla",
            price: 11.50,
            image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Pechuga marinada, vegetales asados",
            category: "parrilla"
        },
        {
            id: 12,
            name: "Costillas BBQ",
            price: 16.75,
            image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Costillas de cerdo con salsa BBQ casera",
            category: "parrilla"
        }
    ],
    bebidas: [
        {
            id: 13,
            name: "Refresco 500ml",
            price: 2.50,
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Coca‑Cola, Pepsi, Sprite, Fanta",
            category: "bebidas"
        },
        {
            id: 14,
            name: "Jugo Natural",
            price: 3.25,
            image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "Naranja, piña, fresa, maracuyá",
            category: "bebidas"
        },
        {
            id: 15,
            name: "Cerveza Artesanal",
            price: 4.50,
            image: "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            description: "IPA, Lager, Stout, Amber Ale",
            category: "bebidas"
        }
    ]
};

// 3. Carrito (array `cart`) con funciones y estado del pedido
let cart = [];
let orderState = {
    deliveryType: null, // 'retiro' o 'delivery'
    deliveryZone: null,
    deliveryCost: 0,
    customerData: null,
    subtotal: 0,
    total: 0
};

// URLs configuradas
const WHATSAPP_NUMBER = '584121234567'; // Número de ejemplo - REEMPLAZAR CON TU NÚMERO REAL
const GOOGLE_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbw3w5Nr2Q8ueIvKUh1-pMk1BQj-TR5x765ejWLiUkQwWq_qve8m946EFpMCArilSVNF/exec'; // URL de Google Apps Script - REEMPLAZAR CON TU URL (ver INSTRUCCIONES_GOOGLE_APPS_SCRIPT.md)

// Zonas de delivery con precios
const deliveryZones = [
    { id: 'la-beatriz', name: 'La Beatriz', cost: 2.00 },
    { id: 'centro', name: 'Centro', cost: 1.00 },
    { id: 'plata-1', name: 'Plata 1', cost: 1.50 },
    { id: 'plata-2', name: 'Plata 2', cost: 1.75 },
    { id: 'los-naranjos', name: 'Los Naranjos', cost: 2.25 }
];

// Productos para cross-sell
const crossSellProducts = [
    { id: 101, name: 'Papas fritas', price: 3.00, description: 'Porción grande con salsa' },
    { id: 102, name: 'Aros de cebolla', price: 2.50, description: 'Crujientes con dip de mayonesa' },
    { id: 103, name: 'Refresco 500ml', price: 2.00, description: 'Coca-Cola, Pepsi o Sprite' },
    { id: 104, name: 'Postre de chocolate', price: 4.50, description: 'Brownie con helado' }
];

// Función para agregar un item al carrito (actualizada)
function addToCart(product, quantity = 1, options = {}, finalPrice = null) {
    // Calcular precio final si no se proporciona
    const price = finalPrice !== null ? finalPrice : product.price;
    
    const cartItem = {
        id: Date.now(), // ID único para cada item del carrito
        productId: product.id,
        name: product.name,
        price: price,
        basePrice: product.price, // Precio base sin extras
        quantity: quantity,
        options: options,
        total: price * quantity
    };
    
    cart.push(cartItem);
    updateCartUI();
    
    // Mostrar notificación con detalles de personalización
    let notificationMsg = `${product.name} agregado al carrito`;
    if (options.extras && options.extras.length > 0) {
        notificationMsg += ` con ${options.extras.length} extra(s)`;
    }
    showNotification(notificationMsg);
}

// Función para calcular subtotal y total del pedido
function calculateOrderTotals() {
    orderState.subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    orderState.total = orderState.subtotal + orderState.deliveryCost;
    
    // Actualizar UI si es necesario
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
        cartTotalElement.textContent = `$${orderState.total.toFixed(2)}`;
    }
}

// Función para eliminar un item del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Función para actualizar la UI del carrito
function updateCartUI() {
    // Actualizar contador del ícono
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    
    // Actualizar modal del carrito si está abierto
    updateCartModal();
}

// Función para actualizar el modal del carrito (ampliada para mostrar opciones)
function updateCartModal() {
    const cartBody = document.querySelector('.cart-body');
    const emptyCart = document.querySelector('.empty-cart');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartBody.innerHTML = '<p class="empty-cart">El carrito está vacío.</p>';
        cartTotalElement.textContent = '$0.00';
        return;
    }
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
    
    // Generar HTML de los items del carrito con opciones
    let cartHTML = '<div class="cart-items">';
    
    cart.forEach((item, index) => {
        // Generar texto de opciones
        let optionsHTML = '';
        
        if (item.options) {
            const optionsList = [];
            
            // Término de la carne
            if (item.options.meatDoneness) {
                const donenessMap = {
                    'medio': 'Medio',
                    'tres-cuartos': '3/4',
                    'bien-cocido': 'Bien cocido'
                };
                optionsList.push(`<span class="option-tag">${donenessMap[item.options.meatDoneness]}</span>`);
            }
            
            // Ingredientes para quitar
            if (item.options.removeItems && item.options.removeItems.length > 0) {
                item.options.removeItems.forEach(removeItem => {
                    const removeMap = {
                        'sin-cebolla': 'Sin cebolla',
                        'sin-salsas': 'Sin salsas'
                    };
                    if (removeMap[removeItem]) {
                        optionsList.push(`<span class="option-tag remove">${removeMap[removeItem]}</span>`);
                    }
                });
            }
            
            // Extras
            if (item.options.extras && item.options.extras.length > 0) {
                item.options.extras.forEach(extra => {
                    const extraMap = {
                        'doble-tocino': 'Doble tocino',
                        'queso-fundido': 'Queso fundido'
                    };
                    if (extraMap[extra.name]) {
                        optionsList.push(`<span class="option-tag extra">${extraMap[extra.name]} (+$${extra.price.toFixed(2)})</span>`);
                    }
                });
            }
            
            // Notas especiales
            if (item.options.specialNotes) {
                optionsList.push(`<span class="option-tag notes">Notas: ${item.options.specialNotes}</span>`);
            }
            
            if (optionsList.length > 0) {
                optionsHTML = `<div class="cart-item-options">${optionsList.join('')}</div>`;
            }
        }
        
        // Mostrar precio con extras si aplica
        let priceDisplay = `$${item.total.toFixed(2)}`;
        if (item.price > item.basePrice) {
            priceDisplay = `<span class="original-price">$${item.basePrice.toFixed(2)}</span> $${item.total.toFixed(2)}`;
        }
        
        cartHTML += `
            <div class="cart-item" data-index="${index}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <small>Cantidad: ${item.quantity}</small>
                    ${optionsHTML}
                </div>
                <div class="cart-item-price">${priceDisplay}</div>
                <button class="btn-remove" data-index="${index}" aria-label="Eliminar">×</button>
            </div>
        `;
    });
    
    cartHTML += '</div>';
    cartBody.innerHTML = cartHTML;
    
    // Agregar event listeners a los botones de eliminar
    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

// 2. Función `renderProducts()` que inyecte las tarjetas en cada sección
function renderProducts() {
    // Para cada categoría en products
    Object.keys(products).forEach(category => {
        const section = document.getElementById(category);
        if (!section) return;
        
        const productsGrid = section.querySelector('.products-grid');
        if (!productsGrid) return;
        
        // Limpiar contenido placeholder
        productsGrid.innerHTML = '';
        
        // Crear tarjetas para cada producto en la categoría
        products[category].forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-product-id', product.id);
            
            productCard.innerHTML = `
                <div class="product-image" style="background-image: url('${product.image}')"></div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-product" data-product-id="${product.id}">Personalizar</button>
            `;
            
            productsGrid.appendChild(productCard);
        });
    });
    
    // Agregar event listeners a los botones de personalizar
    setupProductCardListeners();
}

// Configurar event listeners para las tarjetas de producto
function setupProductCardListeners() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Solo abrir modal si no se hizo clic en el botón directamente
            if (!e.target.classList.contains('btn-product')) {
                const productId = parseInt(this.getAttribute('data-product-id'));
                const product = findProductById(productId);
                if (product) {
                    openCustomizeModal(product);
                }
            }
        });
    });
    
    // Event listeners para botones "Personalizar"
    document.querySelectorAll('.btn-product').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que se dispare el evento del card
            const productId = parseInt(this.getAttribute('data-product-id'));
            const product = findProductById(productId);
            if (product) {
                openCustomizeModal(product);
            }
        });
    });
}

// Función auxiliar para encontrar producto por ID
function findProductById(id) {
    for (const category in products) {
        const product = products[category].find(p => p.id === id);
        if (product) return product;
    }
    return null;
}

// 7. Modal de personalización ampliado
function openCustomizeModal(product) {
    const modal = document.getElementById('customize-modal');
    const customizeBody = modal.querySelector('.customize-body');
    
    customizeBody.innerHTML = `
        <h3>${product.name}</h3>
        <p class="product-price-modal">Precio base: $${product.price.toFixed(2)}</p>
        <p>${product.description}</p>
        <div class="customize-options">
            <div class="option-group">
                <h4>Término de la carne</h4>
                <label>
                    <input type="radio" name="meat-doneness" value="medio" checked>
                    Medio
                </label>
                <label>
                    <input type="radio" name="meat-doneness" value="tres-cuartos">
                    3/4
                </label>
                <label>
                    <input type="radio" name="meat-doneness" value="bien-cocido">
                    Bien cocido
                </label>
            </div>
            
            <div class="option-group">
                <h4>Para quitar</h4>
                <label>
                    <input type="checkbox" name="remove-onion" value="sin-cebolla">
                    Sin cebolla
                </label>
                <label>
                    <input type="checkbox" name="remove-sauces" value="sin-salsas">
                    Sin salsas
                </label>
            </div>
            
            <div class="option-group">
                <h4>Extras (precio adicional)</h4>
                <label>
                    <input type="checkbox" name="extra-bacon" value="doble-tocino" data-price="1.50">
                    Doble tocino (+$1.50)
                </label>
                <label>
                    <input type="checkbox" name="extra-cheese" value="queso-fundido" data-price="1.00">
                    Queso fundido (+$1.00)
                </label>
            </div>
            
            <div class="option-group">
                <h4>Notas especiales</h4>
                <textarea id="special-notes" placeholder="Ej: salsa aparte, sin pepinillos..." rows="3"></textarea>
            </div>
            
            <div class="price-summary">
                <p><strong>Precio base:</strong> $${product.price.toFixed(2)}</p>
                <p><strong>Extras:</strong> <span id="extras-total">$0.00</span></p>
                <p class="total-price"><strong>Total:</strong> <span id="final-price">$${product.price.toFixed(2)}</span></p>
            </div>
        </div>
    `;
    
    // Configurar botón de agregar al carrito
    const addButton = modal.querySelector('.btn-primary');
    addButton.textContent = 'Agregar al carrito';
    addButton.onclick = function() {
        const options = getCustomizationOptions();
        const finalPrice = calculateFinalPrice(product.price, options);
        
        addToCart(product, 1, options, finalPrice);
        closeModal(modal);
    };
    
    // Event listeners para actualizar precio en tiempo real
    setupPriceUpdateListeners(product.price);
    
    openModal('customize-modal');
}

// Función para obtener las opciones de personalización
function getCustomizationOptions() {
    const options = {
        meatDoneness: document.querySelector('input[name="meat-doneness"]:checked').value,
        removeItems: [],
        extras: [],
        specialNotes: document.getElementById('special-notes').value.trim()
    };
    
    // Obtener ingredientes para quitar
    if (document.querySelector('input[name="remove-onion"]:checked')) {
        options.removeItems.push('sin-cebolla');
    }
    if (document.querySelector('input[name="remove-sauces"]:checked')) {
        options.removeItems.push('sin-salsas');
    }
    
    // Obtener extras
    if (document.querySelector('input[name="extra-bacon"]:checked')) {
        options.extras.push({
            name: 'doble-tocino',
            price: 1.50
        });
    }
    if (document.querySelector('input[name="extra-cheese"]:checked')) {
        options.extras.push({
            name: 'queso-fundido',
            price: 1.00
        });
    }
    
    return options;
}

// Función para calcular precio final
function calculateFinalPrice(basePrice, options) {
    let extrasTotal = 0;
    options.extras.forEach(extra => {
        extrasTotal += extra.price;
    });
    return basePrice + extrasTotal;
}

// Función para configurar listeners de actualización de precio
function setupPriceUpdateListeners(basePrice) {
    const updatePrice = () => {
        const options = getCustomizationOptions();
        const extrasTotal = options.extras.reduce((sum, extra) => sum + extra.price, 0);
        const finalPrice = basePrice + extrasTotal;
        
        document.getElementById('extras-total').textContent = `$${extrasTotal.toFixed(2)}`;
        document.getElementById('final-price').textContent = `$${finalPrice.toFixed(2)}`;
    };
    
    // Escuchar cambios en todos los inputs
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', updatePrice);
    });
    
    // También escuchar cambios en textarea (aunque no afecta precio)
    document.getElementById('special-notes').addEventListener('input', updatePrice);
}

// 4. Evento para abrir el modal del carrito al hacer clic en el ícono
function setupCartIconListener() {
    document.getElementById('cart-icon').addEventListener('click', function() {
        openCartModal();
    });
}

// Función para abrir modal del carrito
function openCartModal() {
    updateCartModal();
    openModal('cart-modal');
}

// 5. Evento para cerrar modales al hacer clic en la X o fuera del contenido
function setupModalCloseListeners() {
    // Cerrar al hacer clic en X
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Cerrar al hacer clic fuera del contenido
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
}

// Funciones para abrir/cerrar modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    }
}

// 6. Inicializa el carrusel Swiper con autoplay, loop y paginación
function initSwiper() {
    const swiper = new Swiper('.swiper', {
        direction: 'horizontal',
        loop: true,
        speed: 600,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e67e22'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Botón para cerrar
    notification.querySelector('.close-notification').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

// Agregar estilos CSS para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .close-notification {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        line-height: 1;
        padding: 0;
        margin: 0;
    }
    .product-price-modal {
        font-size: 1.8rem;
        font-weight: bold;
        color: #e67e22;
        margin: 10px 0;
    }
`;
document.head.appendChild(style);

// ============================================
// FUNCIONES PARA EL FLUJO DE FINALIZACIÓN
// ============================================

// 1. Modal de zona/delivery
function openDeliveryModal() {
    const modal = document.getElementById('zone-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <button class="close-modal" aria-label="Cerrar">&times;</button>
        <h2>¿Cómo quieres recibir tu pedido?</h2>
        
        <div class="delivery-options">
            <div class="delivery-option" data-type="retiro">
                <h3>Retiro en local</h3>
                <p>Ven a recoger tu pedido en nuestro restaurante</p>
                <p class="delivery-cost">Sin costo adicional</p>
                <button class="btn btn-primary btn-select-delivery">Seleccionar</button>
            </div>
            
            <div class="delivery-option" data-type="delivery">
                <h3>Delivery a domicilio</h3>
                <p>Te llevamos tu pedido hasta la puerta de tu casa</p>
                <div class="zone-selection" style="display: none;">
                    <label for="zone-select">Selecciona tu zona:</label>
                    <select id="zone-select">
                        <option value="">-- Selecciona una zona --</option>
                        ${deliveryZones.map(zone => 
                            `<option value="${zone.id}" data-cost="${zone.cost}">${zone.name} (+$${zone.cost.toFixed(2)})</option>`
                        ).join('')}
                    </select>
                    <p class="zone-info" id="zone-info"></p>
                </div>
                <button class="btn btn-primary btn-select-delivery">Seleccionar</button>
            </div>
        </div>
    `;
    
    // Configurar event listeners
    setupDeliveryModalListeners();
    openModal('zone-modal');
}

function setupDeliveryModalListeners() {
    // Botones de selección de tipo de entrega
    document.querySelectorAll('.btn-select-delivery').forEach(button => {
        button.addEventListener('click', function() {
            const deliveryOption = this.closest('.delivery-option');
            const deliveryType = deliveryOption.getAttribute('data-type');
            
            if (deliveryType === 'retiro') {
                orderState.deliveryType = 'retiro';
                orderState.deliveryZone = null;
                orderState.deliveryCost = 0;
                calculateOrderTotals();
                closeModal(document.getElementById('zone-modal'));
                openCustomerModal();
            } else if (deliveryType === 'delivery') {
                const zoneSelect = document.getElementById('zone-select');
                const selectedZone = zoneSelect.value;
                
                if (!selectedZone) {
                    alert('Por favor selecciona una zona de delivery.');
                    return;
                }
                
                const selectedZoneData = deliveryZones.find(z => z.id === selectedZone);
                orderState.deliveryType = 'delivery';
                orderState.deliveryZone = selectedZoneData;
                orderState.deliveryCost = selectedZoneData.cost;
                calculateOrderTotals();
                closeModal(document.getElementById('zone-modal'));
                openCustomerModal();
            }
        });
    });
    
    // Mostrar/ocultar selección de zona para delivery
    document.querySelectorAll('.delivery-option').forEach(option => {
        option.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-select-delivery')) {
                const type = this.getAttribute('data-type');
                const zoneSelection = this.querySelector('.zone-selection');
                
                if (type === 'delivery') {
                    zoneSelection.style.display = 'block';
                }
                
                // Ocultar en otras opciones
                document.querySelectorAll('.delivery-option').forEach(other => {
                    if (other !== this) {
                        other.querySelector('.zone-selection').style.display = 'none';
                    }
                });
            }
        });
    });
    
    // Actualizar info de zona al seleccionar
    const zoneSelect = document.getElementById('zone-select');
    if (zoneSelect) {
        zoneSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const cost = selectedOption.getAttribute('data-cost');
            const zoneInfo = document.getElementById('zone-info');
            
            if (cost) {
                zoneInfo.textContent = `Costo de envío: $${parseFloat(cost).toFixed(2)}`;
                zoneInfo.style.color = '#e67e22';
                zoneInfo.style.fontWeight = 'bold';
            } else {
                zoneInfo.textContent = '';
            }
        });
    }
}

// 2. Modal de datos del cliente
function openCustomerModal() {
    const modal = document.getElementById('customer-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <button class="close-modal" aria-label="Cerrar">&times;</button>
        <h2>Tus datos de contacto</h2>
        
        <form id="customer-form">
            <div class="form-group">
                <label for="customer-name">Nombre completo *</label>
                <input type="text" id="customer-name" name="name" required placeholder="Ej: Juan Pérez">
                <small class="error-message" id="name-error" style="display: none; color: #e74c3c;"></small>
            </div>
            
            <div class="form-group">
                <label for="customer-phone">Teléfono *</label>
                <input type="tel" id="customer-phone" name="phone" required placeholder="Ej: 0412-1234567">
                <small class="error-message" id="phone-error" style="display: none; color: #e74c3c;"></small>
                <small class="hint">Formato: 0412-1234567, 4121234567, +584121234567</small>
            </div>
            
            <div class="form-group">
                <label for="customer-email">Email (opcional)</label>
                <input type="email" id="customer-email" name="email" placeholder="Ej: juan@email.com">
                <small class="error-message" id="email-error" style="display: none; color: #e74c3c;"></small>
            </div>
            
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="promo-consent" name="promo-consent">
                    <span>Deseo recibir promociones y ofertas especiales por WhatsApp</span>
                </label>
            </div>
            
            <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Continuar</button>
            </div>
        </form>
    `;
    
    // Configurar submit del formulario
    const form = document.getElementById('customer-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ocultar errores anteriores y remover clases de error
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
        
        // Remover clases de error de inputs
        document.querySelectorAll('#customer-form input').forEach(input => {
            input.classList.remove('error');
        });
        
        const customerData = {
            name: document.getElementById('customer-name').value.trim(),
            phone: document.getElementById('customer-phone').value.trim(),
            email: document.getElementById('customer-email').value.trim(),
            promoConsent: document.getElementById('promo-consent').checked
        };
        
        let isValid = true;
        
        // Validación de nombre
        const nameInput = document.getElementById('customer-name');
        if (!customerData.name) {
            document.getElementById('name-error').textContent = 'El nombre es obligatorio';
            document.getElementById('name-error').style.display = 'block';
            nameInput.classList.add('error');
            isValid = false;
        } else if (customerData.name.length < 2) {
            document.getElementById('name-error').textContent = 'El nombre debe tener al menos 2 caracteres';
            document.getElementById('name-error').style.display = 'block';
            nameInput.classList.add('error');
            isValid = false;
        }
        
        // Validación de teléfono
        const phoneInput = document.getElementById('customer-phone');
        if (!customerData.phone) {
            document.getElementById('phone-error').textContent = 'El teléfono es obligatorio';
            document.getElementById('phone-error').style.display = 'block';
            phoneInput.classList.add('error');
            isValid = false;
        } else if (!validatePhone(customerData.phone)) {
            document.getElementById('phone-error').textContent = 'Formato de teléfono inválido. Usa: 0412-1234567, 4121234567, +584121234567';
            document.getElementById('phone-error').style.display = 'block';
            phoneInput.classList.add('error');
            isValid = false;
        }
        
        // Validación de email (opcional)
        const emailInput = document.getElementById('customer-email');
        if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
            document.getElementById('email-error').textContent = 'Formato de email inválido';
            document.getElementById('email-error').style.display = 'block';
            emailInput.classList.add('error');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        orderState.customerData = customerData;
        closeModal(modal);
        openCrossSellModal();
    });
    
    openModal('customer-modal');
}

// 3. Modal de cross-sell
function openCrossSellModal() {
    const modal = document.getElementById('cross-sell-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <button class="close-modal" aria-label="Cerrar">&times;</button>
        <h2>¿Te gustaría agregar algo más?</h2>
        <p>Productos que combinan perfectamente con tu pedido:</p>
        
        <div class="cross-sell-grid">
            ${crossSellProducts.map(product => `
                <div class="cross-sell-item">
                    <h4>${product.name}</h4>
                    <p class="cross-sell-desc">${product.description}</p>
                    <p class="cross-sell-price">$${product.price.toFixed(2)}</p>
                    <button class="btn btn-small btn-add-cross-sell" data-product-id="${product.id}">
                        Agregar
                    </button>
                </div>
            `).join('')}
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-secondary" id="skip-cross-sell">Continuar sin agregar</button>
            <button class="btn btn-primary" id="continue-cross-sell">Continuar</button>
        </div>
    `;
    
    // Configurar event listeners
    setupCrossSellListeners();
    openModal('cross-sell-modal');
}

function setupCrossSellListeners() {
    // Botones para agregar productos cross-sell
    document.querySelectorAll('.btn-add-cross-sell').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            const product = crossSellProducts.find(p => p.id === productId);
            
            if (product) {
                addToCart(product, 1, {}, product.price);
                this.textContent = '✓ Agregado';
                this.disabled = true;
                this.classList.add('added');
                
                // Actualizar botón continuar
                const continueBtn = document.getElementById('continue-cross-sell');
                continueBtn.textContent = 'Continuar (' + cart.length + ' productos)';
            }
        });
    });
    
    // Botón para saltar cross-sell
    document.getElementById('skip-cross-sell').addEventListener('click', function() {
        closeModal(document.getElementById('cross-sell-modal'));
        completeOrder();
    });
    
    // Botón para continuar
    document.getElementById('continue-cross-sell').addEventListener('click', function() {
        closeModal(document.getElementById('cross-sell-modal'));
        completeOrder();
    });
}

// 4. Función para completar el pedido
function completeOrder() {
    // Calcular totales finales
    calculateOrderTotals();
    
    // Simular envío a Google Sheets (console.log)
    console.log('=== SIMULANDO ENVÍO A GOOGLE SHEETS ===');
    console.log('Datos del pedido:');
    console.log('- Cliente:', orderState.customerData.name);
    console.log('- Teléfono:', orderState.customerData.phone);
    console.log('- Email:', orderState.customerData.email || 'No proporcionado');
    console.log('- Tipo de entrega:', orderState.deliveryType === 'retiro' ? 'Retiro en local' : 'Delivery');
    if (orderState.deliveryZone) {
        console.log('- Zona:', orderState.deliveryZone.name);
        console.log('- Costo envío:', orderState.deliveryCost);
    }
    console.log('- Subtotal:', orderState.subtotal);
    console.log('- Total:', orderState.total);
    console.log('- Productos:', cart.length);
    cart.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name} x${item.quantity} - $${item.total.toFixed(2)}`);
    });
    console.log('=======================================');
    
    // Generar y enviar mensaje de WhatsApp
    sendWhatsAppOrder();
}

// 5. Función para sanitizar datos
function sanitizeData(data) {
    const sanitized = {};
    for (const key in data) {
        if (typeof data[key] === 'string') {
            // Escapar caracteres peligrosos
            sanitized[key] = data[key]
                .replace(/[<>"'&]/g, '')
                .trim()
                .substring(0, 500); // Limitar longitud
        } else {
            sanitized[key] = data[key];
        }
    }
    return sanitized;
}

// 6. Función para validar formato de teléfono
function validatePhone(phone) {
    // Acepta formatos: 04121234567, 4121234567, 0412-1234567, +584121234567
    const phoneRegex = /^(\+58)?(0?4(12|14|16|24|26|28)[-\s]?\d{7})$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// 7. Función para enviar datos a Google Sheets
async function saveToGoogleSheets(customerData, orderSummary) {
    try {
        // Sanitizar datos
        const sanitizedData = sanitizeData(customerData);
        
        // Preparar datos para enviar
        const payload = {
            timestamp: new Date().toISOString(),
            customer: sanitizedData,
            order: orderSummary,
            cart: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                options: item.options
            })),
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
        
        // Enviar a Google Sheets via Apps Script
        const response = await fetch(GOOGLE_SHEETS_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('✅ Datos enviados exitosamente a Google Sheets');
            return true;
        } else {
            console.warn('⚠️ Error al enviar a Google Sheets:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en saveToGoogleSheets:', error);
        return false;
    }
}

// 8. Función para generar y enviar mensaje de WhatsApp
async function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert('El carrito está vacío.');
        return;
    }
    
    if (!orderState.customerData) {
        alert('Faltan datos del cliente.');
        return;
    }
    
    // Primero intentar guardar en Google Sheets
    const orderSummary = {
        itemsCount: cart.length,
        subtotal: orderState.subtotal,
        deliveryCost: orderState.deliveryCost,
        total: orderState.total,
        timestamp: new Date().toISOString()
    };
    
    try {
        const savedToSheets = await saveToGoogleSheets(orderState.customerData, orderSummary);
        if (savedToSheets) {
            console.log('📊 Pedido guardado en Google Sheets');
        } else {
            console.log('⚠️ Pedido NO guardado en Google Sheets, continuando con WhatsApp...');
        }
    } catch (error) {
        console.error('Error al intentar guardar en Google Sheets:', error);
        // Continuar con WhatsApp aunque falle Google Sheets
    }
    
    // Verificar si la URL de Google Sheets está configurada
    if (GOOGLE_SHEETS_WEBHOOK.includes('YOUR_SCRIPT_ID')) {
        console.log('⚠️ URL de Google Sheets no configurada. Simulando envío...');
        console.log('=== SIMULANDO ENVÍO A GOOGLE SHEETS ===');
        console.log('Datos del pedido:');
        console.log('- Cliente:', orderState.customerData.name);
        console.log('- Teléfono:', orderState.customerData.phone);
        console.log('- Email:', orderState.customerData.email || 'No proporcionado');
        console.log('- Tipo de entrega:', orderState.deliveryType === 'retiro' ? 'Retiro en local' : 'Delivery');
        if (orderState.deliveryZone) {
            console.log('- Zona:', orderState.deliveryZone.name);
            console.log('- Costo envío:', orderState.deliveryCost);
        }
        console.log('- Subtotal:', orderState.subtotal);
        console.log('- Total:', orderState.total);
        console.log('- Productos:', cart.length);
        cart.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} x${item.quantity} - $${item.total.toFixed(2)}`);
            if (item.options) {
                if (item.options.meatDoneness) {
                    console.log(`     Término: ${item.options.meatDoneness}`);
                }
                if (item.options.removeItems && item.options.removeItems.length > 0) {
                    console.log(`     Quitar: ${item.options.removeItems.join(', ')}`);
                }
                if (item.options.extras && item.options.extras.length > 0) {
                    console.log(`     Extras: ${item.options.extras.map(e => e.name).join(', ')}`);
                }
                if (item.options.specialNotes) {
                    console.log(`     Notas: ${item.options.specialNotes}`);
                }
            }
        });
        console.log('=======================================');
    }
    
    // Construir mensaje claro y profesional
    let message = `*NUEVO PEDIDO - EL ESTABLO*%0A%0A`;
    
    // Datos del cliente
    message += `*Cliente:* ${orderState.customerData.name}%0A`;
    message += `*Teléfono:* ${orderState.customerData.phone}%0A`;
    if (orderState.customerData.email) {
        message += `*Email:* ${orderState.customerData.email}%0A`;
    }
    
    // Tipo de entrega
    if (orderState.deliveryType === 'retiro') {
        message += `*Tipo de entrega:* Retiro en local%0A`;
    } else {
        message += `*Tipo de entrega:* Delivery%0A`;
        message += `*Zona:* ${orderState.deliveryZone.name}%0A`;
        message += `*Costo de envío:* $${orderState.deliveryCost.toFixed(2)}%0A`;
    }
    
    message += `%0A*DETALLE DEL PEDIDO:*%0A`;
    
    // Productos con personalizaciones claras
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}* x${item.quantity} - $${item.total.toFixed(2)}%0A`;
        
        // Personalizaciones claras sin emojis
        if (item.options) {
            // Término de la carne
            if (item.options.meatDoneness) {
                const donenessMap = {
                    'medio': 'Medio',
                    'tres-cuartos': '3/4',
                    'bien-cocido': 'Bien cocido'
                };
                message += `   - Término: ${donenessMap[item.options.meatDoneness]}%0A`;
            }
            
            // Ingredientes para quitar
            if (item.options.removeItems && item.options.removeItems.length > 0) {
                const removeMap = {
                    'sin-cebolla': 'Sin cebolla',
                    'sin-salsas': 'Sin salsas'
                };
                const removeText = item.options.removeItems.map(item => removeMap[item] || item).join(', ');
                message += `   - Quitar: ${removeText}%0A`;
            }
            
            // Extras con precios
            if (item.options.extras && item.options.extras.length > 0) {
                const extraMap = {
                    'doble-tocino': 'Doble tocino',
                    'queso-fundido': 'Queso fundido'
                };
                const extrasText = item.options.extras.map(extra => {
                    const extraName = extraMap[extra.name] || extra.name;
                    return `${extraName} (+$${extra.price.toFixed(2)})`;
                }).join(', ');
                message += `   - Extras: ${extrasText}%0A`;
            }
            
            // Notas especiales
            if (item.options.specialNotes) {
                message += `   - Notas: ${item.options.specialNotes}%0A`;
            }
        }
        
        // Mostrar precio con extras si aplica
        if (item.price > item.basePrice) {
            message += `   - Precio base: $${item.basePrice.toFixed(2)} (con extras: $${item.price.toFixed(2)})%0A`;
        }
    });
    
    // Resumen de precios claro
    message += `%0A*RESUMEN DE PAGO:*%0A`;
    message += `Subtotal: $${orderState.subtotal.toFixed(2)}%0A`;
    if (orderState.deliveryCost > 0) {
        message += `Costo de envío: $${orderState.deliveryCost.toFixed(2)}%0A`;
    }
    message += `*TOTAL: $${orderState.total.toFixed(2)}*%0A%0A`;
    
    // Información adicional
    message += `Pedido generado desde la web de El Establo%0A`;
    message += `Hora: ${new Date().toLocaleTimeString('es-VE')}%0A`;
    message += `Fecha: ${new Date().toLocaleDateString('es-VE')}`;
    
    // Codificar mensaje
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Limpiar carrito y estado
    cart = [];
    orderState = {
        deliveryType: null,
        deliveryZone: null,
        deliveryCost: 0,
        customerData: null,
        subtotal: 0,
        total: 0
    };
    
    // Actualizar UI
    updateCartUI();
    updateCartModal();
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Mostrar confirmación
    showNotification('¡Pedido enviado por WhatsApp!', 'success');
}

// ============================================
// FUNCIONES PARA EL POP-UP DE ENTRADA
// ============================================

// Producto promocional del día
const dailyPromoProduct = {
    id: 'promo_dia',
    name: 'Costillas BBQ con papas',
    price: 10.00,
    description: 'Costillas BBQ con papas fritas -20% de descuento',
    category: 'promos',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
};

// Función para mostrar el pop-up de entrada
function showEntryPopup() {
    // Verificar si ya se mostró en esta sesión
    const popupShown = sessionStorage.getItem('entryPopupShown');
    
    if (!popupShown) {
        // Mostrar pop-up después de 1 segundo
        setTimeout(() => {
            const popup = document.getElementById('entry-popup');
            if (popup) {
                openModal('entry-popup');
                
                // Configurar botón "Personalizar y agregar"
                const customizeBtn = document.getElementById('customize-promo-popup');
                if (customizeBtn) {
                    customizeBtn.addEventListener('click', function() {
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                        // Abrir modal de personalización para el producto promocional
                        openCustomizeModal(dailyPromoProduct);
                    });
                }
                
                // Configurar botón "Agregar sin personalizar"
                const addBtn = document.getElementById('add-promo-popup');
                if (addBtn) {
                    addBtn.addEventListener('click', function() {
                        addToCart(dailyPromoProduct, 1, {}, dailyPromoProduct.price);
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                        showNotification('Producto promocional agregado al carrito');
                    });
                }
                
                // Configurar botón "Cerrar"
                const closeBtn = document.getElementById('close-popup');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                    });
                }
                
                // Configurar botón de cerrar (X)
                const closeXBtn = popup.querySelector('.close-modal');
                if (closeXBtn) {
                    closeXBtn.addEventListener('click', function() {
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                    });
                }
                
                // Cerrar al hacer clic fuera del contenido
                popup.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                    }
                });
            }
        }, 1000);
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // 6. Inicializar Swiper
    initSwiper();
    
    // 2. Renderizar productos
    renderProducts();
    
    // 4. Configurar evento del ícono del carrito
    setupCartIconListener();
    
    // 5. Configurar eventos para cerrar modales
    setupModalCloseListeners();
    
    // Configurar botón "Finalizar pedido" en el carrito
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                openDeliveryModal();
            } else {
                alert('El carrito está vacío. Agrega productos primero.');
            }
        });
    }
    
    // Configurar botones "Ordenar ahora" en el hero
    document.querySelectorAll('.btn-hero').forEach(button => {
        button.addEventListener('click', function() {
            alert('Redirigiendo a la sección de promociones...');
            document.getElementById('promos').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Configurar formulario de reservaciones
    setupReservationForm();
    
    // Inicializar contador del carrito
    updateCartUI();
    
    // Mostrar pop-up de entrada
    showEntryPopup();
    
    console.log('El Establo - Página cargada correctamente');
    console.log('Productos cargados:', Object.keys(products).reduce((acc, cat) => acc + products[cat].length, 0));
});

// ============================================
// FUNCIONES PARA RESERVACIONES
// ============================================

// Configurar formulario de reservaciones
function setupReservationForm() {
    const reservationForm = document.getElementById('reservation-form');
    if (!reservationForm) return;
    
    // Configurar fecha mínima (hoy)
    const dateInput = document.getElementById('reservation-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    reservationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ocultar errores anteriores y remover clases de error
        document.querySelectorAll('#reservation-form .error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        document.querySelectorAll('#reservation-form input, #reservation-form select').forEach(input => {
            input.classList.remove('error');
        });
        
        // Obtener datos del formulario
        const reservationData = {
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
        
        let isValid = true;
        
        // Validación de nombre
        const nameInput = document.getElementById('reservation-name');
        if (!reservationData.name) {
            document.getElementById('reservation-name-error').textContent = 'El nombre es obligatorio';
            document.getElementById('reservation-name-error').style.display = 'block';
            nameInput.classList.add('error');
            isValid = false;
        } else if (reservationData.name.length < 2) {
            document.getElementById('reservation-name-error').textContent = 'El nombre debe tener al menos 2 caracteres';
            document.getElementById('reservation-name-error').style.display = 'block';
            nameInput.classList.add('error');
            isValid = false;
        }
        
        // Validación de teléfono
        const phoneInput = document.getElementById('reservation-phone');
        if (!reservationData.phone) {
            document.getElementById('reservation-phone-error').textContent = 'El teléfono es obligatorio';
            document.getElementById('reservation-phone-error').style.display = 'block';
            phoneInput.classList.add('error');
            isValid = false;
        } else if (!validatePhone(reservationData.phone)) {
            document.getElementById('reservation-phone-error').textContent = 'Formato de teléfono inválido. Usa: 0412-1234567, 4121234567, +584121234567';
            document.getElementById('reservation-phone-error').style.display = 'block';
            phoneInput.classList.add('error');
            isValid = false;
        }
        
        // Validación de fecha
        const dateInput = document.getElementById('reservation-date');
        if (!reservationData.date) {
            document.getElementById('reservation-date-error').textContent = 'La fecha es obligatoria';
            document.getElementById('reservation-date-error').style.display = 'block';
            dateInput.classList.add('error');
            isValid = false;
        }
        
        // Validación de número de personas
        const peopleInput = document.getElementById('reservation-people');
        if (!reservationData.people) {
            document.getElementById('reservation-people-error').textContent = 'El número de personas es obligatorio';
            document.getElementById('reservation-people-error').style.display = 'block';
            peopleInput.classList.add('error');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        // Deshabilitar botón de envío
        const submitBtn = reservationForm.querySelector('.btn-reservation');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        submitBtn.disabled = true;
        
        try {
            // Guardar en Google Sheets
            const savedToSheets = await saveReservationToSheets(reservationData);
            
            if (savedToSheets) {
                console.log('✅ Reserva guardada en Google Sheets');
                
                // Generar y enviar mensaje de WhatsApp
                sendReservationWhatsApp(reservationData);
                
                // Mostrar mensaje de éxito
                showNotification('¡Reserva solicitada exitosamente! Te contactaremos para confirmar.', 'success');
                
                // Limpiar formulario
                reservationForm.reset();
                
                // Restablecer fecha mínima
                if (dateInput) {
                    const today = new Date().toISOString().split('T')[0];
                    dateInput.min = today;
                }
            } else {
                showNotification('Error al guardar la reserva. Por favor, intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error en el proceso de reserva:', error);
            showNotification('Ocurrió un error. Por favor, intenta nuevamente.', 'error');
        } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Función para guardar reserva en Google Sheets
async function saveReservationToSheets(reservationData) {
    try {
        // Sanitizar datos
        const sanitizedData = sanitizeData(reservationData);
        
        // Preparar datos para enviar
        const payload = {
            ...sanitizedData,
            tipo: 'reserva'
        };
        
        // Enviar a Google Sheets via Apps Script
        const response = await fetch(GOOGLE_SHEETS_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('✅ Reserva enviada exitosamente a Google Sheets');
            return true;
        } else {
            console.warn('⚠️ Error al enviar reserva a Google Sheets:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en saveReservationToSheets:', error);
        return false;
    }
}

// Función para enviar reserva por WhatsApp
function sendReservationWhatsApp(reservationData) {
    // Mapear tipo de evento
    const eventMap = {
        'cumpleaños': 'Cumpleaños',
        'aniversario': 'Aniversario',
        'corporativo': 'Corporativo',
        'cena-privada': 'Cena privada',
        'otro': 'Otro'
    };
    
    // Formatear fecha
    const date = new Date(reservationData.date);
    const formattedDate = date.toLocaleDateString('es-VE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Construir mensaje claro y profesional
    let message = `*NUEVA SOLICITUD DE RESERVA - EL ESTABLO*%0A%0A`;
    
    // Datos de la reserva
    message += `*Cliente:* ${reservationData.name}%0A`;
    message += `*Teléfono:* ${reservationData.phone}%0A`;
    message += `*Fecha:* ${formattedDate}%0A`;
    message += `*Personas:* ${reservationData.people} ${reservationData.people === '10' ? '+' : ''} personas%0A`;
    
    if (reservationData.event) {
        message += `*Tipo de evento:* ${eventMap[reservationData.event] || reservationData.event}%0A`;
    }
    
    if (reservationData.notes) {
        message += `*Notas especiales:* ${reservationData.notes}%0A`;
    }
    
    message += `*Consentimiento promociones:* ${reservationData.promoConsent ? 'Sí' : 'No'}%0A`;
    
    // Información adicional
    message += `%0A*INFORMACIÓN ADICIONAL:*%0A`;
    message += `Solicitud generada desde la web de El Establo%0A`;
    message += `Hora de solicitud: ${new Date().toLocaleTimeString('es-VE')}%0A`;
    message += `Fecha de solicitud: ${new Date().toLocaleDateString('es-VE')}%0A`;
    message += `ID de reserva: RES-${Date.now().toString().slice(-6)}`;
    
    // Simular envío a Google Sheets si la URL no está configurada
    console.log('=== SIMULANDO ENVÍO DE RESERVA A GOOGLE SHEETS ===');
    console.log('Datos de la reserva:');
    console.log('- Cliente:', reservationData.name);
    console.log('- Teléfono:', reservationData.phone);
    console.log('- Fecha:', formattedDate);
    console.log('- Personas:', reservationData.people);
    console.log('- Evento:', reservationData.event || 'No especificado');
    console.log('- Notas:', reservationData.notes || 'Sin notas');
    console.log('- Consentimiento promociones:', reservationData.promoConsent ? 'Sí' : 'No');
    console.log('- ID de reserva:', 'RES-' + Date.now().toString().slice(-6));
    console.log('==================================================');
    
    // Verificar si la URL de Google Sheets está configurada
    if (GOOGLE_SHEETS_WEBHOOK.includes('YOUR_SCRIPT_ID')) {
        console.log('⚠️ URL de Google Sheets no configurada. Simulando envío...');
    }
    
    // Codificar mensaje
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
}
