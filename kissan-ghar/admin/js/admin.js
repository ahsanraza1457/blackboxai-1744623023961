// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Utility Functions
async function makeApiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication Functions
async function login(username, password) {
    try {
        const response = await makeApiRequest('/auth/login', 'POST', { username, password });
        localStorage.setItem('adminToken', response.token);
        return true;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
}

function logout() {
    localStorage.removeItem('adminToken');
}

function isAuthenticated() {
    return !!localStorage.getItem('adminToken');
}

// Product Management Functions
async function getProducts() {
    return await makeApiRequest('/products');
}

async function addProduct(productData) {
    return await makeApiRequest('/products', 'POST', productData);
}

async function updateProduct(id, productData) {
    return await makeApiRequest(`/products/${id}`, 'PUT', productData);
}

async function deleteProduct(id) {
    return await makeApiRequest(`/products/${id}`, 'DELETE');
}

// User Management Functions
async function getUsers() {
    return await makeApiRequest('/users');
}

async function getUser(id) {
    return await makeApiRequest(`/users/${id}`);
}

async function updateUser(id, userData) {
    return await makeApiRequest(`/users/${id}`, 'PUT', userData);
}

// Order Management Functions
async function getOrders() {
    return await makeApiRequest('/orders');
}

async function getOrder(id) {
    return await makeApiRequest(`/orders/${id}`);
}

async function updateOrderStatus(id, status) {
    return await makeApiRequest(`/orders/${id}/status`, 'PATCH', { status });
}

async function loadOrders() {
    try {
        const orders = await getOrders();
        const ordersTable = document.getElementById('orders-table');
        ordersTable.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">User #${order.user_id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date(order.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">₹${order.total_amount.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}">
                        ${order.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="text-blue-600 hover:text-blue-900 mr-2 view-order" data-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-900 update-order" data-id="${order.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            ordersTable.appendChild(row);
        });

        // Add event listeners
        document.querySelectorAll('.view-order').forEach(button => {
            button.addEventListener('click', async function() {
                const orderId = this.getAttribute('data-id');
                const order = await getOrder(orderId);
                
                // Show order details in a modal
                alert(`Order Details:\n\nID: ${order.id}\nUser: ${order.user_id}\nStatus: ${order.status}\nTotal: ₹${order.total_amount.toFixed(2)}\nItems: ${order.items.length}`);
            });
        });

        document.querySelectorAll('.update-order').forEach(button => {
            button.addEventListener('click', async function() {
                const orderId = this.getAttribute('data-id');
                const newStatus = prompt('Enter new status (pending, processing, shipped, delivered, cancelled):');
                
                if (newStatus) {
                    try {
                        await updateOrderStatus(orderId, newStatus);
                        alert('Order status updated successfully!');
                        loadOrders();
                    } catch (error) {
                        alert('Failed to update order status');
                    }
                }
            });
        });

    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

// Dashboard Functions
async function getDashboardStats() {
    return await makeApiRequest('/dashboard/stats');
}

// Initialize Admin Panel
// Referral System Functions
async function loadReferrals() {
    try {
        const response = await fetch(`${API_BASE_URL}/referrals`);
        const referrals = await response.json();
        
        const table = document.getElementById('referrals-table');
        table.innerHTML = '';
        
        referrals.forEach(ref => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${ref.referrer_id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${ref.referred_id}</td>
                <td class="px-6 py-4 whitespace-nowrap">Level ${ref.level}</td>
                <td class="px-6 py-4 whitespace-nowrap">${ref.points_earned}</td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date(ref.date).toLocaleDateString()}</td>
            `;
            table.appendChild(row);
        });
        
        // Update stats
        document.getElementById('total-referrals').textContent = referrals.length;
        const totalPoints = referrals.reduce((sum, ref) => sum + ref.points_earned, 0);
        document.getElementById('total-points').textContent = totalPoints;
    } catch (error) {
        console.error('Failed to load referrals:', error);
    }
}

async function loadRedemptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/redemptions`);
        const redemptions = await response.json();
        document.getElementById('total-redemptions').textContent = redemptions.length;
    } catch (error) {
        console.error('Failed to load redemptions:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!isAuthenticated() && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Load dashboard data
    if (document.getElementById('dashboard-section')) {
        try {
            const stats = await getDashboardStats();
            document.getElementById('total-products').textContent = stats.totalProducts;
            document.getElementById('total-users').textContent = stats.totalUsers;
            document.getElementById('total-orders').textContent = stats.totalOrders;

            const orders = await getOrders();
            const recentOrders = orders.slice(0, 5);
            const ordersTable = document.getElementById('recent-orders');
            
            recentOrders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${order.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.customerName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${new Date(order.date).toLocaleDateString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">₹${order.amount.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}">
                            ${order.status}
                        </span>
                    </td>
                `;
                ordersTable.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    // Load referral data when section is shown
    document.querySelector('.referrals-link').addEventListener('click', async function() {
        await loadReferrals();
        await loadRedemptions();
    });

    // Load orders data when section is shown
    document.querySelector('.orders-link').addEventListener('click', async function() {
        await loadOrders();
    });

    // Load products table
    if (document.getElementById('products-table')) {
        try {
            const products = await getProducts();
            const productsTable = document.getElementById('products-table');
            
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${product.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}" class="h-10 w-10 rounded-full">
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${product.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">₹${product.price.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="text-green-600 hover:text-green-900 mr-2 edit-product" data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900 delete-product" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                productsTable.appendChild(row);
            });

            // Add event listeners for edit/delete buttons
            document.querySelectorAll('.edit-product').forEach(button => {
                button.addEventListener('click', async function() {
                    const productId = this.getAttribute('data-id');
                    const product = products.find(p => p.id == productId);
                    
                    document.getElementById('product-modal-title').textContent = 'Edit Product';
                    document.getElementById('product-id').value = product.id;
                    document.getElementById('product-name').value = product.name;
                    document.getElementById('product-price').value = product.price;
                    document.getElementById('product-description').value = product.description;
                    document.getElementById('product-image').value = product.image;
                    
                    document.getElementById('product-modal').classList.remove('hidden');
                });
            });

            document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', async function() {
                    const productId = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this product?')) {
                        try {
                            await deleteProduct(productId);
                            window.location.reload();
                        } catch (error) {
                            alert('Failed to delete product');
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }

    // Handle product form submission
    if (document.getElementById('product-form')) {
        document.getElementById('product-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const productId = document.getElementById('product-id').value;
            const productData = {
                name: document.getElementById('product-name').value,
                price: parseFloat(document.getElementById('product-price').value),
                description: document.getElementById('product-description').value,
                image: document.getElementById('product-image').value
            };

            try {
                if (productId) {
                    await updateProduct(productId, productData);
                } else {
                    await addProduct(productData);
                }
                
                document.getElementById('product-modal').classList.add('hidden');
                window.location.reload();
            } catch (error) {
                alert('Failed to save product');
            }
        });
    }
});

function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}
