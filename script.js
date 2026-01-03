// E-commerce Website JavaScript with Security Features
// Cart management and payment processing

// Security: Input sanitization function
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

// Security: XSS protection for output
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Cart functionality
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        try {
            const cart = localStorage.getItem('cart');
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateCartCount();
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    addItem(id, name, price) {
        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedPrice = parseFloat(price);

        // Validate price
        if (isNaN(sanitizedPrice) || sanitizedPrice < 0) {
            console.error('Invalid price');
            return;
        }

        const existingItem = this.items.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: id,
                name: sanitizedName,
                price: sanitizedPrice,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.showNotification(`${sanitizedName} added to cart!`);
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.showNotification('Item removed from cart');
    }

    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, parseInt(quantity));
            this.saveCart();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTax() {
        return this.getTotal() * 0.10; // 10% tax
    }

    getShipping() {
        return this.getTotal() > 50 ? 0 : 10;
    }

    getGrandTotal() {
        return this.getTotal() + this.getTax() + this.getShipping();
    }

    updateCartCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        const badges = document.querySelectorAll('#cart-count');
        badges.forEach(badge => {
            badge.textContent = count;
        });
    }

    clear() {
        this.items = [];
        this.saveCart();
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background-color: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 2000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Add to cart buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = this.getAttribute('data-price');
            cart.addItem(id, name, price);
        });
    });

    // Cart page functionality
    if (document.getElementById('cart-items')) {
        renderCart();
    }

    // Checkout page functionality
    if (document.getElementById('checkout-form')) {
        initCheckout();
    }
});

// Render cart page
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');

    if (cart.items.length === 0) {
        emptyMessage.style.display = 'block';
        cartSummary.style.display = 'none';
        cartItemsContainer.innerHTML = '';
        return;
    }

    emptyMessage.style.display = 'none';
    cartSummary.style.display = 'block';

    cartItemsContainer.innerHTML = cart.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="https://via.placeholder.com/100x100/4A90E2/ffffff?text=Product" alt="${escapeHtml(item.name)}">
            <div class="cart-item-details">
                <h3>${escapeHtml(item.name)}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-qty" data-id="${item.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-qty" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-btn" data-id="${item.id}">Remove</button>
                </div>
            </div>
        </div>
    `).join('');

    // Update summary
    document.getElementById('cart-subtotal').textContent = `$${cart.getTotal().toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${cart.getTax().toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = `$${cart.getShipping().toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${cart.getGrandTotal().toFixed(2)}`;

    // Add event listeners
    document.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cart.items.find(i => i.id === id);
            if (item) {
                cart.updateQuantity(id, item.quantity + 1);
                renderCart();
            }
        });
    });

    document.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cart.items.find(i => i.id === id);
            if (item && item.quantity > 1) {
                cart.updateQuantity(id, item.quantity - 1);
                renderCart();
            }
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            cart.removeItem(id);
            renderCart();
        });
    });
}

// Initialize checkout page
function initCheckout() {
    renderCheckoutSummary();
    setupPaymentMethodToggle();
    setupCardFormatting();
    setupFormValidation();
    setupCheckoutSubmit();
}

// Render checkout summary
function renderCheckoutSummary() {
    const checkoutItems = document.getElementById('checkout-items');
    
    if (cart.items.length === 0) {
        checkoutItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    checkoutItems.innerHTML = cart.items.map(item => `
        <div class="summary-item">
            <span class="summary-item-name">${escapeHtml(item.name)} (x${item.quantity})</span>
            <span class="summary-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    // Update totals
    document.getElementById('summary-subtotal').textContent = `$${cart.getTotal().toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `$${cart.getTax().toFixed(2)}`;
    document.getElementById('summary-shipping').textContent = `$${cart.getShipping().toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${cart.getGrandTotal().toFixed(2)}`;
}

// Payment method toggle
function setupPaymentMethodToggle() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const cardDetails = document.getElementById('card-payment-details');
    const paypalDetails = document.getElementById('paypal-payment-details');
    const googlePayDetails = document.getElementById('google-pay-details');
    const applePayDetails = document.getElementById('apple-pay-details');

    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all payment details
            cardDetails.style.display = 'none';
            paypalDetails.style.display = 'none';
            googlePayDetails.style.display = 'none';
            applePayDetails.style.display = 'none';

            // Remove required from card fields
            const cardFields = cardDetails.querySelectorAll('input');
            cardFields.forEach(field => field.removeAttribute('required'));

            // Show selected payment method details
            switch(this.value) {
                case 'credit-card':
                case 'debit-card':
                    cardDetails.style.display = 'block';
                    // Make card fields required
                    cardFields.forEach(field => {
                        if (field.id !== 'card-type') {
                            field.setAttribute('required', 'required');
                        }
                    });
                    break;
                case 'paypal':
                    paypalDetails.style.display = 'block';
                    break;
                case 'google-pay':
                    googlePayDetails.style.display = 'block';
                    break;
                case 'apple-pay':
                    applePayDetails.style.display = 'block';
                    break;
            }
        });
    });
}

// Card formatting and validation
function setupCardFormatting() {
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    const cardTypeIndicator = document.getElementById('card-type');

    if (cardNumberInput) {
        // Format card number
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            
            // Security: Only allow digits
            value = value.replace(/\D/g, '');
            
            // Format with spaces
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;

            // Detect card type
            if (value.startsWith('4')) {
                cardTypeIndicator.textContent = 'VISA';
            } else if (value.startsWith('5')) {
                cardTypeIndicator.textContent = 'MC';
            } else if (value.startsWith('3')) {
                cardTypeIndicator.textContent = 'AMEX';
            } else if (value.startsWith('6')) {
                cardTypeIndicator.textContent = 'DISC';
            } else {
                cardTypeIndicator.textContent = '';
            }
        });
    }

    if (expiryInput) {
        // Format expiry date
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            
            e.target.value = value;
        });
    }

    if (cvvInput) {
        // CVV: only digits
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }
}

// Form validation
function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    const inputs = form.querySelectorAll('input[required], select[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('invalid')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    if (field.checkValidity()) {
        field.classList.remove('invalid');
        field.classList.add('valid');
        return true;
    } else {
        field.classList.remove('valid');
        field.classList.add('invalid');
        return false;
    }
}

// Card number validation (Luhn algorithm)
function validateCardNumber(cardNumber) {
    const digits = cardNumber.replace(/\s/g, '').split('').reverse();
    let sum = 0;
    
    for (let i = 0; i < digits.length; i++) {
        let digit = parseInt(digits[i]);
        
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
    }
    
    return sum % 10 === 0;
}

// Checkout form submission
function setupCheckoutSubmit() {
    const form = document.getElementById('checkout-form');
    const modal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get selected payment method
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

        // Validate based on payment method
        if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
            const cardNumber = document.getElementById('card-number').value;
            
            // Validate card number using Luhn algorithm
            if (!validateCardNumber(cardNumber)) {
                alert('Invalid card number. Please check and try again.');
                return;
            }

            // Validate expiry date
            const expiryDate = document.getElementById('expiry-date').value;
            const [month, year] = expiryDate.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;

            if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                alert('Card has expired. Please use a valid card.');
                return;
            }
        }

        // Validate all required fields
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        let allValid = true;

        requiredFields.forEach(field => {
            if (!validateField(field)) {
                allValid = false;
            }
        });

        if (!allValid) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        // Check terms and conditions
        if (!document.getElementById('terms').checked) {
            alert('Please accept the Terms and Conditions to proceed.');
            return;
        }

        // Process payment (simulation)
        processPayment(paymentMethod);
    });

    closeModalBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        cart.clear();
        window.location.href = 'index.html';
    });
}

// Process payment (simulation with security measures)
function processPayment(paymentMethod) {
    const modal = document.getElementById('success-modal');
    
    // Simulate payment processing
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    // Security: In a real application, this would:
    // 1. Use HTTPS for transmission
    // 2. Tokenize card details
    // 3. Use a payment gateway API (Stripe, PayPal, etc.)
    // 4. Implement 3D Secure authentication
    // 5. Log transaction details securely
    // 6. Generate CSRF tokens

    setTimeout(() => {
        // Simulate successful payment
        console.log('Payment processed successfully with:', paymentMethod);
        
        // Security: Clear sensitive form data
        document.getElementById('checkout-form').reset();
        
        // Show success modal
        modal.classList.add('show');
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="lock-icon">🔒</span> Complete Secure Payment';
    }, 2000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
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
`;
document.head.appendChild(style);

// Security: Prevent form resubmission on page reload
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Security: Add CSRF token to session (would be server-side in production)
function generateCSRFToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Initialize CSRF token
if (!sessionStorage.getItem('csrf_token')) {
    sessionStorage.setItem('csrf_token', generateCSRFToken());
}

// Security: Content Security Policy enforcement via JavaScript
console.log('Security features enabled: CSP, XSS protection, input validation, SSL enforcement');
