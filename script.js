// 1. Función para sanitizar texto para el DOM
function sanitizeHTML(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Datos cargados desde JSON
let products = {};

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

function normalizeCartItem(item) {
    if (!item || typeof item !== 'object') return null;
    if (typeof item.name !== 'string' || !item.name) return null;
    if (typeof item.price !== 'number' || !isFinite(item.price)) return null;
    const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const basePrice = Number.isFinite(item.basePrice) ? item.basePrice : item.price;
    const total = Number.isFinite(item.total) ? item.total : item.price * safeQuantity;
    
    return {
        id: item.id || Date.now(),
        productId: item.productId || null,
        name: item.name,
        price: item.price,
        basePrice: basePrice,
        quantity: safeQuantity,
        options: item.options || {},
        total: total
    };
}

function saveCartToStorage() {
    try {
        if (cart.length === 0) {
            localStorage.removeItem(CART_STORAGE_KEY);
            return;
        }
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.warn('No se pudo guardar el carrito en localStorage', error);
    }
}

function loadCartFromStorage() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        const normalized = parsed.map(normalizeCartItem).filter(Boolean);
        normalized.forEach(updateCartItemTotals);
        cart = normalized;
    } catch (error) {
        console.warn('No se pudo cargar el carrito desde localStorage', error);
    }
}

function updateCartItemTotals(item) {
    item.total = item.price * item.quantity;
}

// Persistencia local
const CART_STORAGE_KEY = 'establo_cart_v1';

// Configuración cargada desde JSON
let WHATSAPP_NUMBER = '';
let GOOGLE_SHEETS_WEBHOOK = '';
let deliveryZones = [];
let crossSellProducts = [];
let dailyPromoProduct = null;

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
    showCartToast(product, cartItem);
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

function changeCartQuantity(index, delta) {
    const item = cart[index];
    if (!item) return;
    const nextQty = item.quantity + delta;
    if (nextQty <= 0) {
        removeFromCart(index);
        return;
    }
    item.quantity = nextQty;
    updateCartItemTotals(item);
    updateCartUI();
}

// Función para actualizar la UI del carrito
function updateCartUI() {
    // Actualizar contador del ícono
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    saveCartToStorage();
    
    // Actualizar modal del carrito si está abierto
    updateCartModal();
}

// Función para actualizar el modal del carrito (ampliada para mostrar opciones)
function updateCartModal() {
    const cartBody = document.querySelector('.cart-body');
    const emptyCart = document.querySelector('.empty-cart');
    const cartTotalElement = document.getElementById('cart-total');
    
    calculateOrderTotals();
    
    if (cart.length === 0) {
        cartBody.innerHTML = '<p class="empty-cart">El carrito está vacío.</p>';
        cartTotalElement.textContent = 'REF 0.00';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    cartTotalElement.textContent = `REF ${total.toFixed(2)}`;
    
    let cartHTML = `
        <div class="cart-panel">
            <div class="cart-panel-header">
                <h3>Carrito</h3>
                <button class="close-modal" aria-label="Cerrar carrito">×</button>
            </div>
            
            <div class="cart-panel-info">
                <div class="cart-info-row">
                    <span>Entregar en:</span>
                    <a href="#" class="cart-link">Ingresa tu ubicación</a>
                </div>
                <div class="cart-info-row">
                    <span>Cuando:</span>
                    <span>De inmediato</span>
                </div>
            </div>
            
            <div class="cart-alert">
                <strong>Selecciona tu ubicación para continuar</strong>
                <span>Necesitamos saber dónde enviar tu pedido</span>
            </div>
    `;
    
    cartHTML += '<div class="cart-items">';
    
    cart.forEach((item, index) => {
        const product = findProductById(item.productId) || {};
        const image = product.image || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
        let optionsText = '';
        if (item.options) {
            const parts = [];
            if (item.options.extras && item.options.extras.length > 0) {
                parts.push(item.options.extras.map(e => e.name).join(', '));
            }
            if (item.options.removeItems && item.options.removeItems.length > 0) {
                parts.push(item.options.removeItems.join(', '));
            }
            if (item.options.specialNotes) {
                parts.push(item.options.specialNotes);
            }
            optionsText = parts.join(' · ');
        }
        
        cartHTML += `
            <div class="cart-item kfc-style" data-index="${index}">
                <img src="${image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-main">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-sub">${sanitizeHTML(optionsText)}</div>
                    <div class="cart-item-actions">
                        <button class="link-btn btn-remove" data-index="${index}">Eliminar</button>
                    </div>
                </div>
                <div class="cart-item-right">
                    <div class="cart-item-price">REF ${item.total.toFixed(2)}</div>
                    <div class="cart-item-quantity" aria-label="Cantidad">
                        <button class="btn-quantity" data-index="${index}" data-delta="-1" aria-label="Disminuir cantidad">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-quantity" data-index="${index}" data-delta="1" aria-label="Aumentar cantidad">+</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartHTML += '</div>';
    
    cartHTML += `
        <button class="btn-clear-cart" id="clear-cart">Vaciar carrito</button>
        <div class="cart-utensils">
            <label class="utensils-toggle">
                <span>¿Quieres añadir utensilios?</span>
                <input type="checkbox" id="utensils-toggle">
                <span class="switch"></span>
            </label>
            <div class="utensils-list">
                <label><input type="checkbox"> Salsas</label>
                <label><input type="checkbox"> Cubiertos</label>
                <label><input type="checkbox"> Servilletas</label>
            </div>
        </div>
        
        <div class="cart-summary">
            <div class="summary-row"><span>Subtotal</span><span>REF ${orderState.subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span>Envío</span><span>REF ${orderState.deliveryCost.toFixed(2)}</span></div>
            <div class="summary-row total"><span>Total del pedido</span><span>REF ${orderState.total.toFixed(2)}</span></div>
        </div>
    `;
    
    cartHTML += `
        <div class="cart-footer">
            <button class="btn btn-primary" id="checkout-btn">Ir a pagar</button>
            <span class="cart-footer-total">REF ${orderState.total.toFixed(2)}</span>
        </div>
        </div>
    `;
    
    cartBody.innerHTML = cartHTML;
    
    // Agregar event listeners a los botones de eliminar
    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
    
    document.querySelectorAll('.btn-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const delta = parseInt(this.getAttribute('data-delta'));
            changeCartQuantity(index, delta);
        });
    });

    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            cart = [];
            updateCartUI();
        });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
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

async function loadMenuData() {
    try {
        const response = await fetch('data/menu.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        products = data.products || {};
        WHATSAPP_NUMBER = data.whatsappNumber || '';
        GOOGLE_SHEETS_WEBHOOK = data.googleSheetsWebhook || '';
        deliveryZones = data.deliveryZones || [];
        crossSellProducts = data.crossSellProducts || [];
        dailyPromoProduct = data.dailyPromoProduct || null;
        return true;
    } catch (error) {
        console.error('Error cargando menu.json:', error);
        showNotification('No se pudo cargar el menú. Intenta recargar.', 'error');
        return false;
    }
}

// 7. Modal de personalización ampliado
function openCustomizeModal(product) {
    const modal = document.getElementById('customize-modal');
    const customizeBody = modal.querySelector('.customize-body');
    
    customizeBody.innerHTML = `
        <div class="customize-header">
            <h3>${product.name}</h3>
            <p class="product-price-modal">REF ${product.price.toFixed(2)}</p>
        </div>
        <div class="customize-layout">
            <div class="customize-left">
                <img src="${product.image}" alt="${product.name}" class="customize-image">
                <p class="customize-desc">${product.description}</p>
            </div>
            <div class="customize-right">
                <div class="customize-options">
                    <div class="option-section">
                        <div class="option-section-header">
                            <div>
                                <h4>Sabor de la salsa 4oz (app)</h4>
                                <p class="option-required">Es necesario elegir uno</p>
                            </div>
                            <span class="option-counter">0 / 1</span>
                        </div>
                        <div class="option-list">
                            <input type="radio" id="meat-medio" name="meat-doneness" value="medio" checked>
                            <label for="meat-medio" class="option-pill">
                                <span class="option-text">Salsa secreta 4oz</span>
                                <span class="option-indicator"></span>
                            </label>
                            
                            <input type="radio" id="meat-tres-cuartos" name="meat-doneness" value="tres-cuartos">
                            <label for="meat-tres-cuartos" class="option-pill">
                                <span class="option-text">Salsa búfalo 4oz</span>
                                <span class="option-indicator"></span>
                            </label>
                            
                            <input type="radio" id="meat-bien-cocido" name="meat-doneness" value="bien-cocido">
                            <label for="meat-bien-cocido" class="option-pill">
                                <span class="option-text">Salsa miel mostaza 4oz</span>
                                <span class="option-indicator"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="option-section">
                        <div class="option-section-header">
                            <div>
                                <h4>Para quitar</h4>
                            </div>
                        </div>
                        <div class="option-list">
                            <input type="checkbox" id="remove-onion" name="remove-onion" value="sin-cebolla">
                            <label for="remove-onion" class="option-pill">
                                <span class="option-text">Sin cebolla</span>
                                <span class="option-indicator"></span>
                            </label>
                            
                            <input type="checkbox" id="remove-sauces" name="remove-sauces" value="sin-salsas">
                            <label for="remove-sauces" class="option-pill">
                                <span class="option-text">Sin salsas</span>
                                <span class="option-indicator"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="option-section">
                        <div class="option-section-header">
                            <div>
                                <h4>Extras</h4>
                            </div>
                        </div>
                        <div class="option-list">
                            <input type="checkbox" id="extra-bacon" name="extra-bacon" value="doble-tocino" data-price="1.50">
                            <label for="extra-bacon" class="option-pill">
                                <span class="option-text">Doble tocino</span>
                                <span class="option-price-inline">+REF 1.50</span>
                                <span class="option-indicator"></span>
                            </label>
                            
                            <input type="checkbox" id="extra-cheese" name="extra-cheese" value="queso-fundido" data-price="1.00">
                            <label for="extra-cheese" class="option-pill">
                                <span class="option-text">Queso fundido</span>
                                <span class="option-price-inline">+REF 1.00</span>
                                <span class="option-indicator"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="option-section notes-section">
                        <label for="special-notes" class="notes-label">Comentarios del producto</label>
                        <textarea id="special-notes" class="notes-textarea" placeholder="Preferencias, alergias o tus comentarios" rows="3"></textarea>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalActions = modal.querySelector('.modal-actions');
    modalActions.innerHTML = `
        <div class="sticky-actions">
            <div class="qty-stepper" aria-label="Cantidad">
                <button class="qty-btn" type="button" id="qty-minus">-</button>
                <span id="qty-value">1</span>
                <button class="qty-btn" type="button" id="qty-plus">+</button>
            </div>
            <button class="btn btn-primary" type="button" id="customize-add">Agregar REF ${product.price.toFixed(2)}</button>
        </div>
    `;
    
    // Configurar botón de agregar al carrito
    const addButton = modal.querySelector('#customize-add');
    addButton.onclick = function() {
        const options = getCustomizationOptions();
        const finalPrice = calculateFinalPrice(product.price, options);
        const qty = parseInt(document.getElementById('qty-value').textContent, 10) || 1;
        
        addToCart(product, qty, options, finalPrice);
        closeModal(modal);
    };

    const qtyMinus = modal.querySelector('#qty-minus');
    const qtyPlus = modal.querySelector('#qty-plus');
    const qtyValue = modal.querySelector('#qty-value');
    qtyMinus.addEventListener('click', function() {
        const current = parseInt(qtyValue.textContent, 10) || 1;
        qtyValue.textContent = Math.max(1, current - 1);
    });
    qtyPlus.addEventListener('click', function() {
        const current = parseInt(qtyValue.textContent, 10) || 1;
        qtyValue.textContent = current + 1;
    });
    
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
        const addButton = document.getElementById('customize-add');
        if (addButton) {
            addButton.textContent = `Agregar REF ${finalPrice.toFixed(2)}`;
        }
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
    const cartIcon = document.getElementById('cart-icon');
    if (!cartIcon) return;
    
    cartIcon.addEventListener('click', function() {
        openCartModal();
    });
    
    cartIcon.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCartModal();
        }
    });
}

// Función para abrir modal del carrito
function openCartModal() {
    updateCartModal();
    openModal('cart-modal');
}

// 5. Evento para cerrar modales al hacer clic en la X o fuera del contenido
function setupModalCloseListeners() {
    // Cerrar al hacer clic en X (delegado para modales dinámicos)
    document.addEventListener('click', function(e) {
        const closeButton = e.target.closest('.close-modal');
        if (!closeButton) return;
        const modal = closeButton.closest('.modal');
        closeModal(modal);
    });
    
    // Cerrar al hacer clic fuera del contenido
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal);
        }
    });
}

// Funciones para abrir/cerrar modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }
}

// 6. Inicializa el carrusel Swiper con autoplay, loop y paginación
function initSwiper() {
    if (!document.querySelector('.swiper')) return;
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
    notification.className = `notification notification--${type}`;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-notification';
    closeButton.setAttribute('aria-label', 'Cerrar notificación');
    closeButton.textContent = '×';
    
    notification.appendChild(messageSpan);
    notification.appendChild(closeButton);
    document.body.appendChild(notification);
    
    const removeNotification = () => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    };
    
    // Botón para cerrar
    closeButton.addEventListener('click', function() {
        notification.classList.add('notification--hide');
        notification.addEventListener('animationend', removeNotification, { once: true });
    });
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
        if (!document.body.contains(notification)) return;
        notification.classList.add('notification--hide');
        notification.addEventListener('animationend', removeNotification, { once: true });
    }, 4000);
}

function showCartToast(product, cartItem) {
    const existing = document.querySelector('.cart-toast');
    if (existing) existing.remove();
    
    calculateOrderTotals();
    
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    const image = product.image || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
    
    toast.innerHTML = `
        <div class="cart-toast-header">
            <strong>Has añadido a tu carrito</strong>
            <button class="cart-toast-close" aria-label="Cerrar">×</button>
        </div>
        <div class="cart-toast-body">
            <img src="${image}" alt="${product.name}">
            <div>
                <div class="cart-toast-title">${product.name}</div>
                <div class="cart-toast-sub">x${cartItem.quantity} · REF ${cartItem.total.toFixed(2)}</div>
            </div>
        </div>
        <button class="cart-toast-cta" id="open-cart-toast">
            <span>Ver carrito</span>
            <span>REF ${orderState.total.toFixed(2)}</span>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    toast.querySelector('.cart-toast-close').addEventListener('click', () => toast.remove());
    toast.querySelector('#open-cart-toast').addEventListener('click', () => {
        toast.remove();
        openCartModal();
    });
    
    setTimeout(() => {
        if (document.body.contains(toast)) toast.remove();
    }, 5000);
}

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
                <div class="zone-selection is-hidden">
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
                    showNotification('Por favor selecciona una zona de delivery.', 'error');
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
                    zoneSelection.classList.remove('is-hidden');
                }
                
                // Ocultar en otras opciones
                document.querySelectorAll('.delivery-option').forEach(other => {
                    if (other !== this) {
                        const otherZoneSelection = other.querySelector('.zone-selection');
                        if (otherZoneSelection) {
                            otherZoneSelection.classList.add('is-hidden');
                        }
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
                zoneInfo.classList.add('is-active');
            } else {
                zoneInfo.textContent = '';
                zoneInfo.classList.remove('is-active');
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
            el.classList.remove('is-visible');
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
            document.getElementById('name-error').classList.add('is-visible');
            nameInput.classList.add('error');
            isValid = false;
        } else if (customerData.name.length < 2) {
            document.getElementById('name-error').textContent = 'El nombre debe tener al menos 2 caracteres';
            document.getElementById('name-error').classList.add('is-visible');
            nameInput.classList.add('error');
            isValid = false;
        }
        
        // Validación de teléfono
        const phoneInput = document.getElementById('customer-phone');
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
        
        // Validación de email (opcional)
        const emailInput = document.getElementById('customer-email');
        if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
            document.getElementById('email-error').textContent = 'Formato de email inválido';
            document.getElementById('email-error').classList.add('is-visible');
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

async function fetchWithRetry(url, options, config = {}) {
    const retries = Number.isFinite(config.retries) ? config.retries : 2;
    const backoffMs = Number.isFinite(config.backoffMs) ? config.backoffMs : 600;
    const timeoutMs = Number.isFinite(config.timeoutMs) ? config.timeoutMs : 8000;
    let lastError = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                return response;
            }
            
            if (response.status < 500) {
                return response;
            }
            
            lastError = new Error(`HTTP ${response.status}`);
        } catch (error) {
            lastError = error;
        } finally {
            clearTimeout(timeoutId);
        }
        
        if (attempt < retries) {
            const delay = backoffMs * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError || new Error('Request failed');
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
        const response = await fetchWithRetry(GOOGLE_SHEETS_WEBHOOK, {
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
        showNotification('El carrito está vacío.', 'error');
        return;
    }
    
    if (!orderState.customerData) {
        showNotification('Faltan datos del cliente.', 'error');
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
    let message = `*NUEVO PEDIDO - EL ESTABLO*\n\n`;
    
    // Datos del cliente
    message += `*Cliente:* ${orderState.customerData.name}\n`;
    message += `*Teléfono:* ${orderState.customerData.phone}\n`;
    if (orderState.customerData.email) {
        message += `*Email:* ${orderState.customerData.email}\n`;
    }
    
    // Tipo de entrega
    if (orderState.deliveryType === 'retiro') {
        message += `*Tipo de entrega:* Retiro en local\n`;
    } else {
        message += `*Tipo de entrega:* Delivery\n`;
        message += `*Zona:* ${orderState.deliveryZone.name}\n`;
        message += `*Costo de envío:* $${orderState.deliveryCost.toFixed(2)}\n`;
    }
    
    message += `\n*DETALLE DEL PEDIDO:*\n`;
    
    // Productos con personalizaciones claras
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}* x${item.quantity} - $${item.total.toFixed(2)}\n`;
        
        // Personalizaciones claras sin emojis
        if (item.options) {
            // Término de la carne
            if (item.options.meatDoneness) {
                const donenessMap = {
                    'medio': 'Medio',
                    'tres-cuartos': '3/4',
                    'bien-cocido': 'Bien cocido'
                };
                message += `   - Término: ${donenessMap[item.options.meatDoneness]}\n`;
            }
            
            // Ingredientes para quitar
            if (item.options.removeItems && item.options.removeItems.length > 0) {
                const removeMap = {
                    'sin-cebolla': 'Sin cebolla',
                    'sin-salsas': 'Sin salsas'
                };
                const removeText = item.options.removeItems.map(item => removeMap[item] || item).join(', ');
                message += `   - Quitar: ${removeText}\n`;
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
                message += `   - Extras: ${extrasText}\n`;
            }
            
            // Notas especiales
            if (item.options.specialNotes) {
                message += `   - Notas: ${item.options.specialNotes}\n`;
            }
        }
        
        // Mostrar precio con extras si aplica
        if (item.price > item.basePrice) {
            message += `   - Precio base: $${item.basePrice.toFixed(2)} (con extras: $${item.price.toFixed(2)})\n`;
        }
    });
    
    // Resumen de precios claro
    message += `\n*RESUMEN DE PAGO:*\n`;
    message += `Subtotal: $${orderState.subtotal.toFixed(2)}\n`;
    if (orderState.deliveryCost > 0) {
        message += `Costo de envío: $${orderState.deliveryCost.toFixed(2)}\n`;
    }
    message += `*TOTAL: $${orderState.total.toFixed(2)}*\n\n`;
    
    // Información adicional
    message += `Pedido generado desde la web de El Establo\n`;
    message += `Hora: ${new Date().toLocaleTimeString('es-VE')}\n`;
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

// Producto promocional del día se carga desde JSON

// Función para mostrar el pop-up de entrada
function showEntryPopup() {
    // Verificar si ya se mostró en esta sesión
    const popupShown = sessionStorage.getItem('entryPopupShown');
    
    if (!popupShown && dailyPromoProduct) {
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

                // Imagen de la promo
                const popupImage = document.getElementById('popup-image');
                if (popupImage) {
                    popupImage.src = dailyPromoProduct.image;
                    popupImage.alt = dailyPromoProduct.name;
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
    initApp();
});

async function initApp() {
    // 6. Inicializar Swiper
    initSwiper();
    
    const loaded = await loadMenuData();
    if (loaded) {
        renderProducts();
    }
    
    // 4. Configurar evento del ícono del carrito
    setupCartIconListener();
    
    // 5. Configurar eventos para cerrar modales
    setupModalCloseListeners();
    
    // Configurar botones "Ordenar ahora" en el hero
    document.querySelectorAll('.btn-hero').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('promos').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Botones de acción debajo del hero
    const scrollPromosBtn = document.getElementById('hero-scroll-promos');
    if (scrollPromosBtn) {
        scrollPromosBtn.addEventListener('click', function() {
            document.getElementById('promos').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    const heroOpenCartBtn = document.getElementById('hero-open-cart');
    if (heroOpenCartBtn) {
        heroOpenCartBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                openCartModal();
            } else {
                showNotification('El carrito está vacío. Agrega productos primero.', 'error');
            }
        });
    }
    
    // Configurar formulario de reservaciones
    setupReservationForm();
    
    // Cargar carrito desde localStorage
    loadCartFromStorage();
    
    // Inicializar contador del carrito
    updateCartUI();
    
    // Mostrar pop-up de entrada
    showEntryPopup();
    
    console.log('El Establo - Página cargada correctamente');
    console.log('Productos cargados:', Object.keys(products).reduce((acc, cat) => acc + products[cat].length, 0));

    // Botón volver arriba
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        const toggleBackToTop = () => {
            if (window.scrollY > 400) {
                backToTop.classList.add('is-visible');
            } else {
                backToTop.classList.remove('is-visible');
            }
        };
        toggleBackToTop();
        window.addEventListener('scroll', toggleBackToTop);
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Tabs de menú visibles siempre
    const stickyNav = document.querySelector('.sticky-nav');
    if (stickyNav) {
        stickyNav.classList.add('is-visible');
    }
}

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
            el.classList.remove('is-visible');
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
            document.getElementById('reservation-name-error').classList.add('is-visible');
            nameInput.classList.add('error');
            isValid = false;
        } else if (reservationData.name.length < 2) {
            document.getElementById('reservation-name-error').textContent = 'El nombre debe tener al menos 2 caracteres';
            document.getElementById('reservation-name-error').classList.add('is-visible');
            nameInput.classList.add('error');
            isValid = false;
        }
        
        // Validación de teléfono
        const phoneInput = document.getElementById('reservation-phone');
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
        
        // Validación de fecha
        const dateInput = document.getElementById('reservation-date');
        if (!reservationData.date) {
            document.getElementById('reservation-date-error').textContent = 'La fecha es obligatoria';
            document.getElementById('reservation-date-error').classList.add('is-visible');
            dateInput.classList.add('error');
            isValid = false;
        }
        
        // Validación de número de personas
        const peopleInput = document.getElementById('reservation-people');
        if (!reservationData.people) {
            document.getElementById('reservation-people-error').textContent = 'El número de personas es obligatorio';
            document.getElementById('reservation-people-error').classList.add('is-visible');
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
        const response = await fetchWithRetry(GOOGLE_SHEETS_WEBHOOK, {
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
    let message = `*NUEVA SOLICITUD DE RESERVA - EL ESTABLO*\n\n`;
    
    // Datos de la reserva
    message += `*Cliente:* ${reservationData.name}\n`;
    message += `*Teléfono:* ${reservationData.phone}\n`;
    message += `*Fecha:* ${formattedDate}\n`;
    message += `*Personas:* ${reservationData.people} ${reservationData.people === '10' ? '+' : ''} personas\n`;
    
    if (reservationData.event) {
        message += `*Tipo de evento:* ${eventMap[reservationData.event] || reservationData.event}\n`;
    }
    
    if (reservationData.notes) {
        message += `*Notas especiales:* ${reservationData.notes}\n`;
    }
    
    message += `*Consentimiento promociones:* ${reservationData.promoConsent ? 'Sí' : 'No'}\n`;
    
    // Información adicional
    message += `\n*INFORMACIÓN ADICIONAL:*\n`;
    message += `Solicitud generada desde la web de El Establo\n`;
    message += `Hora de solicitud: ${new Date().toLocaleTimeString('es-VE')}\n`;
    message += `Fecha de solicitud: ${new Date().toLocaleDateString('es-VE')}\n`;
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
