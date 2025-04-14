import apiService from './api.js';

// DOM Elements
const productList = document.getElementById('product-list');
const orderForm = document.getElementById('order-form');
const referralSection = document.getElementById('referral-section');
const pointsDisplay = document.getElementById('points-display');

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load products
        const products = await apiService.getProducts();
        renderProducts(products);

        // Setup event listeners
        orderForm.addEventListener('submit', handleOrderSubmit);
        
        // Load user data if logged in
        if (localStorage.getItem('token')) {
            loadUserData();
        }
    } catch (error) {
        handleApiError(error);
    }
});

// Product rendering
function renderProducts(products) {
    productList.innerHTML = products.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Price: ₹${product.price}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        </div>
    `).join('');

    // Add event listeners to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Order handling
async function handleOrderSubmit(e) {
    e.preventDefault();
    const formData = new FormData(orderForm);
    const orderData = {
        products: Array.from(document.querySelectorAll('.cart-item')).map(item => ({
            id: item.dataset.id,
            quantity: item.querySelector('.quantity').value
        })),
        shippingAddress: formData.get('address'),
        paymentMethod: formData.get('payment')
    };

    try {
        const order = await apiService.createOrder(orderData);
        alert(`Order #${order.id} placed successfully!`);
        orderForm.reset();
    } catch (error) {
        handleApiError(error);
    }
}

// User data loading
async function loadUserData() {
    try {
        const userId = localStorage.getItem('userId');
        const [referrals, points] = await Promise.all([
            apiService.getReferrals(userId),
            apiService.getPoints(userId)
        ]);

        renderReferrals(referrals);
        renderPoints(points);
    } catch (error) {
        handleApiError(error);
    }
}

// Helper functions
function renderReferrals(referrals) {
    referralSection.innerHTML = `
        <h3>Your Referrals</h3>
        <ul>
            ${referrals.map(ref => `<li>${ref.name} - ${ref.status}</li>`).join('')}
        </ul>
    `;
}

function renderPoints(points) {
    pointsDisplay.innerHTML = `
        <h3>Your Points: ${points.balance}</h3>
        <button id="redeem-points">Redeem Points</button>
    `;
    document.getElementById('redeem-points').addEventListener('click', showRedemptionForm);
}
