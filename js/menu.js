// Menu and product rendering
async function loadMenuData() {
    try {
        var response = await fetch('data/menu.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        var data = await response.json();
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

function renderProducts() {
    Object.keys(products).forEach(function(category) {
        var section = document.getElementById(category);
        if (!section) return;
        var productsGrid = section.querySelector('.products-grid');
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        products[category].forEach(function(product) {
            var productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-product-id', product.id);
            productCard.innerHTML = '\n                <div class="product-image" style="background-image: url(\'' + product.image + '\')"></div>\n                <h3 class="product-name">' + product.name + '</h3>\n                <p class="product-desc">' + product.description + '</p>\n                <div class="product-price">' + product.price.toFixed(2) + '</div>\n                <button class="btn btn-product" data-product-id="' + product.id + '">Personalizar</button>\n            ';
            productsGrid.appendChild(productCard);
        });
    });
    setupProductCardListeners();
}

function setupProductCardListeners() {
    document.querySelectorAll('.product-card').forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-product')) {
                var productId = parseInt(this.getAttribute('data-product-id'));
                var product = findProductById(productId);
                if (product) openCustomizeModal(product);
            }
        });
    });

    document.querySelectorAll('.btn-product').forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            var productId = parseInt(this.getAttribute('data-product-id'));
            var product = findProductById(productId);
            if (product) openCustomizeModal(product);
        });
    });
}

function findProductById(id) {
    for (var category in products) {
        var product = products[category].find(function(p) { return p.id === id; });
        if (product) return product;
    }
    return null;
}

function openCustomizeModal(product) {
    var modal = document.getElementById('customize-modal');
    var customizeBody = modal.querySelector('.customize-body');

    customizeBody.innerHTML = '\n        <div class="customize-header">\n            <h3>' + product.name + '</h3>\n            <p class="product-price-modal">REF ' + product.price.toFixed(2) + '</p>\n        </div>\n        <div class="customize-layout">\n            <div class="customize-left">\n                <img src="' + product.image + '" alt="' + product.name + '" class="customize-image">\n                <p class="customize-desc">' + product.description + '</p>\n            </div>\n            <div class="customize-right">\n                <div class="customize-options">\n                    <div class="option-section">\n                        <div class="option-section-header">\n                            <div>\n                                <h4>Sabor de la salsa 4oz (app)</h4>\n                                <p class="option-required">Es necesario elegir uno</p>\n                            </div>\n                            <span class="option-counter">0 / 1</span>\n                        </div>\n                        <div class="option-list">\n                            <input type="radio" id="meat-medio" name="meat-doneness" value="medio" checked>\n                            <label for="meat-medio" class="option-pill">\n                                <span class="option-text">Salsa secreta 4oz</span>\n                                <span class="option-indicator"></span>\n                            </label>\n\n                            <input type="radio" id="meat-tres-cuartos" name="meat-doneness" value="tres-cuartos">\n                            <label for="meat-tres-cuartos" class="option-pill">\n                                <span class="option-text">Salsa búfalo 4oz</span>\n                                <span class="option-indicator"></span>\n                            </label>\n\n                            <input type="radio" id="meat-bien-cocido" name="meat-doneness" value="bien-cocido">\n                            <label for="meat-bien-cocido" class="option-pill">\n                                <span class="option-text">Salsa miel mostaza 4oz</span>\n                                <span class="option-indicator"></span>\n                            </label>\n                        </div>\n                    </div>\n\n                    <div class="option-section">\n                        <div class="option-section-header">\n                            <div>\n                                <h4>Para quitar</h4>\n                            </div>\n                        </div>\n                        <div class="option-list">\n                            <input type="checkbox" id="remove-onion" name="remove-onion" value="sin-cebolla">\n                            <label for="remove-onion" class="option-pill">\n                                <span class="option-text">Sin cebolla</span>\n                                <span class="option-indicator"></span>\n                            </label>\n\n                            <input type="checkbox" id="remove-sauces" name="remove-sauces" value="sin-salsas">\n                            <label for="remove-sauces" class="option-pill">\n                                <span class="option-text">Sin salsas</span>\n                                <span class="option-indicator"></span>\n                            </label>\n                        </div>\n                    </div>\n\n                    <div class="option-section">\n                        <div class="option-section-header">\n                            <div>\n                                <h4>Extras</h4>\n                            </div>\n                        </div>\n                        <div class="option-list">\n                            <input type="checkbox" id="extra-bacon" name="extra-bacon" value="doble-tocino" data-price="1.50">\n                            <label for="extra-bacon" class="option-pill">\n                                <span class="option-text">Doble tocino</span>\n                                <span class="option-price-inline">+REF 1.50</span>\n                                <span class="option-indicator"></span>\n                            </label>\n\n                            <input type="checkbox" id="extra-cheese" name="extra-cheese" value="queso-fundido" data-price="1.00">\n                            <label for="extra-cheese" class="option-pill">\n                                <span class="option-text">Queso fundido</span>\n                                <span class="option-price-inline">+REF 1.00</span>\n                                <span class="option-indicator"></span>\n                            </label>\n                        </div>\n                    </div>\n\n                    <div class="option-section notes-section">\n                        <label for="special-notes" class="notes-label">Comentarios del producto</label>\n                        <textarea id="special-notes" class="notes-textarea" placeholder="Preferencias, alergias o tus comentarios" rows="3"></textarea>\n                    </div>\n                </div>\n            </div>\n        </div>\n    ';

    var modalActions = modal.querySelector('.modal-actions');
    modalActions.innerHTML = '\n        <div class="sticky-actions">\n            <div class="qty-stepper" aria-label="Cantidad">\n                <button class="qty-btn" type="button" id="qty-minus">-</button>\n                <span id="qty-value">1</span>\n                <button class="qty-btn" type="button" id="qty-plus">+</button>\n            </div>\n            <button class="btn btn-primary" type="button" id="customize-add">Agregar REF ' + product.price.toFixed(2) + '</button>\n        </div>\n    ';

    var addButton = modal.querySelector('#customize-add');
    addButton.onclick = function() {
        var options = getCustomizationOptions();
        var finalPrice = calculateFinalPrice(product.price, options);
        var qty = parseInt(document.getElementById('qty-value').textContent, 10) || 1;
        addToCart(product, qty, options, finalPrice);
        closeModal(modal);
    };

    var qtyMinus = modal.querySelector('#qty-minus');
    var qtyPlus = modal.querySelector('#qty-plus');
    var qtyValue = modal.querySelector('#qty-value');
    qtyMinus.addEventListener('click', function() {
        var current = parseInt(qtyValue.textContent, 10) || 1;
        qtyValue.textContent = Math.max(1, current - 1);
    });
    qtyPlus.addEventListener('click', function() {
        var current = parseInt(qtyValue.textContent, 10) || 1;
        qtyValue.textContent = current + 1;
    });

    setupPriceUpdateListeners(product.price);
    openModal('customize-modal');
}

function getCustomizationOptions() {
    var options = {
        meatDoneness: document.querySelector('input[name="meat-doneness"]:checked').value,
        removeItems: [],
        extras: [],
        specialNotes: document.getElementById('special-notes').value.trim()
    };

    if (document.querySelector('input[name="remove-onion"]:checked')) {
        options.removeItems.push('sin-cebolla');
    }
    if (document.querySelector('input[name="remove-sauces"]:checked')) {
        options.removeItems.push('sin-salsas');
    }

    if (document.querySelector('input[name="extra-bacon"]:checked')) {
        options.extras.push({ name: 'doble-tocino', price: 1.50 });
    }
    if (document.querySelector('input[name="extra-cheese"]:checked')) {
        options.extras.push({ name: 'queso-fundido', price: 1.00 });
    }

    return options;
}

function calculateFinalPrice(basePrice, options) {
    var extrasTotal = 0;
    options.extras.forEach(function(extra) { extrasTotal += extra.price; });
    return basePrice + extrasTotal;
}

function setupPriceUpdateListeners(basePrice) {
    var updatePrice = function() {
        var options = getCustomizationOptions();
        var extrasTotal = options.extras.reduce(function(sum, extra) { return sum + extra.price; }, 0);
        var finalPrice = basePrice + extrasTotal;
        var addButton = document.getElementById('customize-add');
        if (addButton) {
            addButton.textContent = 'Agregar REF ' + finalPrice.toFixed(2);
        }
    };

    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(function(input) {
        input.addEventListener('change', updatePrice);
    });

    document.getElementById('special-notes').addEventListener('input', updatePrice);
}

function showEntryPopup() {
    var popupShown = sessionStorage.getItem('entryPopupShown');
    if (!popupShown && dailyPromoProduct) {
        setTimeout(function() {
            var popup = document.getElementById('entry-popup');
            if (popup) {
                openModal('entry-popup');
                var customizeBtn = document.getElementById('customize-promo-popup');
                if (customizeBtn) {
                    customizeBtn.addEventListener('click', function() {
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                        openCustomizeModal(dailyPromoProduct);
                    });
                }

                var addBtn = document.getElementById('add-promo-popup');
                if (addBtn) {
                    addBtn.addEventListener('click', function() {
                        addToCart(dailyPromoProduct, 1, {}, dailyPromoProduct.price);
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                        showNotification('Producto promocional agregado al carrito');
                    });
                }

                var closeBtn = document.getElementById('close-popup');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                    });
                }

                var closeXBtn = popup.querySelector('.close-modal');
                if (closeXBtn) {
                    closeXBtn.addEventListener('click', function() {
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                    });
                }

                popup.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeModal(popup);
                        sessionStorage.setItem('entryPopupShown', 'true');
                    }
                });

                var popupImage = document.getElementById('popup-image');
                if (popupImage) {
                    popupImage.src = dailyPromoProduct.image;
                    popupImage.alt = dailyPromoProduct.name;
                }
            }
        }, 1000);
    }
}
