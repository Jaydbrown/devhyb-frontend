// auth.js - Authentication Logic for Login/Signup modals

// ==================== LOGIN LOGIC ====================

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  try {
    showLoading('login-status');
    
    const response = await DevHubAPI.Auth.login(email, password);
    
    showSuccess('Login successful! Redirecting...', 'login-status');
    
    // Close modal
    closeModal('loginModal');
    
    // Redirect to appropriate dashboard
    setTimeout(() => {
      DevHubAPI.redirectToDashboard();
    }, 1000);
    
  } catch (error) {
    showError(error.message || 'Login failed', 'login-status');
  }
});

// ==================== SIGNUP LOGIC ====================

let currentStep = 1;
let signupData = {};

// Step navigation (make global)
window.nextStep = function(step) {
  // Validate current step before proceeding
  if (step === 2) {
    if (!validateStep1()) return;
  }
  
  if (step === 3) {
    // Load correct fields based on user type
    const userType = document.getElementById('userType').value;
    toggleUserFields(userType);
  }
  
  // Hide current step
  document.getElementById(`signupStep${currentStep}`).classList.add('hidden');
  document.getElementById(`dot${currentStep}`).classList.remove('active');
  
  // Show next step
  currentStep = step;
  document.getElementById(`signupStep${currentStep}`).classList.remove('hidden');
  document.getElementById(`dot${currentStep}`).classList.add('active');
}

window.prevStep = function(step) {
  // Hide current step
  document.getElementById(`signupStep${currentStep}`).classList.add('hidden');
  document.getElementById(`dot${currentStep}`).classList.remove('active');
  
  // Show previous step
  currentStep = step;
  document.getElementById(`signupStep${currentStep}`).classList.remove('hidden');
  document.getElementById(`dot${currentStep}`).classList.add('active');
}

// Validate step 1
function validateStep1() {
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const userType = document.getElementById('userType').value;

  if (!fullName || fullName.length < 2) {
    alert('Please enter your full name');
    return false;
  }

  if (!email || !email.includes('@')) {
    alert('Please enter a valid email');
    return false;
  }

  if (!password || password.length < 6) {
    alert('Password must be at least 6 characters');
    return false;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return false;
  }

  if (!userType) {
    alert('Please select user type');
    return false;
  }

  // Store step 1 data
  signupData = {
    fullName,
    email,
    password,
    userType,
  };

  return true;
}

// Toggle developer/client fields
function toggleUserFields(userType) {
  const devFields = document.getElementById('devFields');
  const clientFields = document.getElementById('clientFields');

  if (userType === 'Developer') {
    devFields?.classList.remove('hidden');
    clientFields?.classList.add('hidden');
  } else {
    devFields?.classList.add('hidden');
    clientFields?.classList.remove('hidden');
  }
}

// Handle user type change
document.getElementById('userType')?.addEventListener('change', (e) => {
  toggleUserFields(e.target.value);
});

// Generate demo data
window.generateDemo = function() {
  const userType = document.getElementById('userType').value;
  
  if (!userType) {
    alert('Please select user type first');
    return;
  }

  if (userType === 'Developer') {
    document.getElementById('fullName').value = 'Demo Developer';
    document.getElementById('email').value = `demo.dev.${Date.now()}@example.com`;
    document.getElementById('password').value = 'password123';
    document.getElementById('confirmPassword').value = 'password123';
  } else {
    document.getElementById('fullName').value = 'Demo Client';
    document.getElementById('email').value = `demo.client.${Date.now()}@example.com`;
    document.getElementById('password').value = 'password123';
    document.getElementById('confirmPassword').value = 'password123';
  }
}

// Final signup submission (Step 3)
document.getElementById('signupStep3')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    // Collect step 2 data
    const userType = signupData.userType;
    
    if (userType === 'Developer') {
      const devFields = document.querySelectorAll('#devFields input, #devFields textarea, #devFields select');
      devFields.forEach(field => {
  const raw = field.placeholder || field.name || '';
  const name = raw.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  if (field.value) signupData[name] = field.value;
});

      
      // Map specific fields
      signupData.username = document.querySelector('#devFields input[placeholder*="Username"]')?.value;
      signupData.bio = document.querySelector('#devFields textarea')?.value;
      signupData.skills = document.querySelector('#devFields input[placeholder*="Skills"]')?.value;
      signupData.experienceLevel = document.querySelector('#devFields select')?.value;
      signupData.yearsExperience = document.querySelector('#devFields input[placeholder*="Years"]')?.value;
      signupData.portfolioUrl = document.querySelector('#devFields input[placeholder*="Portfolio"]')?.value;
      signupData.location = document.querySelector('#devFields input[placeholder*="Location"]')?.value;
      signupData.hourlyRate = document.querySelector('#devFields input[placeholder*="Hourly"]')?.value;
    } else {
      const clientFields = document.querySelectorAll('#clientFields input');
      clientFields.forEach(field => {
        const name = field.placeholder.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        if (field.value) {
          signupData[name] = field.value;
        }
      });
      
      // Map specific fields
      signupData.companyName = document.querySelector('#clientFields input[placeholder*="Company"]')?.value;
      signupData.companyWebsite = document.querySelector('#clientFields input[placeholder*="Website"]')?.value;
      signupData.industry = document.querySelector('#clientFields input[placeholder*="Industry"]')?.value;
      signupData.companySize = document.querySelector('#clientFields input[placeholder*="Size"]')?.value;
      signupData.workEmail = document.querySelector('#clientFields input[placeholder*="Work Email"]')?.value;
      signupData.budgetRange = document.querySelector('#clientFields input[placeholder*="Budget"]')?.value;
      signupData.location = document.querySelector('#clientFields input[placeholder*="Location"]')?.value;
    }
    
    // Collect step 3 data
    const step3Fields = document.querySelectorAll('#signupStep3 input, #signupStep3 select');
    step3Fields.forEach(field => {
      if (field.type !== 'checkbox' && field.value) {
        const name = field.placeholder?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || 'field';
        signupData[name] = field.value;
      }
    });

    signupData.phone = document.querySelector('#signupStep3 input[type="tel"]')?.value;
    signupData.preferredComm = document.querySelector('#signupStep3 select')?.value;

    showLoading('signup-status');

    // Register user
    const response = await DevHubAPI.Auth.register(signupData);
    
    showSuccess('Registration successful! Redirecting...', 'signup-status');
    
    // Close modal
    closeModal('signupModal');
    
    // Redirect to dashboard
    setTimeout(() => {
      DevHubAPI.redirectToDashboard();
    }, 1000);
    
  } catch (error) {
    showError(error.message || 'Registration failed', 'signup-status');
  }
});

// ==================== MODAL CONTROLS ====================

window.closeModal = function(modalId) {
  document.getElementById(modalId).style.display = 'none';
  
  // Reset signup form
  if (modalId === 'signupModal') {
    currentStep = 1;
    signupData = {};
    document.querySelectorAll('.signup-step').forEach(step => step.classList.add('hidden'));
    document.getElementById('signupStep1').classList.remove('hidden');
    document.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
    document.getElementById('dot1').classList.add('active');
  }
}

// Open modals
document.getElementById('openSignIn')?.addEventListener('click', () => {
  document.getElementById('signupModal').style.display = 'flex';
});

document.getElementById('openLogIn')?.addEventListener('click', () => {
  document.getElementById('loginModal').style.display = 'flex';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

// ==================== LOGOUT ====================

document.querySelector('.logout button')?.addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    DevHubAPI.Auth.logout();
  }
});

// ==================== CHECK AUTH ON PAGE LOAD ====================

// Check if user is already logged in on index page
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  if (DevHubAPI.Auth.isAuthenticated()) {
    // User is logged in, show logout button or user info
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
      const user = DevHubAPI.getCurrentUser();
      authButtons.innerHTML = `
        <span>Welcome, ${user.fullName}!</span>
        <button class="btn log-in" onclick="DevHubAPI.redirectToDashboard()">Dashboard</button>
        <button class="btn sign-in" onclick="DevHubAPI.Auth.logout()">Logout</button>
      `;
    }
  }
}