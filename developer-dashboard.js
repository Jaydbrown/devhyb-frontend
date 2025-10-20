// developer-dashboard.js - Developer Dashboard Logic

// Check authentication
DevHubAPI.checkAuth();

const currentUser = DevHubAPI.getCurrentUser();
let developerId = null;

// Verify user is a developer
if (currentUser.userType !== 'Developer') {
  alert('Access denied. Developer account required.');
  window.location.href = 'index.html';
}

// ==================== LOAD DASHBOARD DATA ====================

async function loadDeveloperDashboard() {
  try {
    // First get developer ID from user_id
    const devResponse = await DevHubAPI.Developer.getAll({ limit: 1000 });
    const developers = devResponse.developers || devResponse;
    const currentDev = developers.find(d => d.user_id === currentUser.id);
    
    if (currentDev) {
      developerId = currentDev.id;
      
      // Load stats
      await loadDeveloperStats();
      
      // Load projects
      await loadDeveloperProjects();
      
      // Load messages
      await loadRecentMessages();
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
    const stats = await DevHubAPI.Stats.getDeveloperStats(developerId);
    
    // Update stats cards
    document.querySelector('.stats .card:nth-child(1) h3').textContent = stats.activeProjects;
    document.querySelector('.stats .card:nth-child(2) h3').textContent = `$${stats.totalEarnings}k`;
    document.querySelector('.stats .card:nth-child(3) h3').textContent = `${stats.rating}⭐`;
    document.querySelector('.stats .card:nth-child(4) h3').textContent = stats.totalClients;
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ==================== LOAD DEVELOPER PROJECTS ====================

async function loadDeveloperProjects() {
  try {
    const response = await DevHubAPI.Project.getDeveloperProjects(developerId);
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
  loadDeveloperDashboard();
  
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
    loadDeveloperStats();
    loadRecentMessages();
  }, 30000);
});

// ==================== SETUP NAVIGATION ====================

function setupNavigation() {
  // Dashboard link
  const dashboardLink = document.querySelector('a[href="#"]');
  if (dashboardLink) {
    dashboardLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Already on dashboard
    });
  }
  
  // Projects link
  const projectsLink = document.querySelector('a[href="#"]:nth-of-type(2)');
  if (projectsLink) {
    projectsLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Projects page coming soon! For now, view recent projects in the dashboard.');
    });
  }
  
  // Messages link
  const messagesLinks = document.querySelectorAll('.nav-links a');
  messagesLinks.forEach((link, index) => {
    if (link.textContent.includes('Messages')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Messages page coming soon! Recent messages are shown in the dashboard.');
      });
    }
    
    if (link.textContent.includes('Earnings')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showEarningsModal();
      });
    }
    
    if (link.textContent.includes('Profile')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `developer-profile.html?id=${developerId}`;
      });
    }
    
    if (link.textContent.includes('Settings')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Settings page coming soon!');
      });
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
      <h2 style="margin-bottom: 20px;">💰 Your Earnings</h2>
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
      <button onclick="this.closest('div').parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%;">
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