// API Service for Kissan Ghar Customer Interface
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
    }

    // Product APIs
    async getProducts() {
        const response = await fetch(`${this.baseURL}/products`);
        return await response.json();
    }

    async addProduct(productData) {
        const response = await fetch(`${this.baseURL}/products`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(productData)
        });
        return await response.json();
    }

    // User Authentication APIs
    async registerUser(userData) {
        const response = await fetch(`${this.baseURL}/users`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });
        return await response.json();
    }

    async login(credentials) {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials)
        });
        return await response.json();
    }

    // Referral System APIs
    async getReferrals(userId) {
        const response = await fetch(`${this.baseURL}/referrals/${userId}`);
        return await response.json();
    }

    // Points System APIs
    async earnPoints(pointsData) {
        const response = await fetch(`${this.baseURL}/points/earn`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(pointsData)
        });
        return await response.json();
    }

    async redeemPoints(redemptionData) {
        const response = await fetch(`${this.baseURL}/points/redeem`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(redemptionData)
        });
        return await response.json();
    }

    // Order Management APIs
    async createOrder(orderData) {
        const response = await fetch(`${this.baseURL}/orders`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(orderData)
        });
        return await response.json();
    }

    async getOrderStatus(orderId) {
        const response = await fetch(`${this.baseURL}/orders/${orderId}`);
        return await response.json();
    }
}

// Initialize API Service
const apiService = new APIService();

// Helper function for error handling
function handleApiError(error) {
    console.error('API Error:', error);
    // Display user-friendly error message
    alert('An error occurred. Please try again later.');
}

// Export for use in other JS files
export default apiService;
