document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const cartKey = 'cart'; 
    let cart = JSON.parse(localStorage.getItem(cartKey)) || []; 
    const cartCountSpan = document.querySelector('.cart-count');

    const cartModal = document.getElementById('cart-modal');
    const cartCloseBtn = document.querySelector('.cart-close-btn');
    const paymentModal = document.getElementById('payment-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');

    const formatPrice = (price) => {
        return `$${price.toLocaleString('es-AR', { minimumFractionDigits: 0 })} ARS`;
    };

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
        cartCountSpan.style.display = totalItems > 0 ? 'flex' : 'none';
        
        if (checkoutButton) {
            checkoutButton.disabled = totalItems === 0;
        }
        
        if (emptyCartMessage) {
            emptyCartMessage.style.display = totalItems === 0 ? 'block' : 'none';
        }

    };

    const calculateCartTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal; 

        if (cartSubtotalSpan) cartSubtotalSpan.textContent = formatPrice(subtotal);
        if (cartTotalSpan) cartTotalSpan.textContent = formatPrice(total);
    };

    const renderCartItems = () => {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p class="item-price-single">${formatPrice(item.price)} c/u</p>
                    </div>
                    <div class="item-quantity-control">
                        <button class="minus-btn" data-id="${item.id}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="plus-btn" data-id="${item.id}">+</button>
                    </div>
                    <span class="item-total">${formatPrice(item.price * item.quantity)}</span>
                    <button class="remove-item-btn" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `).join('');
        }
        updateCartCount();
        calculateCartTotals();
    };


    const updateItemQuantity = (productId, change) => {
        const item = cart.find(item => item.id === productId);
        const maxStock = productStock[productId] || 0; 

        if (item) {
            const newQuantity = item.quantity + change;

            // ARREGLO DE STOCK: Evita superar el stock máximo al aumentar.
            if (newQuantity > maxStock && change > 0) { 
                alert(`¡Stock limitado! No puedes añadir más de ${maxStock} unidad(es) de ${item.name} en total.`);
                return;
            }

            if (newQuantity <= 0) {
                 removeItemFromCart(productId); 
            } else {
                item.quantity = newQuantity; 
                localStorage.setItem(cartKey, JSON.stringify(cart));
                updateCartCount();
                calculateCartTotals();
                renderCartItems();
            }
        }
    };

    const removeItemFromCart = (productId) => {
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart.splice(itemIndex, 1); 
            localStorage.setItem(cartKey, JSON.stringify(cart));
            updateCartCount();
            calculateCartTotals();
            renderCartItems(); 
        }
    };

    const addToCart = (product, showAlert = true) => { 
        const existingItem = cart.find(item => item.id === product.id);
        const maxStock = productStock[product.id] || 0;
        const currentInCart = existingItem ? existingItem.quantity : 0;
        
        // ARREGLO DE STOCK: 1. Verificar si el stock es cero.
        if (maxStock === 0) {
            alert(`¡Producto agotado! ${product.name} ya no tiene stock disponible.`);
            return;
        }

        // ARREGLO DE STOCK: 2. Verificar si al añadir 1, se excede el stock máximo.
        if (currentInCart + 1 > maxStock) { 
            alert(`¡Stock limitado! No puedes añadir más de ${maxStock} unidad(es) de ${product.name} en total.`);
            return;
        }

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
        updateCartCount();
        
        if (showAlert) { 
            alert(`${product.name} ha sido añadido al carrito.`);
        }
    };

    
    const setupCartListeners = () => {
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target.closest('button');

                if (!target) return; 

                const productId = target.dataset.id;
                if (!productId) return; 
                
                if (target.classList.contains('remove-item-btn')) {
                    if (confirm('¿Estás seguro de que quieres eliminar este artículo del carrito?')) {
                        removeItemFromCart(productId);
                    }
                } 
                
                else if (target.classList.contains('minus-btn')) {
                    updateItemQuantity(productId, -1);
                }
                
                else if (target.classList.contains('plus-btn')) {
                    updateItemQuantity(productId, 1); 
                }
            });
        }
        
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                if (cart.length > 0 && paymentModal) {
                    
                    const selectedProductNameElement = document.getElementById('selected-product-name');
                    if (selectedProductNameElement) {
                        const productSummary = cart.map(item => 
                            `${item.name} (x${item.quantity})`
                        ).join('<br>'); 

                        const totalPagar = cartTotalSpan.textContent;
                        selectedProductNameElement.innerHTML = `
                            <p>Total a Pagar: <strong>${totalPagar}</strong></p>
                            <p>Artículos:</p>
                            <div style="font-size: 0.9em; padding-left: 15px;">${productSummary}</div>
                        `;
                    }
                    
                    cartModal.style.display = 'none'; 
                    paymentModal.style.display = 'block'; 
                } else {
                    alert('Tu carrito está vacío.');
                }
            });
        }
        
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon && cartModal) {
            cartIcon.addEventListener('click', () => {
                renderCartItems(); 
                cartModal.style.display = 'block';
            });
        }
        
        if (cartCloseBtn && cartModal) {
            cartCloseBtn.addEventListener('click', () => {
                cartModal.style.display = 'none';
            });
        }
        
        const paymentCloseBtn = document.querySelector('.payment-close-btn');
        if (paymentCloseBtn && paymentModal) {
            paymentCloseBtn.addEventListener('click', () => {
                paymentModal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
            }
            if (e.target === paymentModal) {
                paymentModal.style.display = 'none';
            }
        });
    };

    const productStock = {
        'Vaquitas-Saturnitas-5500': 10,
        'Extinct-Grande-7000': 1, 
        'Extinct-Grande-12000': 2, 

        'Hotspotsito': 7,
        'Sammini': 1,
        'Sammini2': 1,
        'Tralalero-3500': 1, 
        'Tralalero-1500': 1, 
        'Medussi-4000': 1, 
        'Medussi-1000': 1, 
        'Digitale-3500': 1, 
        'Combinasionas-6000': 1, 
        'Combinasionas-5000': 2, 
        'JobSahur-3500': 1, 
        'Vacca-Saturno-1000': 1, 
        'Vacca-Saturno-3000': 1, 
        'Tractoro-Dinosauro-3500': 1, 
        'Tractoro-Dinosauro-2500': 1, 
        'Gattito-Tocoto-2500': 1, 
        'Beluga-2000': 1, 
        'Vaquitas-Saturnitas-5500-G': 1, 
        'nohay': 0,
    };

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
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1000); 
    }

    const initializeStore = () => {
        document.querySelectorAll('.package-card, .carousel-slide').forEach(element => {
            const id = element.dataset.productId; 
            
            if (!id || productStock[id] === undefined) return; 

            const stock = productStock[id];
            const isPackageCard = element.classList.contains('package-card');

            if (isPackageCard) {
                const stockElement = element.querySelector('.package-details .stock');
                if (stockElement) {
                    stockElement.textContent = `Stock disponible: ${stock} unidad${stock !== 1 ? 'es' : ''}`;
                    if (stock === 0) {
                        stockElement.classList.add('out-of-stock');
                    } else if (stock <= 3 && stock > 0) { 
                        stockElement.classList.add('low-stock');
                    } else {
                        stockElement.classList.remove('out-of-stock', 'low-stock');
                    }
                }
            }
            
            const buttons = element.querySelectorAll('.add-to-cart-btn, .buy-now-btn');
            if (stock === 0) {
                buttons.forEach(button => {
                    button.disabled = true;
                    button.textContent = 'AGOTADO';
                    button.classList.add('disabled-btn'); 
                });
                if (!isPackageCard) {
                    const badge = element.querySelector('.brainrot-badge');
                    if (badge) badge.textContent = 'AGOTADO';
                    element.classList.add('out-of-stock-card');
                }
            } else {
                 buttons.forEach(button => {
                    button.disabled = false;
                    button.classList.remove('disabled-btn'); 
                    if (button.classList.contains('buy-now-btn')) {
                         button.textContent = 'COMPRAR'; 
                    } else if (button.classList.contains('add-to-cart-btn')) {
                         button.innerHTML = '<i class="fas fa-cart-plus"></i> AGREGAR';
                    }
                });
            }
        });

        document.querySelectorAll('.add-to-cart-btn, .buy-now-btn').forEach(button => {
            if (button.disabled) return; 

            button.addEventListener('click', (e) => {
                const buttonData = e.currentTarget.dataset;
                const parentElement = e.currentTarget.closest('[data-product-id]');
                const id = parentElement ? parentElement.dataset.productId : null;

                if (!id) {
                    console.error("No se encontró el data-product-id para el botón.");
                    return;
                }
                
                let imageSrc = buttonData.imgSrc;
                if (!imageSrc) {
                    const imageElement = parentElement.querySelector('img.zoomable-img') || parentElement.querySelector('.brainrot-image img');
                    if (imageElement) {
                        imageSrc = imageElement.src; 
                    }
                }

                const product = {
                    id: id,
                    name: buttonData.productName,
                    price: parseInt(buttonData.price),
                    image: imageSrc || '/src/assets/default_placeholder.png' 
                };
                
                if (e.currentTarget.classList.contains('buy-now-btn')) {
                    cart = [];
                    addToCart(product, false); 
                    
                    const selectedProductNameElement = document.getElementById('selected-product-name');
                    if (selectedProductNameElement) {
                        selectedProductNameElement.innerHTML = `
                            <p>Total a Pagar: <strong>${formatPrice(product.price)}</strong></p>
                            <p>Artículo Comprado:</p>
                            <div style="font-size: 0.9em; padding-left: 15px;">${product.name} (x1)</div>
                        `;
                    }
                    
                    cartModal.style.display = 'none'; 
                    paymentModal.style.display = 'block'; 
                } else {
                    addToCart(product);
                }
            });
        });
    };

    const revealElements = document.querySelectorAll('.package-card, .section-title');
    const checkReveal = () => {
        const triggerBottom = window.innerHeight * 0.85;
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add('reveal', 'active');
            } else {
                element.classList.remove('active'); 
            }
        });
    };
    window.addEventListener('scroll', checkReveal);
    checkReveal(); 

    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsNav = document.querySelector('.carousel-nav');
    
    if (track) {
        const slideWidth = slides[0].getBoundingClientRect().width;
        let slideIndex = 0;

        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });

        const moveToSlide = (track, currentSlide, targetSlide) => {
            track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
            currentSlide.classList.remove('current-slide');
            targetSlide.classList.add('current-slide');
            slideIndex = slides.findIndex(slide => slide === targetSlide);
        };

        const updateDots = (currentDot, targetDot) => {
            currentDot.classList.remove('current-slide');
            targetDot.classList.add('current-slide');
        };

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const currentSlide = track.querySelector('.current-slide') || slides[0];
                const nextSlide = currentSlide.nextElementSibling || slides[0]; 
                const currentDot = dotsNav.querySelector('.current-slide');
                const nextDot = currentDot.nextElementSibling || dotsNav.firstElementChild; 
                
                moveToSlide(track, currentSlide, nextSlide);
                updateDots(currentDot, nextDot);
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                const currentSlide = track.querySelector('.current-slide') || slides[0];
                const prevSlide = currentSlide.previousElementSibling || slides[slides.length - 1]; 
                const currentDot = dotsNav.querySelector('.current-slide');
                const prevDot = currentDot.previousElementSibling || dotsNav.lastElementChild; 
                
                moveToSlide(track, currentSlide, prevSlide);
                updateDots(currentDot, prevDot);
            });
        }

        if (dotsNav) {
            Array.from(dotsNav.children).forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const targetDot = e.target;
                    const targetIndex = Array.from(dotsNav.children).findIndex(child => child === targetDot);
                    const targetSlide = slides[targetIndex];
                    const currentSlide = track.querySelector('.current-slide');
                    const currentDot = dotsNav.querySelector('.current-slide');
                    
                    moveToSlide(track, currentSlide, targetSlide);
                    updateDots(currentDot, targetDot);
                });
            });
        }

        const adjustSlidePositions = () => {
             const newSlideWidth = slides[0].getBoundingClientRect().width;
             slides.forEach((slide, index) => {
                 slide.style.left = newSlideWidth * index + 'px';
             });
             const currentSlide = track.querySelector('.current-slide') || slides[0];
             if (currentSlide) {
                track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
             }
        };

        window.addEventListener('resize', adjustSlidePositions);
    }
    
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('full-image');
    const captionText = document.getElementById('caption');
    const imgCloseBtn = imageModal ? imageModal.querySelector('.modal-close-btn') : null;
    
    document.querySelectorAll('.zoomable-img').forEach(img => {
        img.addEventListener('click', function() {
            imageModal.style.display = 'block';
            modalImg.src = this.src;
            captionText.innerHTML = this.dataset.caption || this.alt;
        });
    });

    if (imgCloseBtn) {
        imgCloseBtn.addEventListener('click', () => {
            imageModal.style.display = 'none';
        });
    }

    if (imageModal) {
         window.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });
    }


    const brainrotGrid = document.querySelector('.package-grid');
    if (brainrotGrid) {
        const items = Array.from(brainrotGrid.querySelectorAll('.package-card'));
        let currentPage = 1;
        const itemsPerPage = 8;
        const totalPages = Math.ceil(items.length / itemsPerPage);
        
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const pageInfoSpan = document.getElementById('page-info');

        function displayPage(page) {
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            
            items.forEach((item, index) => {
                item.style.display = (index >= startIndex && index < endIndex) ? 'block' : 'none';
            });

            if (prevPageBtn) {
                 prevPageBtn.disabled = page === 1;
            }
            if (nextPageBtn) {
                nextPageBtn.disabled = page === totalPages;
            }
            if (pageInfoSpan) {
                pageInfoSpan.textContent = `Página ${page} de ${totalPages}`;
            }

            checkReveal();
        }
        
        // **ARREGLO DE PRODUCTOS NO VISIBLES:** Se desactiva la paginación inicial para que se vean todos.
        // Si el usuario añade los botones de paginación al HTML, puede descomentar la línea de abajo.
        /*
        if (items.length > 0) {
            displayPage(currentPage);
        }
        */
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayPage(currentPage);
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayPage(currentPage);
                }
            });
        }
    }

    // ===========================================
    // 🛠️ FIX MENÚ HAMBURGUESA (navToggle logic)
    // ===========================================
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        // Asegura que el estado inicial del icono sea el de la hamburguesa
        navToggle.innerHTML = '<i class="fas fa-bars"></i>'; 
        
        navToggle.addEventListener('click', () => {
            // Alterna la clase 'active' que definimos en CSS para mostrar/ocultar
            navLinks.classList.toggle('active');
            
            // Cambia el icono basado en si la clase 'active' está presente
            if (navLinks.classList.contains('active')) {
                navToggle.innerHTML = '<i class="fas fa-times"></i>'; // Icono de cerrar (X)
            } else {
                navToggle.innerHTML = '<i class="fas fa-bars"></i>'; // Icono de hamburguesa
            }
        });

        // Cierra el menú cuando se hace clic en un enlace
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }

    initializeStore(); 
    setupCartListeners(); 
    updateCartCount(); 
});