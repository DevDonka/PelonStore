document.addEventListener('DOMContentLoaded', () => {

    const root = document.documentElement;

    // --------------------------------------------------
    // MODIFICADO: 💡 BASE DE DATOS DE STOCK
    // --------------------------------------------------
    const productStock = {
        // IDs del HTML de la sección de Brainrots (paquetes)
        'Hotspotsito': 7,
        'Sammini': 2,
        'Tralalero': 1,
        'Medussi': 5,
        'Digitale': 1,
        'beluga': 1,
        'Gattito': 1,
        'combinasionas': 1,
        'jobsahur': 1,
        'tractoro': 2, // AÑADIDO: ID para el Tractoro Dinosauro

        // IDs del HTML de la sección de Packs Exclusivos (slider)
        'Beluga Beluga': 10,
        'LA EXTINCT GRANDE': 0 // AGOTADO (Para probar la lógica)
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
        // Seleccionamos tanto tarjetas de grid (.package-card) como slides del carrusel (.carousel-slide)
        const allProductCards = document.querySelectorAll('.package-card, .carousel-slide');

        allProductCards.forEach(card => {
            // El ID del producto se lee de data-product-id (para grid) o se infiere del nombre (para slider)
            let productId = card.dataset.productId;
            const buyButton = card.querySelector('.buy-button');
            const stockContainer = card.querySelector('.stock'); // Contenedor del stock para cards del grid

            // Lógica para obtener el productId de los elementos del Slider (donde no usamos data-product-id)
            if (!productId) {
                const productName = buyButton?.getAttribute('data-product-name');
                productId = productName; // Usamos el nombre como ID si no hay data-product-id
            }

            // Si la tarjeta no tiene un ID o el ID no está en el stock, salta
            if (!productId || typeof productStock[productId] === 'undefined') {
                return;
            }

            const currentStock = productStock[productId];
            const stockEl = card.querySelector('.stock-count');


            // 1. Actualizar el texto del stock (Solo aplica al grid)
            if (stockEl) {
                stockEl.textContent = currentStock;
            }

            // 2. Comprobar si está agotado (Aplica a grid y slider)
            if (currentStock === 0) {
                // Estilo para AGOTADO
                if (stockEl) {
                    stockEl.style.color = '#e74c3c';
                }
                if (stockContainer) {
                    stockContainer.innerHTML = '<i class="fas fa-times-circle" style="color: #e74c3c;"></i> Agotado';
                }

                if (buyButton) {
                    buyButton.textContent = 'AGOTADO';

                    if (buyButton.tagName === 'A') { // Botones del Grid
                        buyButton.style.backgroundColor = '#7f8c8d'; // Gris
                        buyButton.style.pointerEvents = 'none';
                        buyButton.setAttribute('href', '#'); // Asegura que no navegue
                    } else if (buyButton.tagName === 'BUTTON') { // Botones del Slider
                         buyButton.style.backgroundColor = '#7f8c8d';
                         buyButton.disabled = true;
                    }
                }
            } else if (currentStock <= 5) {
                // Advertencia de bajo stock (Solo aplica al grid)
                if (stockEl) {
                    stockEl.style.color = '#f39c12';
                }

            } else {
                // Stock normal (Solo aplica al grid)
                if (stockEl) {
                    stockEl.style.color = '#2ecc71';
                }

                // Restablecer estilos
                if (buyButton) {
                    if (buyButton.tagName === 'A') {
                        buyButton.textContent = 'COMPRAR AHORA';
                        buyButton.style.backgroundColor = '';
                        buyButton.style.pointerEvents = 'auto';
                    } else if (buyButton.tagName === 'BUTTON') {
                        buyButton.textContent = 'COMPRAR AHORA';
                        buyButton.style.backgroundColor = '';
                        buyButton.disabled = false;
                    }
                }
            }
        });
    }

    // Llamar a la función de stock al cargar la página
    updateStockDisplay();


    // --------------------------------------------------
    // MODIFICADO: Lógica del Modal de Pago
    // --------------------------------------------------
    const paymentModal = document.getElementById('payment-modal');
    const paymentCloseBtn = document.querySelector('.payment-close-btn');
    const selectedProductNameDisplay = document.getElementById('selected-product-name');

    // Selecciona todos los botones de compra (del slider y del grid)
    const buyButtons = document.querySelectorAll('.buy-button');

    // Muestra el modal de pago
    function showPaymentModal(productName) {
        selectedProductNameDisplay.textContent = productName;
        paymentModal.style.display = 'block';
        paymentModal.classList.add('visible'); // Añadir clase para la transición del fondo
        document.body.style.overflow = 'hidden'; // Bloquea el scroll de fondo
    }

    // Cierra el modal de pago
    function closePaymentModal() {
        paymentModal.classList.remove('visible');
        // Usamos un pequeño retraso para permitir la transición del fondo antes de ocultar
        setTimeout(() => {
            paymentModal.style.display = "none";
            document.body.style.overflow = 'auto';
        }, 300); 
    }

    // Cierra el modal al hacer clic en la X
    if (paymentCloseBtn) {
        paymentCloseBtn.onclick = closePaymentModal;
    }

    // Cierra el modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        if (event.target == paymentModal && paymentModal.classList.contains('visible')) {
            closePaymentModal();
        }
    });

    // Cierra el modal con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape" && paymentModal.classList.contains('visible')) {
            closePaymentModal();
        }
    });


    // Configuración de los botones de compra
    buyButtons.forEach(button => {
        // Obtenemos el nombre del producto, ya sea del atributo o del título de la tarjeta
        let productName = button.getAttribute('data-product-name') || 'Producto Desconocido';
        
        if (productName === 'Producto Desconocido') {
            const card = button.closest('.package-card');
            if (card) {
                const titleElement = card.querySelector('.package-details h3');
                if (titleElement) {
                    productName = titleElement.textContent.trim();
                }
            }
        }

        // Neutraliza el href (si es un <a>)
        if (button.tagName === 'A') {
            button.setAttribute('href', '#');
            button.setAttribute('target', '_self');
        }

        // Sólo añade el evento si el botón no está marcado como agotado
        if (button.textContent !== 'AGOTADO' && !button.disabled) {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Detiene la navegación (si aplica)
                showPaymentModal(productName);
            });
        }
    });
    
    // --------------------------------------------------
    // AÑADIDO: Lógica del Lightbox (Zoom de Imagen)
    // --------------------------------------------------
    const imageModal = document.getElementById('image-modal');
    const fullImage = document.getElementById('full-image');
    const imageCaption = document.getElementById('image-caption');
    const imageCloseBtn = imageModal.querySelector('.modal-close-btn');
    const zoomableImages = document.querySelectorAll('.zoomable-img');

    function closeImageModal() {
        imageModal.classList.remove('visible');
        imageModal.style.display = "none";
        document.body.style.overflow = 'auto';
    }

    imageCloseBtn.onclick = closeImageModal;
    
    // Cierra la imagen al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target == imageModal && imageModal.style.display === "block") {
            closeImageModal();
        }
    });

    zoomableImages.forEach(img => {
        img.addEventListener('click', () => {
            fullImage.src = img.src;
            imageCaption.textContent = img.dataset.caption || img.alt;
            imageModal.style.display = "block";
            document.body.style.overflow = 'hidden';
        });
    });

    // --------------------------------------------------
    // MODIFICADO: Lógica del Slider (Carrusel)
    // SOLO APLICA A LA PÁGINA 'index.html'
    // --------------------------------------------------
    const track = document.querySelector('.carousel-track');
    // Verificamos si el carrusel existe en la página
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');
        const dotsNav = document.querySelector('.carousel-nav');
        const dots = Array.from(dotsNav.children);

        if (slides.length > 0) {
            // Recalcula el ancho del slide en caso de redimensionamiento
            const getSlideWidth = () => slides[0].getBoundingClientRect().width;

            const setSlidePosition = (slide, index) => {
                slide.style.left = getSlideWidth() * index + 'px';
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

            // Re-calcular posición al redimensionar (mejor experiencia móvil/desktop)
            window.addEventListener('resize', () => {
                slides.forEach(setSlidePosition);
                // Mueve la pista al slide actual después de redimensionar
                const currentSlide = track.querySelector('.current-slide');
                if (currentSlide) {
                    track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
                }
            });
        }
    }


    // --- 3. Funcionalidad de Revelación al Scroll ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;

        revealElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('load', revealOnScroll); // Para revelar elementos al cargar


    // --------------------------------------------------
    // AÑADIDO: 📊 Lógica de Paginación (Solo para brainrots.html)
    // --------------------------------------------------
    const brainrotGrid = document.getElementById('brainrot-grid');
    if (brainrotGrid) {
        const items = Array.from(brainrotGrid.children);
        const itemsPerPage = 6; // Cantidad de productos por página
        let currentPage = 1;
        
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const pageInfoSpan = document.getElementById('page-info');

        const totalPages = Math.ceil(items.length / itemsPerPage);

        function displayPage(page) {
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            items.forEach((item, index) => {
                item.style.display = (index >= startIndex && index < endIndex) ? 'block' : 'none';
            });

            // Actualizar botones y texto
            prevPageBtn.disabled = page === 1;
            nextPageBtn.disabled = page === totalPages;
            pageInfoSpan.textContent = `Página ${page} de ${totalPages}`;
            
            // Subir al inicio del grid después de la paginación
            brainrotGrid.scrollIntoView({ behavior: 'smooth' });
        }

        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayPage(currentPage);
            }
        });

        nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayPage(currentPage);
            }
        });

        // Inicializar la paginación si hay productos
        if (items.length > 0) {
            displayPage(currentPage);
        }
    }
    
});