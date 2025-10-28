// developer-dashboard.js - Developer Dashboard Logic

const API_BASE = 'https://devhub-rshq.onrender.com/api';

// Check authentication
const token = localStorage.getItem('devhub_token');
if (!token) {
  alert('Please login to access dashboard');
  window.location.href = 'index.html';
}

const currentUser = JSON.parse(localStorage.getItem('devhub_user') || '{}');
let developerId = null;
let developerData = null;

// Verify user is a developer
if (currentUser.userType !== 'Developer') {
  alert('Access denied. Developer account required.');
  window.location.href = 'index.html';
}

// ==================== LOAD DASHBOARD DATA ====================

async function loadDeveloperDashboard() {
  try {
    // First get developer ID from user_id
    const response = await fetch(`${API_BASE}/developers?limit=1000`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const developers = data.developers || data;
    const currentDev = developers.find(d => d.user_id === currentUser.id);
    
    if (currentDev) {
      developerId = currentDev.id;
      developerData = currentDev;
      
      // Load stats
      await loadDeveloperStats();
      
      // Load projects
      await loadDeveloperProjects();
      
      // Update profile info display
      updateProfileDisplay();
    } else {
      showError('Developer profile not found');
    }
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Failed to load dashboard data');
  }
}

// ==================== LOAD DEVELOPER STATS ====================

async function loadDeveloperStats() {
  try {
    const response = await fetch(`${API_BASE}/stats/developer/${developerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const stats = await response.json();
    
    // Update stats cards
    document.querySelector('.stats .card:nth-child(1) h3').textContent = stats.activeProjects || 0;
    document.querySelector('.stats .card:nth-child(2) h3').textContent = `$${parseFloat(stats.totalEarnings || 0).toFixed(1)}k`;
    document.querySelector('.stats .card:nth-child(3) h3').textContent = `${stats.rating || 0}⭐`;
    document.querySelector('.stats .card:nth-child(4) h3').textContent = stats.totalClients || 0;
    
  } catch (error) {
    console.error('Error loading stats:', error);
    // Set default values if API fails
    document.querySelector('.stats .card:nth-child(1) h3').textContent = '0';
    document.querySelector('.stats .card:nth-child(2) h3').textContent = '$0k';
    document.querySelector('.stats .card:nth-child(3) h3').textContent = '0⭐';
    document.querySelector('.stats .card:nth-child(4) h3').textContent = '0';
  }
}

// ==================== LOAD DEVELOPER PROJECTS ====================

async function loadDeveloperProjects() {
  try {
    const response = await fetch(`${API_BASE}/projects?developerId=${developerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const projects = data.projects || data;
    
    const projectList = document.querySelector('.project-list');
    projectList.innerHTML = '';
    
    if (projects.length === 0) {
      projectList.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No projects yet</p>';
      return;
    }
    
    // Show only recent 5 projects
    projects.slice(0, 5).forEach(project => {
      const statusClass = project.status.replace('-', '');
      const statusText = project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ');
      
      const projectItem = document.createElement('div');
      projectItem.className = 'project-item';
      projectItem.innerHTML = `
        <span>${project.title}</span>
        <span class="project-status ${statusClass}">${statusText}</span>
      `;
      projectList.appendChild(projectItem);
    });
    
  } catch (error) {
    console.error('Error loading projects:', error);
    const projectList = document.querySelector('.project-list');
    projectList.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No projects yet</p>';
  }
}

// ==================== UPDATE PROFILE DISPLAY ====================

function updateProfileDisplay() {
  if (!developerData) return;
  
  // Update user info in header
  const userName = document.querySelector('.dashboard-header h2');
  if (userName) {
    userName.textContent = `Welcome back, ${currentUser.fullName.split(' ')[0]} 👋`;
  }
  
  const userEmail = document.querySelector('.user-info span');
  if (userEmail) {
    userEmail.textContent = `@${currentUser.email.split('@')[0]}`;
  }
  
  const userAvatar = document.querySelector('.user-info img');
  if (userAvatar) {
    userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=007bff&color=fff`;
  }
}

// ==================== SHOW EDIT PROFILE MODAL ====================

function showEditProfileModal() {
  if (!developerData) {
    alert('Developer data not loaded yet');
    return;
  }
  
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
    overflow-y: auto;
    padding: 20px;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
      <h2 style="margin-bottom: 20px; color: #007bff;">✏️ Edit Your Profile</h2>
      <p style="color: #666; margin-bottom: 20px; font-size: 0.95rem;">
        Update your profile information. These details will be visible to clients on the Find Developers page.
      </p>
      
      <form id="editProfileForm">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Full Name</label>
          <input type="text" id="fullName" value="${developerData.full_name || ''}" required 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Username / Display Name</label>
          <input type="text" id="username" value="${developerData.username || ''}" 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Bio / About</label>
          <textarea id="bio" placeholder="Tell clients about yourself and your expertise..." 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 100px; resize: vertical; font-size: 0.95rem;">${developerData.bio || ''}</textarea>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Skills (comma separated)</label>
          <input type="text" id="skills" value="${developerData.skills || ''}" placeholder="React, Node.js, Python, etc." 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Experience Level</label>
            <select id="experienceLevel" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
              <option value="Junior" ${developerData.experience_level === 'Junior' ? 'selected' : ''}>Junior</option>
              <option value="Mid" ${developerData.experience_level === 'Mid' ? 'selected' : ''}>Mid</option>
              <option value="Senior" ${developerData.experience_level === 'Senior' ? 'selected' : ''}>Senior</option>
            </select>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Years of Experience</label>
            <input type="number" id="yearsExperience" value="${developerData.years_experience || 0}" min="0" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Portfolio / GitHub URL</label>
          <input type="url" id="portfolioUrl" value="${developerData.portfolio_url || ''}" placeholder="https://github.com/yourname" 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Location</label>
            <input type="text" id="location" value="${developerData.location || ''}" placeholder="e.g., Lagos, Nigeria" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Hourly Rate (USD)</label>
            <input type="number" id="hourlyRate" value="${developerData.hourly_rate || 0}" min="0" 
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
          </div>
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button type="submit" style="flex: 1; background: #007bff; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem;">
            Save Changes
          </button>
          <button type="button" onclick="this.closest('div').parentElement.parentElement.remove()" 
            style="flex: 1; background: #f5f5f5; color: #333; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem;">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle form submission
  document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';
    
    const updatedData = {
      username: document.getElementById('username').value,
      bio: document.getElementById('bio').value,
      skills: document.getElementById('skills').value,
      experienceLevel: document.getElementById('experienceLevel').value,
      yearsExperience: parseInt(document.getElementById('yearsExperience').value),
      portfolioUrl: document.getElementById('portfolioUrl').value,
      location: document.getElementById('location').value,
      hourlyRate: parseFloat(document.getElementById('hourlyRate').value)
    };
    
    try {
      const response = await fetch(`${API_BASE}/developers/${developerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('✅ Profile updated successfully! Your changes will now appear on the Find Developers page.');
        modal.remove();
        
        // Reload dashboard to show updated data
        await loadDeveloperDashboard();
      } else {
        const error = await response.json();
        alert('Failed to update profile: ' + (error.message || 'Please try again.'));
        submitButton.disabled = false;
        submitButton.textContent = 'Save Changes';
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please check your connection and try again.');
      submitButton.disabled = false;
      submitButton.textContent = 'Save Changes';
    }
  });
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ==================== SHOW EARNINGS MODAL ====================

function showEarningsModal() {
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
      <h2 style="margin-bottom: 20px; color: #007bff;">💰 Your Earnings</h2>
      <div style="margin-bottom: 15px;">
        <strong>Total Earnings:</strong> ${document.querySelector('.stats .card:nth-child(2) h3').textContent}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Active Projects:</strong> ${document.querySelector('.stats .card:nth-child(1) h3').textContent}
      </div>
      <div style="margin-bottom: 15px;">
        <strong>Total Clients:</strong> ${document.querySelector('.stats .card:nth-child(4) h3').textContent}
      </div>
      <div style="margin-bottom: 20px;">
        <strong>Average Rating:</strong> ${document.querySelector('.stats .card:nth-child(3) h3').textContent}
      </div>
      <button onclick="this.closest('div').parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: 600;">
        Close
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ==================== SHOW ERROR ====================

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 10000;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// ==================== SETUP NAVIGATION ====================

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const text = link.textContent.trim();
      
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      
      if (text.includes('Dashboard')) {
        link.classList.add('active');
        // Already on dashboard
      } else if (text.includes('Projects')) {
        alert('Projects page: View and manage all your projects. Coming soon!');
      } else if (text.includes('Messages')) {
        alert('Messages page: Chat with clients. Coming soon!');
      } else if (text.includes('Earnings')) {
        showEarningsModal();
      } else if (text.includes('Profile')) {
        if (developerId) {
          showEditProfileModal();
        } else {
          alert('Please wait for profile to load');
        }
      } else if (text.includes('Settings')) {
        alert('Settings page: Manage account preferences. Coming soon!');
      }
    });
  });
}

// ==================== INITIALIZE DASHBOARD ====================

document.addEventListener('DOMContentLoaded', () => {
  loadDeveloperDashboard();
  setupNavigation();
  
  // Logout button
  document.querySelector('.logout button')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('devhub_token');
      localStorage.removeItem('devhub_user');
      window.location.href = 'index.html';
    }
  });
  
  // Refresh data every 60 seconds
  setInterval(() => {
    if (developerId) {
      loadDeveloperStats();
      loadDeveloperProjects();
    }
  }, 60000);
});
