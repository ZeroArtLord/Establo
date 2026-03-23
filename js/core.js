// Core state and helpers
var products = {};
var cart = [];
var orderState = {
    deliveryType: null,
    deliveryZone: null,
    deliveryCost: 0,
    customerData: null,
    subtotal: 0,
    total: 0
};

var WHATSAPP_NUMBER = '';
var GOOGLE_SHEETS_WEBHOOK = '';
var deliveryZones = [];
var crossSellProducts = [];
var dailyPromoProduct = null;

var CART_STORAGE_KEY = 'establo_cart_v1';

function sanitizeHTML(text) {
    if (typeof text !== 'string') return text;
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function normalizeCartItem(item) {
    if (!item || typeof item !== 'object') return null;
    if (typeof item.name !== 'string' || !item.name) return null;
    if (typeof item.price !== 'number' || !isFinite(item.price)) return null;
    var quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
    var safeQuantity = Math.max(1, Math.floor(quantity));
    var basePrice = Number.isFinite(item.basePrice) ? item.basePrice : item.price;
    var total = Number.isFinite(item.total) ? item.total : item.price * safeQuantity;
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
        var raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return;
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        var normalized = parsed.map(normalizeCartItem).filter(Boolean);
        normalized.forEach(updateCartItemTotals);
        cart = normalized;
    } catch (error) {
        console.warn('No se pudo cargar el carrito desde localStorage', error);
    }
}

function updateCartItemTotals(item) {
    item.total = item.price * item.quantity;
}

function calculateOrderTotals() {
    orderState.subtotal = cart.reduce(function(sum, item) { return sum + item.total; }, 0);
    orderState.total = orderState.subtotal + orderState.deliveryCost;
    var cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
        cartTotalElement.textContent = 'REF ' + orderState.total.toFixed(2);
    }
}

function sanitizeData(data) {
    var sanitized = {};
    for (var key in data) {
        if (typeof data[key] === 'string') {
            sanitized[key] = data[key].replace(/[<>"'&]/g, '').trim().substring(0, 500);
        } else {
            sanitized[key] = data[key];
        }
    }
    return sanitized;
}

function validatePhone(phone) {
    var phoneRegex = /^(\+58)?(0?4(12|14|16|24|26|28)[-\s]?\d{7})$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

async function fetchWithRetry(url, options, config) {
    config = config || {};
    var retries = Number.isFinite(config.retries) ? config.retries : 2;
    var backoffMs = Number.isFinite(config.backoffMs) ? config.backoffMs : 600;
    var timeoutMs = Number.isFinite(config.timeoutMs) ? config.timeoutMs : 8000;
    var lastError = null;
    for (var attempt = 0; attempt <= retries; attempt++) {
        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, timeoutMs);
        try {
            var response = await fetch(url, Object.assign({}, options, { signal: controller.signal }));
            clearTimeout(timeoutId);
            if (response.ok) return response;
            if (response.status < 500) return response;
            lastError = new Error('HTTP ' + response.status);
        } catch (error) {
            lastError = error;
        } finally {
            clearTimeout(timeoutId);
        }
        if (attempt < retries) {
            await new Promise(function(resolve) { setTimeout(resolve, backoffMs * Math.pow(2, attempt)); });
        }
    }
    throw lastError || new Error('Request failed');
}

function openModal(modalId) {
    var modal = document.getElementById(modalId);
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

function showNotification(message, type) {
    type = type || 'info';
    var notification = document.createElement('div');
    notification.className = 'notification notification--' + type;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');

    var messageSpan = document.createElement('span');
    messageSpan.textContent = message;

    var closeButton = document.createElement('button');
    closeButton.className = 'close-notification';
    closeButton.setAttribute('aria-label', 'Cerrar notificación');
    closeButton.textContent = '×';

    notification.appendChild(messageSpan);
    notification.appendChild(closeButton);
    document.body.appendChild(notification);

    var removeNotification = function() {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    };

    closeButton.addEventListener('click', function() {
        notification.classList.add('notification--hide');
        notification.addEventListener('animationend', removeNotification, { once: true });
    });

    setTimeout(function() {
        if (!document.body.contains(notification)) return;
        notification.classList.add('notification--hide');
        notification.addEventListener('animationend', removeNotification, { once: true });
    }, 4000);
}

function showCartToast(product, cartItem) {
    var existing = document.querySelector('.cart-toast');
    if (existing) existing.remove();

    calculateOrderTotals();

    var toast = document.createElement('div');
    toast.className = 'cart-toast';
    var image = product.image || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';

    toast.innerHTML = '\n        <div class="cart-toast-header">\n            <strong>Has añadido a tu carrito</strong>\n            <button class="cart-toast-close" aria-label="Cerrar">×</button>\n        </div>\n        <div class="cart-toast-body">\n            <img src="' + image + '" alt="' + product.name + '">\n            <div>\n                <div class="cart-toast-title">' + product.name + '</div>\n                <div class="cart-toast-sub">x' + cartItem.quantity + ' · REF ' + cartItem.total.toFixed(2) + '</div>\n            </div>\n        </div>\n        <button class="cart-toast-cta" id="open-cart-toast">\n            <span>Ver carrito</span>\n            <span>REF ' + orderState.total.toFixed(2) + '</span>\n        </button>\n    ';

    document.body.appendChild(toast);

    toast.querySelector('.cart-toast-close').addEventListener('click', function() { toast.remove(); });
    toast.querySelector('#open-cart-toast').addEventListener('click', function() {
        toast.remove();
        openCartModal();
    });

    setTimeout(function() {
        if (document.body.contains(toast)) toast.remove();
    }, 5000);
}
