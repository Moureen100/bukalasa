class Profile {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/profile';
        this.token = localStorage.getItem('token');
        this.userId = localStorage.getItem('userId');
        console.log('Profile class initialized:', {
            hasToken: !!this.token,
            userId: this.userId,
            baseUrl: this.baseUrl
        });
    }

    async saveBiodata(data) {
        console.log('Saving biodata with data:', data);
        console.log('Using token:', this.token ? 'Yes' : 'No');
        
        try {
            const response = await fetch(`${this.baseUrl}/biodata`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);
            
            if (!response.ok) {
                throw new Error(result.message || `Server error: ${response.status}`);
            }

            return { success: true, data: result };
        } catch (error) {
            console.error('Save biodata error:', error);
            return { 
                success: false, 
                message: error.message,
                details: error.toString()
            };
        }
    }

    async getBiodata() {
        try {
            const response = await fetch(`${this.baseUrl}/biodata`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch biodata');
            }

            return { success: true, data: result };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async checkBiodataStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/check-biodata`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to check biodata status');
            }

            return { success: true, data: result };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Initialize profile instance
const profile = new Profile();

// Function to clear biodata form - ENHANCED VERSION
function clearBiodataForm() {
    console.log('🧹 Clearing biodata form...');
    
    // List of all form fields to clear
    const formFields = [
        'surname', 'middleName', 'secondName', 'age', 
        'telephone', 'address', 'nextOfKin', 'email'
    ];
    
    // Clear all text/textarea/email/number fields
    formFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = '';
            
            // Reset visual styles
            element.style.borderColor = '';
            element.style.borderWidth = '';
            element.style.backgroundColor = '';
            element.style.boxShadow = '';
            
            // Add cleared animation
            element.style.transition = 'all 0.3s ease';
            element.style.backgroundColor = '#f1f8e9'; // Light green to show cleared
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 500);
        }
    });
    
    // Reset select fields to default values
    const maritalStatus = document.getElementById('maritalStatus');
    if (maritalStatus) maritalStatus.value = 'Single';
    
    const gender = document.getElementById('gender');
    if (gender) gender.value = 'Male';
    
    // Remove any success checkmarks
    const checkmarks = document.querySelectorAll('.form-checkmark');
    checkmarks.forEach(checkmark => checkmark.remove());
    
    console.log('✅ Biodata form cleared');
}

// Function to show form cleared animation
function showFormClearedAnimation() {
    console.log('🎬 Showing form cleared animation');
    
    const form = document.getElementById('bioDataForm');
    if (!form) return;
    
    // Add pulse animation to each field
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
        setTimeout(() => {
            input.style.transform = 'scale(0.98)';
            input.style.backgroundColor = '#f1f8e9';
            input.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                input.style.transform = '';
                input.style.backgroundColor = '';
            }, 300);
        }, index * 100);
    });
    
    // Show a success overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
    overlay.style.zIndex = '9998';
    overlay.style.pointerEvents = 'none';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 500);
    }, 1500);
}

// Check authentication and biodata status
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard JS loaded');
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
        console.log('No authentication found, redirecting to login');
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    console.log('User authenticated:', userId);
    
    // Check biodata status
    const biodataStatus = await profile.checkBiodataStatus();
    console.log('Biodata status check:', biodataStatus);
    
    // If on dashboard and requires biodata, redirect to bio-data page
    const isDashboard = window.location.pathname.includes('dashboard.html');
    const isBioDataPage = window.location.pathname.includes('bio-data.html');
    
    if (isDashboard && biodataStatus.success && biodataStatus.data.requiresBiodata) {
        console.log('Redirecting to bio-data page (required)');
        window.location.href = 'bio-data.html?required=true';
        return;
    }
    
    // If on bio-data page and it's required, show special message
    if (isBioDataPage && biodataStatus.success && biodataStatus.data.requiresBiodata) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('required') === 'true') {
            showMessage('Please complete your biodata to access the dashboard', 'info');
            
            // Add required indicator to form
            const form = document.getElementById('bioDataForm');
            if (form) {
                const requiredNote = document.createElement('div');
                requiredNote.className = 'message info';
                requiredNote.innerHTML = '<i class="fas fa-exclamation-circle"></i> Complete all fields to continue';
                form.insertBefore(requiredNote, form.firstChild);
            }
        }
    }

    // Load biodata if on bio-data page
    const bioDataForm = document.getElementById('bioDataForm');
    if (bioDataForm) {
        console.log('Bio-data form found, setting up submit handler');
        await loadBiodata();
        
        bioDataForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Bio-data form submitted');
            
            // Validate required fields
            const requiredFields = ['surname', 'secondName', 'age', 'maritalStatus', 'gender', 'telephone', 'address', 'nextOfKin', 'email'];
            let isValid = true;
            let missingFields = [];
            
            requiredFields.forEach(field => {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    isValid = false;
                    missingFields.push(field.replace(/([A-Z])/g, ' $1').toLowerCase());
                    input.style.borderColor = '#f44336';
                    input.style.borderWidth = '2px';
                } else {
                    input.style.borderColor = '#c8e6c9';
                    input.style.borderWidth = '2px';
                }
            });
            
            if (!isValid) {
                showMessage(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
                return;
            }
            
            // Collect form data
            const formData = {
                surname: document.getElementById('surname').value.trim(),
                middle_name: document.getElementById('middleName').value.trim(),
                second_name: document.getElementById('secondName').value.trim(),
                age: parseInt(document.getElementById('age').value),
                marital_status: document.getElementById('maritalStatus').value,
                gender: document.getElementById('gender').value,
                telephone: document.getElementById('telephone').value.trim(),
                address: document.getElementById('address').value.trim(),
                next_of_kin: document.getElementById('nextOfKin').value.trim(),
                email: document.getElementById('email').value.trim()
            };
            
            console.log('Form data prepared:', formData);
            
            const submitBtn = document.querySelector('#bioDataForm .btn');
            const originalContent = submitBtn.innerHTML;
            const originalBackground = submitBtn.style.background;
            
            // Show loading state
            submitBtn.innerHTML = '<div class="spinner"></div>Saving...';
            submitBtn.disabled = true;
            
            try {
                const result = await profile.saveBiodata(formData);
                console.log('Save result:', result);
                
                if (result.success) {
                    // 1. SHOW SUCCESS STATE ON BUTTON IMMEDIATELY
                    submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Saved Successfully!';
                    submitBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
                    submitBtn.style.color = 'white';
                    submitBtn.style.transform = 'scale(1.05)';
                    submitBtn.style.transition = 'all 0.3s ease';
                    
                    // 2. CLEAR THE FORM IMMEDIATELY
                    clearBiodataForm();
                    
                    // 3. SHOW FORM CLEARED ANIMATION
                    showFormClearedAnimation();
                    
                    // 4. SHOW SUCCESS MESSAGE
                    showMessage('✅ Biodata saved successfully! Redirecting to dashboard...', 'success');
                    
                    // 5. DISABLE FORM INPUTS TO PREVENT FURTHER EDITS
                    const formInputs = document.querySelectorAll('#bioDataForm input, #bioDataForm select, #bioDataForm textarea');
                    formInputs.forEach(input => {
                        input.disabled = true;
                        input.style.opacity = '0.7';
                        input.style.cursor = 'not-allowed';
                    });
                    
                    // 6. ADD CHECKMARKS TO EACH FIELD
                    requiredFields.forEach((field, index) => {
                        const input = document.getElementById(field);
                        if (input) {
                            const checkmark = document.createElement('div');
                            checkmark.className = 'form-checkmark';
                            checkmark.innerHTML = '<i class="fas fa-check" style="color: #4caf50;"></i>';
                            checkmark.style.position = 'absolute';
                            checkmark.style.right = '15px';
                            checkmark.style.top = '50%';
                            checkmark.style.transform = 'translateY(-50%)';
                            checkmark.style.zIndex = '100';
                            
                            const parent = input.parentElement;
                            if (parent) {
                                parent.style.position = 'relative';
                                setTimeout(() => {
                                    parent.appendChild(checkmark);
                                }, index * 100);
                                
                                // Remove checkmark after animation
                                setTimeout(() => {
                                    if (parent.contains(checkmark)) {
                                        checkmark.style.opacity = '0';
                                        checkmark.style.transition = 'opacity 0.5s ease';
                                        setTimeout(() => {
                                            if (parent.contains(checkmark)) {
                                                parent.removeChild(checkmark);
                                            }
                                        }, 500);
                                    }
                                }, 1500);
                            }
                        }
                    });
                    
                    // 7. FADE OUT THE FORM
                    const formSections = document.querySelectorAll('#bioDataForm .profile-section');
                    formSections.forEach(section => {
                        section.style.opacity = '0.8';
                        section.style.transition = 'opacity 1s ease';
                    });
                    
                    // 8. REDIRECT AFTER DELAY
                    setTimeout(() => {
                        console.log('Redirecting to dashboard...');
                        window.location.href = 'dashboard.html';
                    }, 2500);
                    
                } else {
                    // Handle error
                    showMessage(`❌ Error: ${result.message}`, 'error');
                    submitBtn.innerHTML = originalContent;
                    submitBtn.style.background = originalBackground;
                    submitBtn.disabled = false;
                }
                
            } catch (error) {
                console.error('Save error:', error);
                showMessage(`❌ Network error: ${error.message}`, 'error');
                submitBtn.innerHTML = originalContent;
                submitBtn.style.background = originalBackground;
                submitBtn.disabled = false;
            }
        });
    }

    // Display biodata on dashboard
    const biodataDisplay = document.getElementById('biodataDisplay');
    if (biodataDisplay && biodataStatus.success && !biodataStatus.data.requiresBiodata) {
        console.log('Loading dashboard data');
        await loadDashboardData();
    }
    
    // Setup logout button
    setupLogoutButton();
});

async function loadDashboardData() {
    console.log('Loading dashboard data...');
    const result = await profile.getBiodata();
    console.log('Biodata fetch result:', result);
    
    if (result.success && result.data && result.data.data) {
        const biodata = result.data.data;
        console.log('Biodata to display:', biodata);
        
        // Update welcome message with name
        const welcomeMessage = document.querySelector('.welcome-message h2');
        if (welcomeMessage && biodata.surname && biodata.second_name) {
            welcomeMessage.textContent = `Welcome, ${biodata.surname} ${biodata.second_name}`;
        }
        
        // Display biodata
        const biodataDisplay = document.getElementById('biodataDisplay');
        if (biodataDisplay) {
            biodataDisplay.innerHTML = `
                <div class="profile-info">
                    <div class="info-item">
                        <label><i class="fas fa-id-card"></i> Surname</label>
                        <span>${biodata.surname || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label><i class="fas fa-user"></i> Middle Name</label>
                        <span>${biodata.middle_name || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label><i class="fas fa-id-card"></i> Second Name</label>
                        <span>${biodata.second_name || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label><i class="fas fa-birthday-cake"></i> Age</label>
                        <span>${biodata.age || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label><i class="fas fa-heart"></i> Marital Status</label>
                        <span>${biodata.marital_status || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label><i class="fas fa-venus-mars"></i> Gender</label>
                        <span>${biodata.gender || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label><i class="fas fa-phone"></i> Telephone</label>
                        <span>${biodata.telephone || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label><i class="fas fa-map-marker-alt"></i> Address</label>
                        <span>${biodata.address || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label><i class="fas fa-users"></i> Next of Kin</label>
                        <span>${biodata.next_of_kin || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <span>${biodata.email || 'Not provided'}</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <a href="bio-data.html" class="btn btn-small">
                        <i class="fas fa-edit"></i> Edit Biodata
                    </a>
                </div>
            `;
        }
    } else {
        console.log('No biodata to display');
        const biodataDisplay = document.getElementById('biodataDisplay');
        if (biodataDisplay) {
            biodataDisplay.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-circle"></i>
                    <h4>No Biodata Found</h4>
                    <p>Complete your profile to connect with fellow alumni</p>
                    <a href="bio-data.html" class="btn">
                        <i class="fas fa-plus-circle"></i> Complete Biodata
                    </a>
                </div>
            `;
        }
    }
}

async function loadBiodata() {
    console.log('Loading existing biodata for form...');
    const result = await profile.getBiodata();
    console.log('Load biodata result:', result);
    
    if (result.success && result.data && result.data.data) {
        const biodata = result.data.data;
        console.log('Filling form with:', biodata);
        
        // Fill form fields
        document.getElementById('surname').value = biodata.surname || '';
        document.getElementById('middleName').value = biodata.middle_name || '';
        document.getElementById('secondName').value = biodata.second_name || '';
        document.getElementById('age').value = biodata.age || '';
        document.getElementById('maritalStatus').value = biodata.marital_status || 'Single';
        document.getElementById('gender').value = biodata.gender || 'Male';
        document.getElementById('telephone').value = biodata.telephone || '';
        document.getElementById('address').value = biodata.address || '';
        document.getElementById('nextOfKin').value = biodata.next_of_kin || '';
        document.getElementById('email').value = biodata.email || '';
    } else {
        console.log('No existing biodata to load');
    }
}

function showMessage(message, type) {
    console.log('Showing message:', type, message);
    
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

function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('Logging out...');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = 'login.html';
        });
    }
}

// Add CSS for animations
if (!document.querySelector('#form-animations')) {
    const style = document.createElement('style');
    style.id = 'form-animations';
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0.7; }
        }
        
        .success-pulse {
            animation: pulse 0.5s ease-in-out;
        }
        
        .form-clearing {
            animation: fadeOut 1s ease forwards;
        }
        
        .form-checkmark {
            animation: pulse 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Add these functions to dashboard.js

// Export biodata as PDF
function exportBiodata() {
    console.log('Exporting biodata...');
    showMessage('Preparing your biodata for export...', 'info');
    
    // In a real implementation, you would:
    // 1. Fetch current biodata
    // 2. Use jsPDF or html2pdf library to generate PDF
    // 3. Download the PDF
    
    // For now, redirect to view-biodata page for printing
    setTimeout(() => {
        window.open('view-biodata.html', '_blank');
    }, 1000);
}

// Share profile function
function shareProfile() {
    console.log('Sharing profile...');
    
    // Get user info
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail') || '';
    
    // Create shareable link
    const shareText = `I'm on the Bukalasa 2008 Alumni Network!`;
    const shareUrl = window.location.origin + '/view-biodata.html';
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Bukalasa 2008 Alumni Profile',
            text: shareText,
            url: shareUrl
        })
        .then(() => console.log('Profile shared successfully'))
        .catch(error => {
            console.log('Error sharing:', error);
            copyToClipboard(shareUrl);
        });
    } else {
        // Fallback: copy to clipboard
        copyToClipboard(shareUrl);
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showMessage('Profile link copied to clipboard!', 'success');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            showMessage('Failed to copy link. Please copy manually.', 'error');
        });
}

// Function to view biodata (called from dashboard)
function viewBiodata() {
    console.log('Opening biodata view...');
    window.location.href = 'view-biodata.html';
}