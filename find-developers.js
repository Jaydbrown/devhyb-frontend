// find-developers.js - Find Developers Page Logic

const API_BASE = 'https://devhub-rshq.onrender.com/api';

// ==================== PAGE LOAD ====================
document.addEventListener('DOMContentLoaded', () => {
  loadDevelopers();
  setupFilterHandlers();
  checkLoginStatus();
});

// ==================== LOAD DEVELOPERS ====================
async function loadDevelopers(filters = {}) {
  const developerList = document.querySelector('.developer-list');
  
  // Show loading state
  developerList.innerHTML = `
    <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
      <p style="color: #666;">Loading developers...</p>
    </div>
  `;

  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.location) params.append('location', filters.location);
    if (filters.rating) params.append('rating', filters.rating);
    params.append('limit', '50');
    
    const response = await fetch(`${API_BASE}/developers?${params.toString()}`);
    
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

    if (developers.length === 0) {
      developerList.innerHTML = `
        <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
          <p style="color: #666; font-size: 1.1rem;">No developers found matching your criteria.</p>
          <button onclick="clearFilters()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Clear Filters
          </button>
        </div>
      `;
      return;
    }

    // Clear and populate developer list
    developerList.innerHTML = '';
    developers.forEach(dev => {
      const devCard = createDeveloperCard(dev);
      developerList.appendChild(devCard);
    });

  } catch (error) {
    console.error('Error loading developers:', error);
    developerList.innerHTML = `
      <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
        <p style="color: #f44336; margin-bottom: 10px;">⚠️ Failed to load developers</p>
        <p style="color: #666; font-size: 0.9rem;">Please check your connection and try again</p>
        <button onclick="loadDevelopers()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Retry
        </button>
      </div>
    `;
  }
}

// ==================== CREATE DEVELOPER CARD ====================
function createDeveloperCard(dev) {
  const card = document.createElement('div');
  card.className = 'developer-card';
  
  const skills = dev.skills ? dev.skills.split(',').slice(0, 3).join(', ') : 'Full Stack Developer';
  const rating = parseFloat(dev.rating || 0).toFixed(1);
  const reviews = dev.total_reviews || 0;
  const location = dev.location || 'Remote';
  const bio = dev.bio || 'Experienced developer ready to bring your projects to life.';
  const hourlyRate = dev.hourly_rate || 45;
  
  // Generate avatar URL
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.full_name)}&size=120&background=667eea&color=fff`;
  
  card.innerHTML = `
    <img src="${avatarUrl}" alt="${dev.full_name}" onerror="this.src='https://ui-avatars.com/api/?name=Dev&size=120&background=667eea&color=fff'" />
    <div class="dev-info">
      <h3>${dev.full_name}</h3>
      <p class="dev-skill">${skills}</p>
      <p class="dev-bio">${bio.substring(0, 150)}${bio.length > 150 ? '...' : ''}</p>
      <div class="rating">⭐ ${rating} (${reviews} reviews) • 📍 ${location} • 💰 $${hourlyRate}/hr</div>
      <div class="dev-buttons">
        <a href="developer-profile.html?id=${dev.id}" class="btn-outline">View Profile</a>
        <button onclick="hireDeveloper(${dev.id})" class="btn-blue">Hire Developer</button>
      </div>
    </div>
  `;
  
  return card;
}

// ==================== SETUP FILTER HANDLERS ====================
function setupFilterHandlers() {
  const filterBar = document.querySelector('.filter-bar');
  const searchInput = filterBar.querySelector('input[type="text"]');
  const skillSelect = filterBar.querySelectorAll('select')[0];
  const locationSelect = filterBar.querySelectorAll('select')[1];
  const ratingSelect = filterBar.querySelectorAll('select')[2];
  const applyButton = filterBar.querySelector('button');
  
  // Apply filters on button click
  applyButton.addEventListener('click', () => {
    const filters = {
      search: searchInput.value.trim(),
      skill: skillSelect.value,
      location: locationSelect.value,
      rating: getRatingValue(ratingSelect.value)
    };
    
    loadDevelopers(filters);
  });
  
  // Also apply on Enter in search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      applyButton.click();
    }
  });
  
  // Check for search query in URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  if (searchQuery) {
    searchInput.value = searchQuery;
    loadDevelopers({ search: searchQuery });
  }
}

// ==================== GET RATING VALUE ====================
function getRatingValue(ratingText) {
  if (ratingText.includes('4')) return 4;
  if (ratingText.includes('3')) return 3;
  return null;
}

// ==================== CLEAR FILTERS ====================
window.clearFilters = function() {
  const filterBar = document.querySelector('.filter-bar');
  filterBar.querySelector('input[type="text"]').value = '';
  filterBar.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
  loadDevelopers();
};

// ==================== HIRE DEVELOPER ====================
window.hireDeveloper = function(devId) {
  const token = localStorage.getItem('devhub_token');
  
  if (!token) {
    alert('Please login to hire a developer');
    window.location.href = 'index.html';
    return;
  }
  
  const user = JSON.parse(localStorage.getItem('devhub_user') || '{}');
  if (user.userType !== 'Client') {
    alert('Only clients can hire developers. Please register as a client.');
    return;
  }
  
  showQuickHireModal(devId);
};

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
  
  const today = new Date().toISOString().split('T')[0];
  
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
      <h2 style="margin-bottom: 20px; color: #007bff;">💼 Hire Developer</h2>
      <form id="quickHireForm">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Project Title</label>
          <input type="text" id="projectTitle" placeholder="e.g., E-commerce Website" required 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Project Description</label>
          <textarea id="projectDesc" placeholder="Describe your project requirements..." required 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 100px; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Budget (USD)</label>
          <input type="number" id="projectBudget" placeholder="e.g., 5000" required min="100"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Deadline</label>
          <input type="date" id="projectDeadline" required min="${today}"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button type="submit" style="flex: 1; background: #007bff; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Create Project
          </button>
          <button type="button" onclick="this.closest('div').parentElement.parentElement.remove()" 
            style="flex: 1; background: #f5f5f5; color: #333; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
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
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        alert('✅ Project created successfully! The developer will be notified.');
        modal.remove();
        window.location.href = 'client-dashboard.html';
      } else {
        const error = await response.json();
        alert('Failed to create project: ' + (error.message || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please check your connection and try again.');
    }
  });
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ==================== CHECK LOGIN STATUS ====================
function checkLoginStatus() {
  const token = localStorage.getItem('devhub_token');
  const user = JSON.parse(localStorage.getItem('devhub_user') || '{}');
  
  const logo = document.querySelector('.logo a');
  if (token && user.fullName) {
    const navLinks = document.createElement('div');
    navLinks.style.cssText = 'margin-left: auto; display: flex; gap: 15px; align-items: center;';
    navLinks.innerHTML = `
      <span style="color: #666;">Welcome, ${user.fullName.split(' ')[0]}!</span>
      <a href="${user.userType === 'Developer' ? 'developer-dashboard.html' : 'client-dashboard.html'}" 
         style="color: #007bff; text-decoration: none; font-weight: 600;">Dashboard</a>
    `;
    logo.parentElement.appendChild(navLinks);
  }
}
