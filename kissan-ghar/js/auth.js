document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    const token = localStorage.getItem('authToken');
    updateAuthUI(token);

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = {
                email: this.email.value,
                password: this.password.value
            };

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('authToken', data.token);
                    updateAuthUI(data.token);
                    window.location.href = 'index.html';
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('authToken');
            updateAuthUI(null);
            window.location.href = 'login.html';
        });
    }

    // Update UI based on auth status
    function updateAuthUI(token) {
        const authLinks = document.querySelectorAll('.auth-link');
        authLinks.forEach(link => {
            if (token) {
                link.classList.toggle('hidden', link.classList.contains('logged-out'));
                link.classList.toggle('block', link.classList.contains('logged-in'));
            } else {
                link.classList.toggle('hidden', link.classList.contains('logged-in'));
                link.classList.toggle('block', link.classList.contains('logged-out'));
            }
        });
    }
});
