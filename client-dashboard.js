// client-dashboard.js - Client Dashboard Logic

// Check authentication
DevHubAPI.checkAuth();

const currentUser = DevHubAPI.getCurrentUser();

// Verify user is a client
if (currentUser.userType !== 'Client') {
  alert('Access denied. Client account required.');
  window.location.href = 'index.html';
}

// ==================== LOAD DASHBOARD DATA ====================

async function loadClientDashboard() {
  try {
    // Load stats
    await loadClientStats();
    
    // Load projects
    await loadClientProjects();
    
    // Load messages
    await loadRecentMessages();
    
    // Load recommended developers
    await loadRecommendedDevelopers();
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Failed to load dashboard data');
  }
}

// ==================== LOAD CLIENT STATS ====================

async function loadClientStats() {
  try {
    const stats = await DevHubAPI.Stats.getClientStats(currentUser.id);
    
    // Update stats cards
    document.querySelector('.stats .card:nth-child(1) h3').textContent = stats.activeProjects;
    document.querySelector('.stats .card:nth-child(2) h3').textContent = `$${stats.totalSpent}`;
    document.querySelector('.stats .card:nth-child(3) h3').textContent = stats.developersHired;
    document.querySelector('.stats .card:nth-child(4) h3').textContent = `${stats.avgRating}⭐`;
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ==================== LOAD CLIENT PROJECTS ====================

async function loadClientProjects() {
  try {
    const response = await DevHubAPI.Project.getClientProjects(currentUser.id);
    const projects = response.projects || response;
    
    const projectList = document.querySelector('.project-list');
    projectList.innerHTML = '';
    
    if (projects.length === 0) {
      projectList.innerHTML = '<p style="padding: 20px; text-align: center;">No projects yet</p>';
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
  }
}

// ==================== LOAD RECENT MESSAGES ====================

async function loadRecentMessages() {
  try {
    const response = await DevHubAPI.Message.getConversations();
    const conversations = response.conversations || response;
    
    const messageList = document.querySelector('.message-list');
    messageList.innerHTML = '';
    
    if (conversations.length === 0) {
      messageList.innerHTML = '<p style="padding: 20px; text-align: center;">No messages yet</p>';
      return;
    }
    
    // Show only recent 3 conversations
    conversations.slice(0, 3).forEach(conv => {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message';
      messageDiv.innerHTML = `
        <span><strong>${conv.other_user_name}:</strong> ${conv.last_message.substring(0, 50)}${conv.last_message.length > 50 ? '...' : ''}</span>
        <small>${DevHubAPI.timeAgo(conv.last_message_time)}</small>
      `;
      messageList.appendChild(messageDiv);
    });
    
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// ==================== LOAD RECOMMENDED DEVELOPERS ====================

async function loadRecommendedDevelopers() {
  try {
    const response = await DevHubAPI.Developer.getAll({ rating: 4, limit: 3 });
    const developers = response.developers || response;
    
    const devList = document.querySelector('.dev-list');
    if (!devList) return;
    
    devList.innerHTML = '';
    
    if (developers.length === 0) {
      devList.innerHTML = '<p style="text-align: center;">No developers available</p>';
      return;
    }
    
    developers.forEach(dev => {
      const devCard = document.createElement('div');
      devCard.className = 'dev-card';
      devCard.innerHTML = `
        <div class="dev-info">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(dev.full_name)}&background=007bff&color=fff" alt="${dev.full_name}" />
          <div class="dev-details">
            <h4>${dev.full_name}</h4>
            <p>${dev.skills || 'Full Stack Developer'}</p>
            <p>⭐ ${parseFloat(dev.rating).toFixed(1)} (${dev.total_reviews} reviews)</p>
          </div>
        </div>
        <div class="dev-buttons">
          <a href="developer-profile.html?id=${dev.id}" class="btn-outline">View Profile</a>
          <a href="javascript:void(0)" onclick="messageDevelope(${dev.user_id})" class="btn-blue">Message</a>
        </div>
      `;
      devList.appendChild(devCard);
    });
    
  } catch (error) {
    console.error('Error loading developers:', error);
  }
}

// ==================== MESSAGE DEVELOPER ====================

function messageDeveloper(userId) {
  // Store developer ID and redirect to messages page
  localStorage.setItem('message_to_user', userId);
  window.location.href = 'messages.html';
}

// ==================== UPDATE USER INFO ====================

function updateUserInfo() {
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

// ==================== INITIALIZE DASHBOARD ====================

document.addEventListener('DOMContentLoaded', () => {
  updateUserInfo();
  loadClientDashboard();
  
  // Make navigation links interactive
  setupNavigation();
  
  // Logout button
  document.querySelector('.logout button')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      DevHubAPI.Auth.logout();
    }
  });
  
  // Refresh data every 30 seconds
  setInterval(() => {
    loadClientStats();
    loadRecentMessages();
  }, 30000);
});

// ==================== SETUP NAVIGATION ====================

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const text = link.textContent.trim();
      
      if (text.includes('Dashboard')) {
        // Already on dashboard
        window.location.reload();
      } else if (text.includes('My Projects')) {
        showProjectsModal();
      } else if (text.includes('Messages')) {
        alert('Messages page coming soon! Recent messages are shown in the dashboard.');
      } else if (text.includes('Developers')) {
        window.location.href = 'find-developers.html';
      } else if (text.includes('Settings')) {
        alert('Settings page coming soon!');
      }
    });
  });
}

// ==================== SHOW PROJECTS MODAL ====================

async function showProjectsModal() {
  try {
    const response = await DevHubAPI.Project.getClientProjects(currentUser.id);
    const projects = response.projects || response;
    
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
    `;
    
    let projectsHTML = '';
    if (projects.length === 0) {
      projectsHTML = '<p style="text-align: center; color: #666;">No projects yet</p>';
    } else {
      projectsHTML = projects.map(p => `
        <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 1.1rem;">${p.title}</strong>
              <p style="color: #666; margin: 5px 0;">${p.description || 'No description'}</p>
              <small style="color: #999;">Budget: ${p.budget || 'N/A'}</small>
            </div>
            <span style="padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; ${
              p.status === 'completed' ? 'background: #d4edda; color: #155724;' :
              p.status === 'in-progress' ? 'background: #fff3cd; color: #856404;' :
              'background: #f8d7da; color: #721c24;'
            }">${p.status}</span>
          </div>
        </div>
      `).join('');
    }
    
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 12px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">📁 All My Projects</h2>
          <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
        </div>
        ${projectsHTML}
        <button onclick="this.closest('div').parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 20px;">
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
  } catch (error) {
    alert('Failed to load projects');
  }
}