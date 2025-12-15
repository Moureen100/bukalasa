class Auth {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/auth';
        this.token = localStorage.getItem('token');
        this.userId = localStorage.getItem('userId');
    }

    async register(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Save token and userId
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token and userId
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.baseUrl}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async resetPassword(token, password) {
        try {
            const response = await fetch(`${this.baseUrl}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        return !!this.token && !!this.userId;
    }

    getAuthHeader() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Initialize auth instance
const auth = new Auth();

// Password toggle functionality
function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.querySelector(`[data-toggle="${inputId}"] i`);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    // Setup password toggles
    setupPasswordToggles();
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.querySelector('#loginForm .btn');
            const originalContent = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<div class="spinner"></div>Logging in...';
            submitBtn.disabled = true;
            
            const result = await auth.login(email, password);
            
            if (result.success) {
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage(result.message, 'error');
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            }
        });
    }

    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showMessage('Passwords do not match!', 'error');
                return;
            }
            
            const submitBtn = document.querySelector('#registerForm .btn');
            const originalContent = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<div class="spinner"></div>Registering...';
            submitBtn.disabled = true;
            
            const result = await auth.register(email, password);
            
            if (result.success) {
                showMessage('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'alumni-dashboard.html';
                }, 1500);
            } else {
                showMessage(result.message, 'error');
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            }
        });
    }

    // Forgot password form
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const submitBtn = document.querySelector('#forgotPasswordForm .btn');
            const originalContent = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<div class="spinner"></div>Sending...';
            submitBtn.disabled = true;
            
            const result = await auth.forgotPassword(email);
            
            if (result.success) {
                showMessage('Password reset email sent! Check your inbox.', 'success');
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Email Sent';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                showMessage(result.message, 'error');
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            }
        });
    }

    // Reset password form
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            document.getElementById('resetToken').value = token;
        } else {
            showMessage('Invalid reset link', 'error');
            resetPasswordForm.style.display = 'none';
        }
        
        resetPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const token = document.getElementById('resetToken').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showMessage('Passwords do not match!', 'error');
                return;
            }
            
            const submitBtn = document.querySelector('#resetPasswordForm .btn');
            const originalContent = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<div class="spinner"></div>Resetting...';
            submitBtn.disabled = true;
            
            const result = await auth.resetPassword(token, password);
            
            if (result.success) {
                showMessage('Password reset successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showMessage(result.message, 'error');
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.logout();
        });
    }
});

function setupPasswordToggles() {
    // Find all password fields and add toggle buttons
    const passwordFields = document.querySelectorAll('input[type="password"]');
    
    passwordFields.forEach(field => {
        const container = document.createElement('div');
        container.className = 'password-container';
        
        // Wrap the input field
        const parent = field.parentNode;
        parent.insertBefore(container, field);
        container.appendChild(field);
        
        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.setAttribute('data-toggle', field.id);
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        
        container.appendChild(toggleBtn);
        
        // Add click event
        toggleBtn.addEventListener('click', () => {
            togglePasswordVisibility(field.id);
        });
    });
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    // Add icon based on message type
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    messageDiv.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // Insert message
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}