// index.js - Homepage Logic

// ==================== DIRECT HIRE BUTTON ====================
document.addEventListener('DOMContentLoaded', () => {
  const directBtn = document.getElementById('directBtn');
  const proBtn = document.getElementById('proBtn');
  
  // Direct Hire - Navigate to find developers page
  if (directBtn) {
    directBtn.addEventListener('click', () => {
      window.location.href = 'find-developers.html';
    });
  }
  
  // Through Pro Department - Show project form modal
  if (proBtn) {
    proBtn.addEventListener('click', () => {
      showProDepartmentModal();
    });
  }
  
  // Hire a Developer button
  const hireBtn = document.querySelector('.hero-btn.hire');
  if (hireBtn) {
    hireBtn.addEventListener('click', () => {
      window.location.href = 'find-developers.html';
    });
  }
  
  // Post a Job button
  const postBtn = document.querySelector('.hero-btn.post');
  if (postBtn) {
    postBtn.addEventListener('click', () => {
      const token = localStorage.getItem('devhub_token');
      if (!token) {
        alert('Please login to post a job');
        document.getElementById('openLogIn').click();
      } else {
        window.location.href = 'client-dashboard.html';
      }
    });
  }
  
  // Check if user is already logged in
  const token = localStorage.getItem('devhub_token');
  if (token) {
    updateNavForLoggedInUser();
  }
});

// ==================== PRO DEPARTMENT MODAL ====================
function showProDepartmentModal() {
  // Check if user is logged in
  const token = localStorage.getItem('devhub_token');
  
  if (!token) {
    alert('Please login to submit a project through Pro Department');
    document.getElementById('openLogIn').click();
    return;
  }
  
  // Check if user is a client
  const user = JSON.parse(localStorage.getItem('devhub_user') || '{}');
  if (user.userType !== 'Client') {
    alert('Only clients can submit projects through Pro Department. Please register as a client.');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px; width: 90%;">
      <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
      <h2>💼 Pro Department Project Submission</h2>
      <p style="color: #666; margin-bottom: 20px;">
        Submit your project details and our professional team will match you with the best developers.
      </p>
      
      <form id="proDeptForm">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Project Title</label>
          <input type="text" id="proProjectTitle" placeholder="e.g., E-commerce Website Development" required 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Project Description</label>
          <textarea id="proProjectDesc" placeholder="Describe your project requirements, features, and any specific technologies needed..." required 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 120px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Budget (USD)</label>
          <input type="number" id="proProjectBudget" placeholder="e.g., 5000" required min="100"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Expected Timeline</label>
          <input type="date" id="proProjectTimeline" required 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button type="submit" class="btn-primary" style="flex: 1; background: #667eea; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Submit Project
          </button>
          <button type="button" onclick="this.closest('.modal').remove()" class="btn-secondary" style="flex: 1; background: #f5f5f5; color: #333; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('proProjectTimeline').setAttribute('min', today);
  
  // Handle form submission
  document.getElementById('proDeptForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectData = {
      title: document.getElementById('proProjectTitle').value,
      description: document.getElementById('proProjectDesc').value,
      budget: parseFloat(document.getElementById('proProjectBudget').value),
      deadline: document.getElementById('proProjectTimeline').value,
      proDepartment: true // Flag to indicate this is a pro department project
    };
    
    try {
      const token = localStorage.getItem('devhub_token');
      const response = await fetch('https://devhub-rshq.onrender.com/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        alert('✅ Project submitted successfully! Our Pro Department team will review it and match you with the best developers.');
        modal.remove();
        window.location.href = 'client-dashboard.html';
      } else {
        const error = await response.json();
        alert('Failed to submit project: ' + (error.message || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Error submitting project. Please check your connection and try again.');
    }
  });
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ==================== UPDATE NAV FOR LOGGED IN USER ====================
function updateNavForLoggedInUser() {
  const user = JSON.parse(localStorage.getItem('devhub_user') || '{}');
  const authButtons = document.querySelector('.auth-buttons');
  
  if (authButtons && user.fullName) {
    authButtons.innerHTML = `
      <span style="color: white; margin-right: 10px;">Welcome, ${user.fullName.split(' ')[0]}!</span>
      <button class="btn log-in" onclick="goToDashboard()">Dashboard</button>
      <button class="btn sign-in" onclick="logout()">Logout</button>
    `;
  }
}

// ==================== GO TO DASHBOARD ====================
window.goToDashboard = function() {
  const user = JSON.parse(localStorage.getItem('devhub_user') || '{}');
  if (user.userType === 'Developer') {
    window.location.href = 'developer-dashboard.html';
  } else if (user.userType === 'Client') {
    window.location.href = 'client-dashboard.html';
  }
};

// ==================== LOGOUT ====================
window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('devhub_token');
    localStorage.removeItem('devhub_user');
    window.location.reload();
  }
};

// ==================== SEARCH FUNCTIONALITY ====================
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', () => {
    const searchQuery = searchInput.value.trim();
    if (searchQuery) {
      window.location.href = `find-developers.html?search=${encodeURIComponent(searchQuery)}`;
    } else {
      alert('Please enter something to search!');
    }
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const searchQuery = searchInput.value.trim();
      if (searchQuery) {
        window.location.href = `find-developers.html?search=${encodeURIComponent(searchQuery)}`;
      }
    }
  });
}
