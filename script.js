const CART_KEY = 'grodeliveryCart';
const DELIVERY_FEE = 110;
const TAX_RATE = 0.1;
const DISCOUNT_RATE = 0.1;

function loadCart() {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function formatKES(amount) {
    return `KES ${amount.toFixed(0)}`;
}

function parsePrice(text) {
    return parseFloat(text.replace(/[^0-9.\-]/g, '')) || 0;
}

function getCartCount(cart) {
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

function updateCartCount() {
    const count = getCartCount(loadCart());
    const countElements = document.querySelectorAll('.cart-count-badge, #cartCount');
    countElements.forEach(el => {
        el.textContent = count;
        el.style.display = count ? 'inline-block' : 'none';
    });
}

function addToCart(product) {
    const cart = loadCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    renderCartPage();
    showToast(`${product.title} added to cart`);
}

function showToast(message) {
    let toast = document.getElementById('toastMessage');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastMessage';
        toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:10px 18px;border-radius:24px;font-size:0.95rem;z-index:9999;opacity:0;transition:opacity 0.2s ease-in-out;pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
    }, 2000);
}

function setupProductButtons() {
    const buttons = document.querySelectorAll('.btn-add-cart');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card');
            if (!card) return;
            const title = card.querySelector('h3')?.textContent.trim() || 'Product';
            const desc = card.querySelector('.product-desc')?.textContent.trim() || '';
            const price = parsePrice(card.querySelector('.price')?.textContent || '0');
            const image = card.querySelector('img')?.src || '';
            const id = title.toLowerCase().replace(/[^a-z0-9]+/gi, '-');
            addToCart({ id, title, desc, price, image });
        });
    });
}

function setupCartPage() {
    const container = document.querySelector('.cart-items-section');
    if (!container) return;
    renderCartPage();
    container.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        const itemId = button.dataset.id;
        const action = button.dataset.action;
        if (!itemId) return;
        if (action === 'remove') {
            removeCartItem(itemId);
        } else if (action === 'decrease') {
            changeItemQuantity(itemId, -1);
        } else if (action === 'increase') {
            changeItemQuantity(itemId, 1);
        }
    });
    container.addEventListener('input', event => {
        const input = event.target.closest('input[type="number"]');
        if (!input) return;
        const itemId = input.dataset.id;
        const quantity = parseInt(input.value, 10);
        if (!itemId || Number.isNaN(quantity)) return;
        updateItemQuantity(itemId, Math.max(1, quantity));
    });
    const checkoutButton = document.getElementById('checkoutBtn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', event => {
            const cart = loadCart();
            if (!cart.length) {
                event.preventDefault();
                alert('Your cart is empty. Add items before checkout.');
            } else {
                alert('Checkout is not yet implemented. Your cart is saved and ready.');
            }
        });
    }
}

function renderCartPage() {
    const cart = loadCart();
    const container = document.querySelector('.cart-items-section');
    const checkoutButton = document.getElementById('checkoutBtn');
    if (!container) return;
    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty.</p>
                <a href="../Grodelivery.html" class="continue-shopping">Continue shopping</a>
            </div>
        `;
        if (checkoutButton) checkoutButton.disabled = true;
        updateSummary([]);
        return;
    }
    if (checkoutButton) checkoutButton.disabled = false;
    container.innerHTML = '';
    cart.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        itemRow.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-details">
                <h3>${item.title}</h3>
                <p class="item-desc">${item.desc}</p>
                <p class="item-price">${formatKES(item.price)}</p>
            </div>
            <div class="item-quantity">
                <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                <input type="number" min="1" value="${item.quantity}" data-id="${item.id}">
                <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
            </div>
            <div class="item-total">${formatKES(item.price * item.quantity)}</div>
            <button class="remove" data-id="${item.id}" data-action="remove">?</button>
        `;
        container.appendChild(itemRow);
    });
    updateSummary(cart);
}

function updateItemQuantity(itemId, quantity) {
    const cart = loadCart();
    const item = cart.find(entry => entry.id === itemId);
    if (!item) return;
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
    renderCartPage();
}

function changeItemQuantity(itemId, delta) {
    const cart = loadCart();
    const item = cart.find(entry => entry.id === itemId);
    if (!item) return;
    item.quantity = Math.max(1, item.quantity + delta);
    saveCart(cart);
    renderCartPage();
}

function removeCartItem(itemId) {
    const cart = loadCart().filter(item => item.id !== itemId);
    saveCart(cart);
    renderCartPage();
}

function updateSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal ? DELIVERY_FEE : 0;
    const tax = Math.round(subtotal * TAX_RATE);
    const discount = Math.round(subtotal * DISCOUNT_RATE);
    const total = Math.max(0, subtotal + delivery + tax - discount);
    document.getElementById('subtotalValue').textContent = formatKES(subtotal);
    document.getElementById('deliveryValue').textContent = formatKES(delivery);
    document.getElementById('taxValue').textContent = formatKES(tax);
    document.getElementById('discountValue').textContent = `-KES ${discount.toFixed(0)}`;
    document.getElementById('totalValue').textContent = formatKES(total);
}

function initPage() {
    updateCartCount();
    setupProductButtons();
    setupCartPage();
}

document.addEventListener('DOMContentLoaded', initPage);
