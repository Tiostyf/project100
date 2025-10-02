// Global variables
let currentUser = null;
const API_BASE = window.location.origin;

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        
        // If on login/register page but already logged in, redirect to home
        if (window.location.pathname === '/login.html' || 
            window.location.pathname === '/register.html' ||
            window.location.pathname === '/') {
            window.location.href = '/home.html';
        }
        
        updateNavForLoggedInUser();
    } else {
        // If on protected page but not logged in, redirect to login
        if (window.location.pathname === '/home.html' || 
            window.location.pathname === '/service.html' || 
            window.location.pathname === '/review.html') {
            window.location.href = '/login.html';
        }
    }
}

// Update navigation for logged in user
function updateNavForLoggedInUser() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.style.display = 'block';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    window.location.href = '/';
}

// Register form handling
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        
        try {
            const response = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/home.html';
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        }
    });
}

// Login form handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        
        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/home.html';
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    });
}

// Review form handling
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to submit a review');
            window.location.href = '/login.html';
            return;
        }
        
        const formData = {
            description: document.getElementById('description').value,
            rating: parseInt(document.getElementById('rating').value),
            image: document.getElementById('image').value
        };
        
        try {
            const response = await fetch(`${API_BASE}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Review submitted successfully!');
                reviewForm.reset();
                loadReviews();
            } else {
                alert(data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Review submission error:', error);
            alert('An error occurred while submitting your review');
        }
    });
}

// Load reviews
async function loadReviews() {
    try {
        const response = await fetch(`${API_BASE}/api/reviews`);
        const reviews = await response.json();
        
        const reviewsContainer = document.getElementById('reviewsContainer');
        if (reviewsContainer) {
            reviewsContainer.innerHTML = '';
            
            if (reviews.length === 0) {
                reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to share your experience!</p>';
                return;
            }
            
            reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review-item';
                
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                
                reviewElement.innerHTML = `
                    <div class="review-header">
                        <img src="${review.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}" alt="${review.name}">
                        <div class="review-user">
                            <h4>${review.name}</h4>
                            <small>${new Date(review.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div class="review-rating">${stars}</div>
                    </div>
                    <div class="review-content">
                        <p>${review.description}</p>
                    </div>
                `;
                
                reviewsContainer.appendChild(reviewElement);
            });
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Logout button event listener
document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn') {
        e.preventDefault();
        logout();
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Load reviews if on review page
    if (window.location.pathname === '/review.html') {
        loadReviews();
    }
});
// Default user data (fallback)
const defaultUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000 - 15 * 60 * 1000),
    lastActivity: new Date(Date.now() - 5 * 60 * 1000)
};

// Get user data from localStorage or fallback
function getUserData() {
    const stored = JSON.parse(localStorage.getItem('userData'));
    return stored || defaultUser;
}

// Generate initials
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Calculate session duration
function timeDifference(start, end) {
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hours ${mins} minutes`;
}

// Update UI
function updateUserInfo() {
    const user = getUserData();
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userAvatar').textContent = getInitials(user.name);

    const now = new Date();
    document.getElementById('loginTime').textContent = `Today, ${formatTime(new Date(user.loginTime))}`;
    document.getElementById('sessionDuration').textContent = timeDifference(new Date(user.loginTime), now);
    const minsAgo = Math.floor((now - new Date(user.lastActivity)) / (1000 * 60));
    document.getElementById('lastActivity').textContent = `${minsAgo} minutes ago`;
}

// Logout
function handleLogout() {
    const btn = document.getElementById('logoutBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
    btn.disabled = true;

    setTimeout(() => {
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }, 1500);
}

// Cancel
function handleCancel() {
    window.history.back();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Save default user if none exists
    if (!localStorage.getItem('userData')) {
        localStorage.setItem('userData', JSON.stringify(defaultUser));
    }

    updateUserInfo();

    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);

    setInterval(updateUserInfo, 60000); // update session duration every minute
});
