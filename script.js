// Fixed Shopping Cart Functionality
class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadCart();
        this.updateCartCount();
        this.initEventListeners();
    }

    

    initEventListeners() {
        console.log('Initializing cart event listeners...');
        
        // Add to cart buttons - use event delegation
        document.addEventListener('click', (e) => {
            // Add to cart
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                if (!button.disabled) {
                    const productId = button.dataset.product;
                    console.log('Adding product to cart:', productId);
                    this.addItem(this.getProductData(productId));
                }
            }

            // Cart icon
            if (e.target.classList.contains('cart-icon') || e.target.closest('.cart-icon')) {
                console.log('Cart icon clicked');
                this.toggleCart();
            }

            // Close cart
            if (e.target.classList.contains('close-cart') || e.target.classList.contains('continue-shopping')) {
                console.log('Closing cart');
                this.closeCart();
            }

            // Cart overlay
            if (e.target.classList.contains('cart-overlay')) {
                console.log('Cart overlay clicked');
                this.closeCart();
            }

            // Remove item
            if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
                const productId = button.dataset.product;
                console.log('Removing item:', productId);
                this.removeItem(productId);
            }

            // Quantity buttons
            if (e.target.classList.contains('quantity-btn') || e.target.closest('.quantity-btn')) {
                const button = e.target.classList.contains('quantity-btn') ? e.target : e.target.closest('.quantity-btn');
                const productId = button.dataset.product;
                const isIncrease = button.classList.contains('increase');
                console.log('Updating quantity:', productId, isIncrease);
                this.updateQuantity(productId, isIncrease);
            }

            // Checkout button
            if (e.target.classList.contains('checkout-btn')) {
                console.log('Checkout clicked');
                this.handleCheckout();
            }
        });

        // Other event listeners
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterProducts(btn.dataset.filter);
            });
        });

        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }

        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(e.target);
            });
        }

        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletter(e.target);
            });
        }

        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    }

    getProductData(productId) {
        console.log('Getting product data for:', productId);
        
        // First try to get from admin manager
        if (window.adminManager && window.adminManager.products) {
            const product = window.adminManager.products.find(p => p.id === parseInt(productId));
            if (product) {
                return {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category
                };
            }
        }
        
        // Fallback to static products
        const staticProducts = {
            1: {
                id: 1,
                name: "Tecno Camon 20 Pro",
                price: 1250000,
                image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                category: "camon"
            },
            2: {
                id: 2,
                name: "Tecno Spark 10 Pro",
                price: 650000,
                image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                category: "spark"
            },
            3: {
                id: 3,
                name: "Tecno Pova 5",
                price: 850000,
                image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                category: "pova"
            },
            4: {
                id: 4,
                name: "Tecno Phantom X2 Pro",
                price: 2150000,
                image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                category: "phantom"
            }
        };
        
        return staticProducts[productId] || {
            id: productId,
            name: "Unknown Product",
            price: 0,
            image: "",
            category: "unknown"
        };
    }

    addItem(product) {
        if (!product || !product.id) {
            console.error('Invalid product data:', product);
            return;
        }

        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showAddedToCartMessage(product.name);
        this.renderCartItems();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== parseInt(productId));
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
    }

    updateQuantity(productId, isIncrease) {
        const item = this.items.find(item => item.id === parseInt(productId));
        if (item) {
            if (isIncrease) {
                item.quantity += 1;
            } else {
                item.quantity -= 1;
                if (item.quantity <= 0) {
                    this.removeItem(productId);
                    return;
                }
            }
        }
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('tecnoCart', JSON.stringify(this.items));
    }

    loadCart() {
        const savedCart = localStorage.getItem('tecnoCart');
        if (savedCart) {
            try {
                this.items = JSON.parse(savedCart);
            } catch (e) {
                console.error('Error loading cart:', e);
                this.items = [];
            }
        }
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.getTotalItems();
        }
    }

    toggleCart() {
        console.log('Toggle cart called');
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        console.log('Cart sidebar found:', cartSidebar);
        console.log('Cart overlay found:', cartOverlay);
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.toggle('active');
            cartOverlay.classList.toggle('active');
            console.log('Cart classes toggled');
            this.renderCartItems();
        } else {
            console.error('Cart sidebar or overlay not found!');
            // Let's try to find what's available
            console.log('Available elements with cart classes:');
            console.log('cart-sidebar:', document.querySelector('.cart-sidebar'));
            console.log('cart-overlay:', document.querySelector('.cart-overlay'));
            console.log('cart-icon:', document.querySelector('.cart-icon'));
        }
    }

    

    closeCart() {
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
        }
    }

    renderCartItems() {
        const cartItems = document.querySelector('.cart-items');
        const totalPrice = document.querySelector('.total-price');
        
        if (!cartItems || !totalPrice) {
            console.error('Cart elements not found!');
            return;
        }

        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            totalPrice.textContent = 'UGX 0';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image || 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">UGX ${item.price.toLocaleString()}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-product="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-product="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-product="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        totalPrice.textContent = `UGX ${this.getTotalPrice().toLocaleString()}`;
    }

    handleCheckout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }

        // Use WhatsApp integration if available
        if (window.whatsappIntegration) {
            window.whatsappIntegration.sendOrderViaWhatsApp();
        } else {
            // Fallback checkout
            let orderSummary = "Order Summary:\n\n";
            this.items.forEach(item => {
                orderSummary += `${item.name} x ${item.quantity} - UGX ${(item.price * item.quantity).toLocaleString()}\n`;
            });
            orderSummary += `\nTotal: UGX ${this.getTotalPrice().toLocaleString()}`;
            
            alert(orderSummary);
        }
        
        this.closeCart();
    }

    showAddedToCartMessage(productName) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = `✓ Added ${productName} to cart`;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    filterProducts(category) {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            if (category === 'all' || product.dataset.category === category) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    searchProducts(query) {
        const products = document.querySelectorAll('.product-card');
        const searchTerm = query.toLowerCase();
        
        products.forEach(product => {
            const productName = product.querySelector('h3').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    handleContactForm(form) {
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        
        this.showNotification('Thank you for your message! We will get back to you soon.', 'success');
        form.reset();
    }

    handleNewsletter(form) {
        const email = form.querySelector('input[type="email"]').value;
        this.showNotification('Thank you for subscribing to our newsletter!', 'success');
        form.reset();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        
        if (navMenu && hamburger) {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        }
    }
}

// Promo Timer
class PromoTimer {
    constructor() {
        this.endDate = new Date();
        this.endDate.setDate(this.endDate.getDate() + 3); // 3 days from now
        this.init();
    }

    init() {
        this.updateTimer();
        setInterval(() => this.updateTimer(), 1000);
    }

    updateTimer() {
        const now = new Date().getTime();
        const distance = this.endDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = this.padZero(days);
        document.getElementById('hours').textContent = this.padZero(hours);
        document.getElementById('minutes').textContent = this.padZero(minutes);
        document.getElementById('seconds').textContent = this.padZero(seconds);

        if (distance < 0) {
            document.querySelector('.promo-timer').innerHTML = '<div class="timer-expired">Offer Expired</div>';
        }
    }

    padZero(num) {
        return num < 10 ? '0' + num : num;
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Wishlist functionality
document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.classList.toggle('active');
        this.querySelector('i').classList.toggle('far');
        this.querySelector('i').classList.toggle('fas');
        
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        
        if (this.classList.contains('active')) {
            cart.showNotification(`Added ${productName} to wishlist`, 'success');
        } else {
            cart.showNotification(`Removed ${productName} from wishlist`, 'info');
        }
    });
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize shopping cart
    window.cart = new ShoppingCart();
    
        // Initialize promo timer
        window.promoTimer = new PromoTimer();
    
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .nav-menu.active {
                display: flex !important;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background: white;
                box-shadow: var(--shadow);
                padding: 1rem 0;
            }
            
            .hamburger.active span:nth-child(1) {
                transform: rotate(45deg) translate(6px, 6px);
            }
            
            .hamburger.active span:nth-child(2) {
                opacity: 0;
            }
            
            .hamburger.active span:nth-child(3) {
                transform: rotate(-45deg) translate(6px, -6px);
            }
            
            .empty-cart {
                text-align: center;
                color: var(--gray);
                padding: 2rem;
            }
            
            .timer-expired {
                text-align: center;
                font-size: 1.2rem;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    
        // Product image zoom functionality
        document.querySelectorAll('.product-image').forEach(image => {
            image.addEventListener('click', function() {
                this.classList.toggle('zoomed');
            });
        });
    
        // Add zoom CSS
        const zoomStyle = document.createElement('style');
        zoomStyle.textContent = `
            .product-image.zoomed {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1002;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: zoom-out;
            }
            
            .product-image.zoomed img {
                width: 90%;
                height: 90%;
                object-fit: contain;
                border-radius: 10px;
            }
        `;
        document.head.appendChild(zoomStyle);
    });
    
   // Fixed WhatsApp Integration
class WhatsAppIntegration {
    constructor() {
        this.phoneNumber = "+256776766643";
        this.init();
    }

    init() {
        this.createFloatingButton();
        
        // Use event delegation for checkout button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('checkout-btn')) {
                this.sendOrderViaWhatsApp();
            }
        });
    }

    createFloatingButton() {
        const whatsappBtn = document.createElement('a');
        whatsappBtn.href = `https://wa.me/${this.phoneNumber}`;
        whatsappBtn.target = "_blank";
        whatsappBtn.className = "whatsapp-float";
        whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
        whatsappBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #25D366;
            color: white;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
            z-index: 999;
            transition: all 0.3s ease;
            text-decoration: none;
        `;

        document.body.appendChild(whatsappBtn);
    }

    sendOrderViaWhatsApp() {
        const cart = window.cart;
        if (!cart || cart.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        let message = "Hello! I'd like to place an order:\n\n";
        cart.items.forEach(item => {
            message += `• ${item.name} x ${item.quantity} - UGX ${(item.price * item.quantity).toLocaleString()}\n`;
        });
        message += `\nTotal: UGX ${cart.getTotalPrice().toLocaleString()}\n\n`;
        message += "Please confirm availability and provide payment details.";

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    }
}
    
    // Initialize WhatsApp integration when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        window.whatsappIntegration = new WhatsAppIntegration();
    });
    
    // Enhanced Product Filtering with Search
    class EnhancedFiltering {
        constructor() {
            this.products = document.querySelectorAll('.product-card');
            this.init();
        }
    
        init() {
            this.addAdvancedFilters();
            this.addSorting();
        }
    
        addAdvancedFilters() {
            const filterContainer = document.querySelector('.products-filter');
            
            // Price range filter
            const priceFilter = document.createElement('div');
            priceFilter.className = 'price-filter';
            priceFilter.innerHTML = `
                <label>Price Range:</label>
                <select id="priceRange">
                    <option value="all">All Prices</option>
                    <option value="0-500000">Under UGX 500,000</option>
                    <option value="500000-1000000">UGX 500,000 - 1,000,000</option>
                    <option value="1000000-1500000">UGX 1,000,000 - 1,500,000</option>
                    <option value="1500000-9999999">Over UGX 1,500,000</option>
                </select>
            `;
            filterContainer.appendChild(priceFilter);
    
            document.getElementById('priceRange').addEventListener('change', (e) => {
                this.filterByPrice(e.target.value);
            });
        }
    
        filterByPrice(range) {
            if (range === 'all') {
                this.products.forEach(product => product.style.display = 'block');
                return;
            }
    
            const [min, max] = range.split('-').map(Number);
            
            this.products.forEach(product => {
                const priceText = product.querySelector('.current-price').textContent;
                const price = parseInt(priceText.replace(/[^\d]/g, ''));
                
                if (price >= min && price <= max) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        }
    
        addSorting() {
            const filterContainer = document.querySelector('.products-filter');
            
            const sortSelect = document.createElement('div');
            sortSelect.className = 'sort-select';
            sortSelect.innerHTML = `
                <label>Sort by:</label>
                <select id="sortProducts">
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                    <option value="rating">Highest Rated</option>
                </select>
            `;
            filterContainer.appendChild(sortSelect);
    
            document.getElementById('sortProducts').addEventListener('change', (e) => {
                this.sortProducts(e.target.value);
            });
        }
    
        sortProducts(criteria) {
            const productsGrid = document.querySelector('.products-grid');
            const products = Array.from(this.products);
    
            products.sort((a, b) => {
                switch (criteria) {
                    case 'price-low':
                        const priceA = parseInt(a.querySelector('.current-price').textContent.replace(/[^\d]/g, ''));
                        const priceB = parseInt(b.querySelector('.current-price').textContent.replace(/[^\d]/g, ''));
                        return priceA - priceB;
    
                    case 'price-high':
                        const priceAHigh = parseInt(a.querySelector('.current-price').textContent.replace(/[^\d]/g, ''));
                        const priceBHigh = parseInt(b.querySelector('.current-price').textContent.replace(/[^\d]/g, ''));
                        return priceBHigh - priceAHigh;
    
                    case 'name':
                        const nameA = a.querySelector('h3').textContent.toLowerCase();
                        const nameB = b.querySelector('h3').textContent.toLowerCase();
                        return nameA.localeCompare(nameB);
    
                    case 'rating':
                        const ratingA = this.getRatingValue(a);
                        const ratingB = this.getRatingValue(b);
                        return ratingB - ratingA;
    
                    default:
                        return 0;
                }
            });
    
            // Re-append products in sorted order
            products.forEach(product => {
                productsGrid.appendChild(product);
            });
        }
    
        getRatingValue(product) {
            const stars = product.querySelectorAll('.fa-star');
            let rating = 0;
            
            stars.forEach(star => {
                if (star.classList.contains('fas')) {
                    rating += 1;
                } else if (star.classList.contains('fa-star-half-alt')) {
                    rating += 0.5;
                }
            });
            
            return rating;
        }
    }
    
    // Initialize enhanced filtering
    document.addEventListener('DOMContentLoaded', function() {
        window.enhancedFiltering = new EnhancedFiltering();
    });
    
    // Social Media Integration
    class SocialMediaIntegration {
        constructor() {
            this.init();
        }
    
        init() {
            this.addSocialSharing();
            this.addSocialLinks();
        }
    
        addSocialSharing() {
            document.querySelectorAll('.product-card').forEach(product => {
                const shareBtn = document.createElement('button');
                shareBtn.className = 'share-btn';
                shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
                shareBtn.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.9);
                    border: none;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 2;
                `;
    
                shareBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showShareOptions(product);
                });
    
                product.querySelector('.product-image').appendChild(shareBtn);
            });
        }
    
        showShareOptions(product) {
            const productName = product.querySelector('h3').textContent;
            const productImage = product.querySelector('img').src;
            const productUrl = window.location.href;
    
            const shareOptions = document.createElement('div');
            shareOptions.className = 'share-options';
            shareOptions.innerHTML = `
                <div class="share-overlay"></div>
                <div class="share-modal">
                    <h4>Share ${productName}</h4>
                    <div class="share-buttons">
                        <button class="share-facebook" data-url="${productUrl}">
                            <i class="fab fa-facebook"></i> Facebook
                        </button>
                        <button class="share-twitter" data-url="${productUrl}" data-text="Check out ${productName}">
                            <i class="fab fa-twitter"></i> Twitter
                        </button>
                        <button class="share-whatsapp" data-url="${productUrl}" data-text="Check out ${productName}">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        <button class="copy-link" data-url="${productUrl}">
                            <i class="fas fa-link"></i> Copy Link
                        </button>
                    </div>
                    <button class="close-share">Close</button>
                </div>
            `;
    
            document.body.appendChild(shareOptions);
    
            // Add event listeners for share buttons
            shareOptions.querySelector('.share-overlay').addEventListener('click', () => {
                shareOptions.remove();
            });
    
            shareOptions.querySelector('.close-share').addEventListener('click', () => {
                shareOptions.remove();
            });
    
            shareOptions.querySelector('.share-facebook').addEventListener('click', () => {
                this.shareOnFacebook(productUrl);
            });
    
            shareOptions.querySelector('.share-twitter').addEventListener('click', () => {
                this.shareOnTwitter(productName, productUrl);
            });
    
            shareOptions.querySelector('.share-whatsapp').addEventListener('click', () => {
                this.shareOnWhatsApp(productName, productUrl);
            });
    
            shareOptions.querySelector('.copy-link').addEventListener('click', () => {
                this.copyToClipboard(productUrl);
            });
        }
    
        shareOnFacebook(url) {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        }
    
        shareOnTwitter(text, url) {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        }
    
        shareOnWhatsApp(text, url) {
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        }
    
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                window.cart.showNotification('Link copied to clipboard!', 'success');
            });
        }
    
        addSocialLinks() {
            // Add social media links to product pages
            const socialLinksHTML = `
                <div class="product-social-links">
                    <span>Share this product:</span>
                    <div class="social-icons">
                        <a href="#" class="social-facebook"><i class="fab fa-facebook"></i></a>
                        <a href="#" class="social-twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="social-whatsapp"><i class="fab fa-whatsapp"></i></a>
                        <a href="#" class="social-instagram"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            `;
    
            // Add CSS for social sharing
            const socialCSS = `
                .share-options {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1003;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .share-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                }
                
                .share-modal {
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    z-index: 1;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                }
                
                .share-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin: 1.5rem 0;
                }
                
                .share-buttons button {
                    padding: 1rem;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                }
                
                .share-facebook { background: #1877f2; color: white; }
                .share-twitter { background: #1da1f2; color: white; }
                .share-whatsapp { background: #25d366; color: white; }
                .copy-link { background: var(--primary); color: white; }
                
                .share-buttons button:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                }
                
                .close-share {
                    background: var(--gray);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 5px;
                    cursor: pointer;
                }
                
                .product-social-links {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 1rem;
                    padding: 1rem 0;
                    border-top: 1px solid var(--border);
                }
                
                .social-icons {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .social-icons a {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }
                
                .social-facebook { background: #1877f2; }
                .social-twitter { background: #1da1f2; }
                .social-whatsapp { background: #25d366; }
                .social-instagram { background: #e4405f; }
                
                .social-icons a:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }
            `;
    
            const style = document.createElement('style');
            style.textContent = socialCSS;
            document.head.appendChild(style);
        }
    }
    
    // Initialize social media integration
    document.addEventListener('DOMContentLoaded', function() {
        window.socialMedia = new SocialMediaIntegration();
    });
    
    // Analytics and Performance Monitoring
    class Analytics {
        constructor() {
            this.init();
        }
    
        init() {
            this.trackUserBehavior();
            this.monitorPerformance();
            this.setupErrorTracking();
        }
    
        trackUserBehavior() {
            // Track page views
            this.trackEvent('page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
    
            // Track product views
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const productName = entry.target.querySelector('h3')?.textContent;
                        if (productName) {
                            this.trackEvent('product_view', { product_name: productName });
                        }
                    }
                });
            }, { threshold: 0.5 });
    
            document.querySelectorAll('.product-card').forEach(card => {
                observer.observe(card);
            });
    
            // Track add to cart events
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart')) {
                    const productId = e.target.dataset.product;
                    const product = window.cart.getProductData(productId);
                    this.trackEvent('add_to_cart', {
                        product_id: productId,
                        product_name: product.name,
                        product_price: product.price
                    });
                }
            });
        }
    
        trackEvent(eventName, parameters = {}) {
            // In a real implementation, this would send data to Google Analytics or similar
            console.log(`[Analytics] ${eventName}:`, parameters);
            
            // Simulate sending to analytics service
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, parameters);
            }
        }
    
        monitorPerformance() {
            // Monitor page load performance
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                this.trackEvent('page_load', { load_time: loadTime });
            });
    
            // Monitor largest contentful paint
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.trackEvent('largest_contentful_paint', {
                    value: lastEntry.renderTime || lastEntry.loadTime
                });
            }).observe({ type: 'largest-contentful-paint', buffered: true });
        }
    
        setupErrorTracking() {
            window.addEventListener('error', (event) => {
                this.trackEvent('javascript_error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });
    
            window.addEventListener('unhandledrejection', (event) => {
                this.trackEvent('unhandled_promise_rejection', {
                    reason: event.reason
                });
            });
        }
    }
    
    // Initialize analytics
    document.addEventListener('DOMContentLoaded', function() {
        window.analytics = new Analytics();
    });
    
    // Enhanced Mobile Experience
    class MobileEnhancements {
        constructor() {
            this.init();
        }
    
        init() {
            this.enhanceTouchInteractions();
            this.optimizeMobilePerformance();
            this.addMobileSpecificFeatures();
        }
    
        enhanceTouchInteractions() {
            // Add touch-friendly hover states
            document.querySelectorAll('.product-card, .category-card').forEach(card => {
                card.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                });
    
                card.addEventListener('touchend', function() {
                    this.classList.remove('touch-active');
                });
            });
    
            // Improve button touch targets
            document.querySelectorAll('button, .add-to-cart').forEach(button => {
                button.style.minHeight = '44px';
                button.style.minWidth = '44px';
            });
        }
    
        optimizeMobilePerformance() {
            // Lazy load images
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    });
                });
    
                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
    
            // Defer non-critical CSS
            this.loadCriticalCSS();
        }
    
        loadCriticalCSS() {
            // In a real implementation, this would load non-critical CSS after page load
            window.addEventListener('load', () => {
                const nonCriticalCSS = [
                    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
                ];
    
                nonCriticalCSS.forEach(href => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = href;
                    document.head.appendChild(link);
                });
            });
        }
    
        addMobileSpecificFeatures() {
            // Add swipe functionality for product images
            this.addImageSwipe();
            
            // Add pull-to-refresh
            this.addPullToRefresh();
        }
    
        addImageSwipe() {
            let startX = 0;
            let currentX = 0;
    
            document.querySelectorAll('.product-image').forEach(image => {
                image.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                });
    
                image.addEventListener('touchmove', (e) => {
                    currentX = e.touches[0].clientX;
                });
    
                image.addEventListener('touchend', () => {
                    const diff = startX - currentX;
                    if (Math.abs(diff) > 50) { // Minimum swipe distance
                        if (diff > 0) {
                            this.showNextImage(image);
                        } else {
                            this.showPrevImage(image);
                        }
                    }
                });
            });
        }
    
        showNextImage(image) {
            // Implementation for showing next product image
            console.log('Show next image');
        }
    
        showPrevImage(image) {
            // Implementation for showing previous product image
            console.log('Show previous image');
        }
    
        addPullToRefresh() {
            let startY = 0;
            let currentY = 0;
    
            document.addEventListener('touchstart', (e) => {
                if (window.scrollY === 0) {
                    startY = e.touches[0].pageY;
                }
            });
    
            document.addEventListener('touchmove', (e) => {
                currentY = e.touches[0].pageY;
            });
    
            document.addEventListener('touchend', () => {
                if (window.scrollY === 0 && currentY - startY > 100) {
                    location.reload();
                }
            });
        }
    }

    // Admin Product Management
class AdminProductManager {
    constructor() {
        this.products = this.loadProducts();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.renderAdminProducts();
        this.setupEventListeners();
        this.createAdminAccessButton();
    }

    setupEventListeners() {
        // Add product form
        document.getElementById('addProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        // Admin login form
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin();
        });
    }

    createAdminAccessButton() {
        const adminBtn = document.createElement('div');
        adminBtn.className = 'admin-access';
        adminBtn.innerHTML = '<button class="admin-access-btn" onclick="showAdminLogin()"><i class="fas fa-cog"></i> Admin</button>';
        document.body.appendChild(adminBtn);
    }

    handleAdminLogin() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        // Simple authentication (in real app, use secure authentication)
        if (username === 'Admin' && password === 'admin123') {
            closeAdminLogin();
            toggleAdminPanel();
            this.showNotification('Admin login successful!', 'success');
        } else {
            this.showNotification('Invalid credentials!', 'error');
        }
    }

    addProduct() {
        const formData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseInt(document.getElementById('productPrice').value),
            originalPrice: document.getElementById('productOriginalPrice').value ? 
                          parseInt(document.getElementById('productOriginalPrice').value) : null,
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value,
            badge: document.getElementById('productBadge').value,
            stock: parseInt(document.getElementById('productStock').value),
            rating: parseFloat(document.getElementById('productRating').value),
            id: Date.now() // Simple ID generation
        };

        this.products.push(formData);
        this.saveProducts();
        this.renderAdminProducts();
        this.renderProducts(); // Update main product grid
        this.clearProductForm();
        
        this.showNotification('Product added successfully!', 'success');
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.currentEditId = productId;

        // Fill form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productOriginalPrice').value = product.originalPrice || '';
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productBadge').value = product.badge || '';
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productRating').value = product.rating;

        // Change form to edit mode
        const form = document.getElementById('addProductForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update Product';
        submitBtn.onclick = (e) => {
            e.preventDefault();
            this.updateProduct();
        };

        // Scroll to form
        document.getElementById('addProductForm').scrollIntoView({ behavior: 'smooth' });
    }

    updateProduct() {
        const productIndex = this.products.findIndex(p => p.id === this.currentEditId);
        if (productIndex === -1) return;

        this.products[productIndex] = {
            ...this.products[productIndex],
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseInt(document.getElementById('productPrice').value),
            originalPrice: document.getElementById('productOriginalPrice').value ? 
                          parseInt(document.getElementById('productOriginalPrice').value) : null,
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value,
            badge: document.getElementById('productBadge').value,
            stock: parseInt(document.getElementById('productStock').value),
            rating: parseFloat(document.getElementById('productRating').value)
        };

        this.saveProducts();
        this.renderAdminProducts();
        this.renderProducts();
        this.cancelEdit();
        
        this.showNotification('Product updated successfully!', 'success');
    }

    cancelEdit() {
        this.currentEditId = null;
        this.clearProductForm();
        const submitBtn = document.querySelector('#addProductForm button[type="submit"]');
        submitBtn.textContent = 'Add Product';
        submitBtn.onclick = null;
    }

    deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        this.products = this.products.filter(p => p.id !== productId);
        this.saveProducts();
        this.renderAdminProducts();
        this.renderProducts();
        
        this.showNotification('Product deleted successfully!', 'success');
    }

    renderAdminProducts() {
        const container = document.getElementById('adminProductsGrid');
        const searchTerm = document.getElementById('adminSearch')?.value.toLowerCase() || '';
        
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );

        document.getElementById('productCount').textContent = `${filteredProducts.length} products found`;

        container.innerHTML = filteredProducts.map(product => `
            <div class="admin-product-card">
                <div class="admin-product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <p><strong>Category:</strong> ${this.formatCategory(product.category)}</p>
                    <p><strong>Stock:</strong> ${product.stock} | <strong>Rating:</strong> ${product.rating}/5</p>
                    <div class="admin-product-price">UGX ${product.price.toLocaleString()}</div>
                </div>
                <div class="admin-product-actions">
                    <button class="edit-btn" onclick="window.adminManager.editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="window.adminManager.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderProducts() {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        productsGrid.innerHTML = this.products.map(product => `
            <div class="product-card" data-category="${product.category}">
                ${product.badge ? `<div class="product-badge ${product.badge}">${this.formatBadge(product.badge)}</div>` : ''}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-price">
                        <span class="current-price">UGX ${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `<span class="original-price">UGX ${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="product-rating">
                        ${this.generateStarRating(product.rating)}
                        <span>(${Math.floor(Math.random() * 200) + 50} reviews)</span>
                    </div>
                    <div class="product-stock">
                        <span class="stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-product="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button class="wishlist-btn"><i class="far fa-heart"></i></button>
                </div>
            </div>
        `).join('');

        // Re-initialize event listeners for new products
        this.initializeProductEventListeners();
    }

    initializeProductEventListeners() {
        // Re-initialize add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.product);
                const product = this.products.find(p => p.id === productId);
                if (product && product.stock > 0) {
                    window.cart.addItem(product);
                }
            });
        });

        // Re-initialize wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                this.querySelector('i').classList.toggle('far');
                this.querySelector('i').classList.toggle('fas');
            });
        });
    }

    generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    formatCategory(category) {
        const categories = {
            'camon': 'Camon Series',
            'spark': 'Spark Series',
            'pova': 'Pova Series',
            'phantom': 'Phantom Series',
            'accessories': 'Accessories'
        };
        return categories[category] || category;
    }

    formatBadge(badge) {
        const badges = {
            'best-seller': 'Best Seller',
            'new': 'New',
            'premium': 'Premium',
            'sale': 'On Sale'
        };
        return badges[badge] || badge;
    }

    clearProductForm() {
        document.getElementById('addProductForm').reset();
        this.cancelEdit();
    }

    filterAdminProducts() {
        this.renderAdminProducts();
    }

    loadProducts() {
        const saved = localStorage.getItem('tecnoProducts');
        if (saved) {
            return JSON.parse(saved);
        }

        // Default products
        return [
            {
                id: 1,
                name: "Tecno Camon 20 Pro",
                category: "camon",
                price: 1250000,
                originalPrice: 1450000,
                description: "108MP Camera | 8GB RAM | 256GB Storage",
                image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                badge: "best-seller",
                stock: 15,
                rating: 4.5
            },
            {
                id: 2,
                name: "Tecno Spark 10 Pro",
                category: "spark",
                price: 650000,
                originalPrice: null,
                description: "6.8\" Display | 5000mAh | 8GB RAM",
                image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                badge: "new",
                stock: 25,
                rating: 4.0
            },
            {
                id: 3,
                name: "Tecno Pova 5",
                category: "pova",
                price: 850000,
                originalPrice: null,
                description: "7000mAh Battery | Gaming Phone | 8GB RAM",
                image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                badge: "",
                stock: 18,
                rating: 4.8
            },
            {
                id: 4,
                name: "Tecno Phantom X2 Pro",
                category: "phantom",
                price: 2150000,
                originalPrice: null,
                description: "Flagship | Retractable Camera | 12GB RAM",
                image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                badge: "premium",
                stock: 8,
                rating: 4.7
            }
        ];
    }

    saveProducts() {
        localStorage.setItem('tecnoProducts', JSON.stringify(this.products));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global Admin Functions
function showAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'flex';
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'none';
    document.getElementById('adminLoginForm').reset();
}

function toggleAdminPanel() {
    const adminPanel = document.getElementById('admin');
    adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
}

function clearProductForm() {
    if (window.adminManager) {
        window.adminManager.clearProductForm();
    }
}

function filterAdminProducts() {
    if (window.adminManager) {
        window.adminManager.filterAdminProducts();
    }
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Initialize shopping cart
    window.cart = new ShoppingCart();
    
    // Initialize promo timer
    window.promoTimer = new PromoTimer();
    
    // Initialize admin manager
    window.adminManager = new AdminProductManager();
    
    // Initialize other components
    window.whatsappIntegration = new WhatsAppIntegration();
    window.enhancedFiltering = new EnhancedFiltering();
    window.socialMedia = new SocialMediaIntegration();
    window.analytics = new Analytics();
    window.mobileEnhancements = new MobileEnhancements();

    // Render initial products
    window.adminManager.renderProducts();
});

// Update the ShoppingCart class to use admin products
// Replace the getProductData method in ShoppingCart class:
ShoppingCart.prototype.getProductData = function(productId) {
    if (window.adminManager && window.adminManager.products) {
        const product = window.adminManager.products.find(p => p.id === parseInt(productId));
        if (product) {
            return {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category
            };
        }
    }
    
    // Fallback to original products if admin manager not available
    const products = {
        1: {
            id: 1,
            name: "Tecno Camon 20 Pro",
            price: 1250000,
            image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            category: "camon"
        },
        // ... other products
    };
    return products[productId];
};

// Add this after your cart initialization
document.addEventListener('DOMContentLoaded', function() {
    // Force cart to be available globally
    window.debugCart = function() {
        console.log('Cart state:', {
            items: window.cart.items,
            element: document.querySelector('.cart-sidebar'),
            count: document.querySelector('.cart-count')
        });
        window.cart.toggleCart();
    };
    
    // Test if cart icon exists and is clickable
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        console.log('Cart icon found');
        cartIcon.addEventListener('click', function() {
            console.log('Cart icon clicked');
            window.cart.toggleCart();
        });
    } else {
        console.error('Cart icon not found!');
    }
});

// Add this function to manually show/hide cart
function toggleCartManually() {
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
        
        // Update cart items if showing
        if (cartSidebar.classList.contains('active')) {
            window.cart.renderCartItems();
        }
    } else {
        console.error('Cart elements not found');
        alert('Cart elements missing from page');
    }
}

// Replace the cart icon click handler
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-icon') || e.target.closest('.cart-icon')) {
        toggleCartManually();
    }
});

    
    // Initialize mobile enhancements
    document.addEventListener('DOMContentLoaded', function() {
        window.mobileEnhancements = new MobileEnhancements();
    });

    // Add this right before the DOMContentLoaded event
function debugCartSetup() {
    console.log('=== CART DEBUG INFO ===');
    console.log('1. Cart sidebar exists:', !!document.querySelector('.cart-sidebar'));
    console.log('2. Cart overlay exists:', !!document.querySelector('.cart-overlay'));
    console.log('3. Cart icon exists:', !!document.querySelector('.cart-icon'));
    console.log('4. Cart count exists:', !!document.querySelector('.cart-count'));
    console.log('5. Window.cart exists:', !!window.cart);
    console.log('=== END DEBUG INFO ===');
}

// Test after page loads
setTimeout(debugCartSetup, 1000);
    
    // Export classes for global access
    window.ShoppingCart = ShoppingCart;
    window.PromoTimer = PromoTimer;
    window.WhatsAppIntegration = WhatsAppIntegration;
    window.EnhancedFiltering = EnhancedFiltering;
    window.SocialMediaIntegration = SocialMediaIntegration;
    window.Analytics = Analytics;
    window.MobileEnhancements = MobileEnhancements;