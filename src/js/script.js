document.addEventListener('DOMContentLoaded', () => {
    
    const root = document.documentElement;
    
    // --------------------------------------------------
    // MODIFICADO: 💡 BASE DE DATOS DE STOCK
    // --------------------------------------------------
    const productStock = {
        // Robux
        'Secrest': 7,
        'God': 2, 
        '2000_robux': 50,
        '5250_robux': 20,
        '11000_robux': 15,
        '24000_robux': 5,
        
        'steal_pack': 5,
        'skibidi_pack': 0, // Ejemplo: AGOTADO para este pack
        'sigma_tool': 3
    };

    // --- 1. Control del Modo Claro/Oscuro ---
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (theme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    setTheme(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    
    // --- 2. Preloader ---
    const preloader = document.getElementById('preloader');
    
    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('hidden');
        }
    }, 500); 

    
    // --------------------------------------------------
    // MODIFICADO: 💰 FUNCIÓN DE ACTUALIZACIÓN DE STOCK
    // --------------------------------------------------
    function updateStockDisplay() {
        const allProductCards = document.querySelectorAll('.package-card, .brainrot-card');
        
        allProductCards.forEach(card => {
            // El ID del producto se lee del atributo data-product-id
            const productId = card.dataset.productId;
            
            // Si la tarjeta no tiene un ID o el ID no está en el stock, salta
            if (!productId || typeof productStock[productId] === 'undefined') {
                return;
            }

            const currentStock = productStock[productId];
            // Buscar el contador de stock y el botón dentro de la tarjeta
            const stockEl = card.querySelector('.stock-count');
            const buyButton = card.querySelector('.buy-button');

            // 1. Actualizar el texto del stock
            if (stockEl) {
                stockEl.textContent = currentStock;

                // 2. Comprobar si está agotado
                if (currentStock === 0) {
                    stockEl.style.color = '#e74c3c'; 
                    
                    if (buyButton) {
                        buyButton.textContent = 'AGOTADO';
                        
                        if (buyButton.tagName === 'A') {
                            buyButton.style.backgroundColor = '#7f8c8d'; // Gris
                            buyButton.style.pointerEvents = 'none'; 
                        } else if (buyButton.tagName === 'BUTTON') { 
                             buyButton.style.backgroundColor = '#7f8c8d'; 
                             buyButton.disabled = true;
                        }
                    }
                } else if (currentStock <= 5) {
                    // Advertencia de bajo stock
                    stockEl.style.color = '#f39c12';
                    
                    if (buyButton) {
                        if (buyButton.tagName === 'A') {
                             buyButton.textContent = 'COMPRAR AHORA';
                        } else if (buyButton.tagName === 'BUTTON') {
                             buyButton.textContent = 'AÑADIR AL CARRITO';
                        }
                    }

                } else {
                    // Stock normal
                    stockEl.style.color = '#2ecc71';
                    
                    // Restablecer estilos
                    if (buyButton) {
                        if (buyButton.tagName === 'A') {
                            buyButton.textContent = 'COMPRAR AHORA';
                            buyButton.style.backgroundColor = '';
                            buyButton.style.pointerEvents = 'auto';
                        } else if (buyButton.tagName === 'BUTTON') {
                            buyButton.textContent = 'AÑADIR AL CARRITO';
                            buyButton.style.backgroundColor = '';
                            buyButton.disabled = false;
                        }
                    }
                }
            }
        });
    }

    // Llamar a la función de stock al cargar la página
    updateStockDisplay();


    // --- 3. Lógica del Slider (Carrusel de Brainrots) ---
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsNav = document.querySelector('.carousel-nav');
    const dots = Array.from(dotsNav.children);

    if (slides.length > 0) {
        const slideWidth = slides[0].getBoundingClientRect().width;

        const setSlidePosition = (slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        };
        slides.forEach(setSlidePosition);

        const moveToSlide = (currentSlide, targetSlide) => {
            track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
            currentSlide.classList.remove('current-slide');
            targetSlide.classList.add('current-slide');
        };

        const updateDots = (currentDot, targetDot) => {
            currentDot.classList.remove('current-slide');
            targetDot.classList.add('current-slide');
        };
        
        nextButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const nextSlide = currentSlide.nextElementSibling;
            const currentDot = dotsNav.querySelector('.current-slide');
            const nextDot = currentDot.nextElementSibling;

            if (nextSlide) {
                moveToSlide(currentSlide, nextSlide);
                updateDots(currentDot, nextDot);
            }
        });

        prevButton.addEventListener('click', e => {
            const currentSlide = track.querySelector('.current-slide');
            const prevSlide = currentSlide.previousElementSibling;
            const currentDot = dotsNav.querySelector('.current-slide');
            const prevDot = currentDot.previousElementSibling;

            if (prevSlide) {
                moveToSlide(currentSlide, prevSlide);
                updateDots(currentDot, prevDot);
            }
        });

        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('button');

            if (!targetDot) return;

            const currentSlide = track.querySelector('.current-slide');
            const currentDot = dotsNav.querySelector('.current-slide');
            const targetIndex = dots.findIndex(dot => dot === targetDot);
            const targetSlide = slides[targetIndex];

            moveToSlide(currentSlide, targetSlide);
            updateDots(currentDot, targetDot);
        });
    }

    // --- 4. Funcionalidad de Revelación al Scroll ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;

        revealElements.forEach(element => {
            const revealTop = element.getBoundingClientRect().top;

            if (revealTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    
    // --- 5. Lógica del Modal (Lightbox) para Zoom de Imagen ---
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('full-image');
    const captionText = document.getElementById('image-caption');
    const closeBtn = document.getElementsByClassName('modal-close-btn')[0];
    const zoomableImages = document.querySelectorAll('.zoomable-img');

    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = 'auto';
    }
    
    zoomableImages.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.src;
            captionText.innerHTML = this.getAttribute('data-caption') || this.alt; 
            document.body.style.overflow = 'hidden'; 
        });
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape" && modal.style.display === "block") {
            closeModal();
        }
    });

}); // Cierre de DOMContentLoaded