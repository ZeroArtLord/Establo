// App initialization
function setupModalCloseListeners() {
    document.addEventListener('click', function(e) {
        var closeButton = e.target.closest('.close-modal');
        if (!closeButton) return;
        var modal = closeButton.closest('.modal');
        closeModal(modal);
    });

    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        var activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal);
        }
    });
}

function initSwiper() {
    if (typeof Swiper === 'undefined') return;
    if (!document.querySelector('.swiper')) return;
    new Swiper('.swiper', {
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

async function initApp() {
    initSwiper();

    var loaded = await loadMenuData();
    if (loaded) {
        renderProducts();
    }

    setupCartIconListener();
    setupModalCloseListeners();
    setupReservationForm();
    loadCartFromStorage();
    updateCartUI();
    showEntryPopup();

    document.querySelectorAll('.btn-hero').forEach(function(button) {
        button.addEventListener('click', function() {
            var promos = document.getElementById('promos');
            if (promos) promos.scrollIntoView({ behavior: 'smooth' });
        });
    });

    var scrollPromosBtn = document.getElementById('hero-scroll-promos');
    if (scrollPromosBtn) {
        scrollPromosBtn.addEventListener('click', function() {
            var promos = document.getElementById('promos');
            if (promos) promos.scrollIntoView({ behavior: 'smooth' });
        });
    }

    var heroOpenCartBtn = document.getElementById('hero-open-cart');
    if (heroOpenCartBtn) {
        heroOpenCartBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                openCartModal();
            } else {
                showNotification('El carrito está vacío. Agrega productos primero.', 'error');
            }
        });
    }

    var backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        var toggleBackToTop = function() {
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

    var stickyNav = document.querySelector('.sticky-nav');
    if (stickyNav) {
        stickyNav.classList.add('is-visible');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});
