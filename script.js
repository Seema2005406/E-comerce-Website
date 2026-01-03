// Product Data
const products = [
    // Custom PCBs
    {
        id: 1,
        name: "Arduino Uno Compatible PCB",
        category: "pcb",
        price: 24.99,
        description: "Custom-made PCB compatible with Arduino Uno",
        icon: "fa-microchip"
    },
    {
        id: 2,
        name: "ESP32 Development Board PCB",
        category: "pcb",
        price: 34.99,
        description: "WiFi + Bluetooth enabled PCB",
        icon: "fa-wifi"
    },
    {
        id: 3,
        name: "STM32 Blue Pill PCB",
        category: "pcb",
        price: 19.99,
        description: "ARM Cortex-M3 based development board",
        icon: "fa-microchip"
    },
    {
        id: 4,
        name: "Custom Sensor PCB",
        category: "pcb",
        price: 29.99,
        description: "Multi-sensor integration PCB",
        icon: "fa-plug"
    },
    // Arduino & Dev Boards
    {
        id: 5,
        name: "Arduino Mega 2560",
        category: "arduino",
        price: 45.99,
        description: "54 digital I/O pins, 16 analog inputs",
        icon: "fa-microchip"
    },
    {
        id: 6,
        name: "Raspberry Pi 4 Model B",
        category: "arduino",
        price: 89.99,
        description: "4GB RAM, Quad-core processor",
        icon: "fa-raspberry-pi"
    },
    {
        id: 7,
        name: "NodeMCU ESP8266",
        category: "arduino",
        price: 12.99,
        description: "WiFi development board",
        icon: "fa-wifi"
    },
    {
        id: 8,
        name: "Arduino Nano",
        category: "arduino",
        price: 18.99,
        description: "Compact Arduino board",
        icon: "fa-microchip"
    },
    // Sensors
    {
        id: 9,
        name: "DHT22 Temperature Sensor",
        category: "sensor",
        price: 8.99,
        description: "Digital temperature and humidity sensor",
        icon: "fa-temperature-high"
    },
    {
        id: 10,
        name: "Ultrasonic Distance Sensor",
        category: "sensor",
        price: 5.99,
        description: "HC-SR04 ultrasonic ranging module",
        icon: "fa-broadcast-tower"
    },
    {
        id: 11,
        name: "MPU6050 Gyroscope",
        category: "sensor",
        price: 9.99,
        description: "6-axis accelerometer and gyroscope",
        icon: "fa-compass"
    },
    {
        id: 12,
        name: "PIR Motion Sensor",
        category: "sensor",
        price: 4.99,
        description: "Passive infrared motion detector",
        icon: "fa-video"
    },
    // Components
    {
        id: 13,
        name: "LED Assortment Kit",
        category: "component",
        price: 14.99,
        description: "500 LEDs in various colors",
        icon: "fa-lightbulb"
    },
    {
        id: 14,
        name: "Resistor Kit",
        category: "component",
        price: 11.99,
        description: "1000 resistors, various values",
        icon: "fa-bolt"
    },
    {
        id: 15,
        name: "Capacitor Set",
        category: "component",
        price: 13.99,
        description: "Electrolytic and ceramic capacitors",
        icon: "fa-battery-half"
    },
    {
        id: 16,
        name: "Transistor Kit",
        category: "component",
        price: 16.99,
        description: "200 NPN and PNP transistors",
        icon: "fa-plug"
    }
];

// Shopping Cart
let cart = [];
let currentFilter = 'all';
let selectedPaymentMethod = 'credit-card';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCartFromStorage();
    updateCartDisplay();
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchProducts(e.target.value);
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.querySelector('#cardPaymentForm input[placeholder*="1234"]');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    const expiryInput = document.querySelector('#cardPaymentForm input[placeholder*="MM/YY"]');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
});

// Load Products
function loadProducts(filter = 'all') {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(p => p.category === filter);

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <i class="fas ${product.icon}"></i>
        </div>
        <div class="product-details">
            <div class="product-category">${getCategoryName(product.category)}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-footer">
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add
                </button>
            </div>
        </div>
    `;
    return card;
}

// Get Category Display Name
function getCategoryName(category) {
    const names = {
        'pcb': 'Custom PCB',
        'arduino': 'Arduino/Dev Board',
        'sensor': 'Sensor',
        'component': 'Component'
    };
    return names[category] || category;
}

// Filter Products
function filterProducts(category, buttonElement) {
    currentFilter = category;
    loadProducts(category);
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
}

// Search Products
function searchProducts(query) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    const searchResults = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );

    if (searchResults.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem;">No products found.</p>';
        return;
    }

    searchResults.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCartToStorage();
    updateCartDisplay();
    showNotification('Product added to cart!');
}

// Update Cart Display
function updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <i class="fas ${item.icon}"></i>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage();
            updateCartDisplay();
        }
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartDisplay();
    showNotification('Product removed from cart');
}

// Toggle Cart Sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('active');
}

// Proceed to Checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');

    checkoutItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>$${itemTotal.toFixed(2)}</span>
        `;
        checkoutItems.appendChild(checkoutItem);
    });

    checkoutTotal.textContent = `$${total.toFixed(2)}`;
    checkoutModal.classList.add('active');
    toggleCart();
}

// Close Checkout Modal
function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.remove('active');
}

// Select Payment Method
function selectPaymentMethod(method, optionElement) {
    selectedPaymentMethod = method;
    
    // Update payment options UI
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('active');
    });
    if (optionElement) {
        optionElement.classList.add('active');
    }
    
    // Update radio button
    const radioId = method.replace('-', '') + (method === 'credit-card' ? 'Card' : method === 'debit-card' ? 'Card' : method === 'google-pay' ? 'Pay' : method === 'apple-pay' ? 'Pay' : '');
    const inputs = document.querySelectorAll('input[name="payment"]');
    inputs.forEach(input => {
        input.checked = false;
    });
    
    // Show/hide payment forms
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });

    if (method === 'credit-card' || method === 'debit-card') {
        document.getElementById('cardPaymentForm').classList.add('active');
    } else if (method === 'paypal') {
        document.getElementById('paypalPaymentForm').classList.add('active');
    } else if (method === 'google-pay') {
        document.getElementById('googlePayForm').classList.add('active');
    } else if (method === 'apple-pay') {
        document.getElementById('applePayForm').classList.add('active');
    } else if (method === 'stripe') {
        document.getElementById('stripeForm').classList.add('active');
    }
}

// Place Order
function placeOrder() {
    // Validate shipping form
    const shippingForm = document.getElementById('shippingForm');
    if (!shippingForm.checkValidity()) {
        shippingForm.reportValidity();
        return;
    }

    // Validate payment form if card payment
    if (selectedPaymentMethod === 'credit-card' || selectedPaymentMethod === 'debit-card') {
        const cardForm = document.getElementById('cardForm');
        if (!cardForm.checkValidity()) {
            cardForm.reportValidity();
            return;
        }
    }

    // Generate order ID
    const orderId = 'ORD-' + Date.now();
    
    // Show success modal
    closeCheckout();
    const successModal = document.getElementById('successModal');
    document.getElementById('orderId').textContent = orderId;
    successModal.classList.add('active');

    // Clear cart
    cart = [];
    saveCartToStorage();
    updateCartDisplay();

    // Log order details (in a real application, this would be sent to a server)
    console.log('Order placed:', {
        orderId: orderId,
        paymentMethod: selectedPaymentMethod,
        total: document.getElementById('checkoutTotal').textContent,
        timestamp: new Date().toISOString()
    });
}

// Close Success Modal
function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    successModal.classList.remove('active');
}

// Show Notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

// Local Storage Functions
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const checkoutModal = document.getElementById('checkoutModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === checkoutModal) {
        closeCheckout();
    }
    if (event.target === successModal) {
        closeSuccessModal();
    }
}
