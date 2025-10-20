// index.js - Homepage Logic with Featured Developers

// ==================== LOAD FEATURED DEVELOPERS ====================

window.loadFeaturedDevelopers = async function() {
  try {
    // Fetch developers from API (no authentication required)
    const response = await fetch('http://localhost:5000/api/developers?limit=12');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle both response formats
    let developers = [];
    if (data.developers && Array.isArray(data.developers)) {
      developers = data.developers;
    } else if (Array.isArray(data)) {
      developers = data;
    }

    const container = document.getElementById('featuredDevelopers');
    
    if (!container) {
      console.error('Featured developers container not found');
      return;
    }

    container.innerHTML = '';

    if (developers.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No developers available yet.</p>';
      return;
    }

    developers.forEach(dev => {
      const devCard = createDeveloperCard(dev);
      container.appendChild(devCard);
    });

  } catch (error) {
    console.error('Error loading developers:', error);
    const container = document.getElementById('featuredDevelopers');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="color: #f44336; margin-bottom: 10px;">⚠️ Failed to load developers</p>
          <p style="color: #666; font-size: 0.9rem;">Please make sure the backend server is running on port 5000</p>
          <button onclick="loadFeaturedDevelopers()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Try Again
          </button>
        </div>
      `;
    }
  }
}

// ==================== CREATE DEVELOPER CARD ====================

function createDeveloperCard(dev) {
  const card = document.createElement('div');
  card.className = 'developer-card';
  
  const skills = dev.skills ? dev.skills.split(',').slice(0, 3).join(', ') : 'Full Stack Developer';
  const rating = parseFloat(dev.rating || 0).toFixed(1);
  const reviews = dev.total_reviews || 0;
  
  card.innerHTML = `
    <div class="dev-avatar">
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(dev.full_name)}&size=120&background=667eea&color=fff" alt="${dev.full_name}">
      <div class="dev-rating">
        <span>⭐ ${rating}</span>
      </div>
    </div>
    <div class="dev-details">
      <h3>${dev.full_name}</h3>
      <p class="dev-skills">${skills}</p>
      <p class="dev-experience">${dev.years_experience || 0}+ years experience</p>
      <div class="dev-stats">
        <span>💼 ${reviews} reviews</span>
        <span>💰 $${dev.hourly_rate || 45}/hr</span>
      </div>
    </div>
    <div class="dev-actions">
      <button onclick="viewDeveloperProfile(${dev.id})" class="btn-view">View Profile</button>
      <button onclick="hireDeveloper(${dev.id})" class="btn-hire">Hire Now</button>
    </div>
  `;
  
  return card;
}

// ==================== VIEW DEVELOPER PROFILE ====================

function viewDeveloperProfile(devId) {
  window.location.href = `developer-profile.html?id=${devId}`;
}

// ==================== HIRE DEVELOPER ====================

function hireDeveloper(devId) {
  // Check if user is logged in
  const token = localStorage.getItem('devhub_token');
  
  if (!token) {
    alert('Please login to hire a developer');
    document.getElementById('openLogIn').click();
    return;
  }
  
  // Check if user is a client
  const user = JSON.parse(localStorage.getItem('devhub_user') || '{}');
  if (user.userType !== 'Client') {
    alert('Only clients can hire developers. Please register as a client.');
    return;
  }
  
  // Store developer ID and redirect to create project
  localStorage.setItem('hire_developer_id', devId);
  
  // For now, show quick hire modal
  showQuickHireModal(devId);
}

// ==================== QUICK HIRE MODAL ====================

function showQuickHireModal(devId) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
      <h2 style="margin-bottom: 20px;">💼 Quick Hire</h2>
      <form id="quickHireForm">
        <input type="text" id="projectTitle" placeholder="Project Title" required style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
        <textarea id="projectDesc" placeholder="Project Description" required style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px; min-height: 100px;"></textarea>
        <input type="number" id="projectBudget" placeholder="Budget (USD)" required style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 6px;">
        <input type="date" id="projectDeadline" required style="width: 100%; padding: 10px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 6px;">
        <div style="display: flex; gap: 10px;">
          <button type="submit" style="flex: 1; background: #667eea; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Create Project
          </button>
          <button type="button" onclick="this.closest('div').parentElement.parentElement.remove()" style="flex: 1; background: #f5f5f5; color: #333; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle form submission
  document.getElementById('quickHireForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectData = {
      title: document.getElementById('projectTitle').value,
      description: document.getElementById('projectDesc').value,
      budget: parseFloat(document.getElementById('projectBudget').value),
      deadline: document.getElementById('projectDeadline').value,
      developerId: devId
    };
    
    try {
      const token = localStorage.getItem('devhub_token');
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        alert('Project created successfully! Check your dashboard.');
        modal.remove();
        window.location.href = 'client-dashboard.html';
      } else {
        alert('Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    }
  });
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ==================== HERO BUTTONS ====================

document.addEventListener('DOMContentLoaded', () => {
  // Load featured developers
  loadFeaturedDevelopers();
  
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
