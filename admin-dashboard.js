// admin-dashboard.js - Admin Panel Logic

// Check authentication and admin access
DevHubAPI.checkAuth();

const currentUser = DevHubAPI.getCurrentUser();

// Check if user is admin (must have 'admin' in email)
if (!currentUser.email.includes('admin')) {
  alert('Access denied. Admin privileges required.');
  window.location.href = 'index.html';
}

// ==================== TAB NAVIGATION ====================

const tabs = document.querySelectorAll('.nav-links a');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove active class from all tabs
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    
    // Add active class to clicked tab
    tab.classList.add('active');
    const tabName = tab.getAttribute('data-tab');
    document.getElementById(tabName).classList.add('active');
    
    // Load data for the tab
    loadTabData(tabName);
  });
});

// ==================== LOAD DASHBOARD DATA ====================

async function loadDashboardStats() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`
      }
    });
    
    const data = await response.json();
    
    // Update stats
    document.getElementById('totalUsers').textContent = data.totalUsers;
    document.getElementById('totalProjects').textContent = data.totalProjects;
    document.getElementById('totalRevenue').textContent = `$${data.totalRevenue}`;
    document.getElementById('activeProjects').textContent = data.activeProjects;
    document.getElementById('totalDevelopers').textContent = data.totalDevelopers;
    document.getElementById('totalClients').textContent = data.totalClients;
    document.getElementById('totalReviews').textContent = data.totalReviews;
    document.getElementById('avgRating').textContent = `${data.avgRating}⭐`;
    
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    alert('Failed to load dashboard statistics');
  }
}

// ==================== LOAD USERS ====================

async function loadUsers(search = '') {
  try {
    const url = search 
      ? `http://localhost:5000/api/admin/users?search=${encodeURIComponent(search)}`
      : 'http://localhost:5000/api/admin/users';
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`
      }
    });
    
    const data = await response.json();
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';
    
    if (data.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No users found</td></tr>';
      return;
    }
    
    data.users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.full_name}</td>
        <td>${user.email}</td>
        <td><span class="badge ${user.user_type.toLowerCase()}">${user.user_type}</span></td>
        <td>${DevHubAPI.formatDate(user.created_at)}</td>
        <td>
          <button class="action-btn suspend" onclick="suspendUser(${user.id}, ${user.suspended || false})">
            ${user.suspended ? 'Activate' : 'Suspend'}
          </button>
          <button class="action-btn" onclick="deleteUser(${user.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Failed to load users');
  }
}

// ==================== USER ACTIONS ====================

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`
      }
    });
    
    if (response.ok) {
      alert('User deleted successfully');
      loadUsers();
      loadDashboardStats();
    } else {
      alert('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting user');
  }
}

async function suspendUser(userId, currentStatus) {
  const action = currentStatus ? 'activate' : 'suspend';
  
  if (!confirm(`Are you sure you want to ${action} this user?`)) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/suspend`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ suspended: !currentStatus })
    });
    
    if (response.ok) {
      alert(`User ${action}d successfully`);
      loadUsers();
    } else {
      alert(`Failed to ${action} user`);
    }
  } catch (error) {
    console.error(`Error ${action}ing user:`, error);
    alert(`Error ${action}ing user`);
  }
}

function searchUsers() {
  const search = document.getElementById('userSearch').value;
  loadUsers(search);
}

// ==================== LOAD PROJECTS ====================

async function loadProjects(search = '') {
  try {
    const url = search 
      ? `http://localhost:5000/api/admin/projects?search=${encodeURIComponent(search)}`
      : 'http://localhost:5000/api/admin/projects';
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`
      }
    });
    
    const data = await response.json();
    const tbody = document.getElementById('projectsTable');
    tbody.innerHTML = '';
    
    if (data.projects.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No projects found</td></tr>';
      return;
    }
    
    data.projects.forEach(project => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${project.id}</td>
        <td>${project.title}</td>
        <td>${project.client_name || 'N/A'}</td>
        <td>${project.developer_name || 'Unassigned'}</td>
        <td>$${project.budget || 0}</td>
        <td><span class="badge ${project.status}">${project.status}</span></td>
        <td>
          <button class="action-btn view" onclick="viewProject(${project.id})">View</button>
          <button class="action-btn" onclick="deleteProject(${project.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading projects:', error);
    alert('Failed to load projects');
  }
}

// ==================== PROJECT ACTIONS ====================

async function deleteProject(projectId) {
  if (!confirm('Are you sure you want to delete this project?')) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`
      }
    });
    
    if (response.ok) {
      alert('Project deleted successfully');
      loadProjects();
      loadDashboardStats();
    } else {
      alert('Failed to delete project');
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    alert('Error deleting project');
  }
}

function viewProject(projectId) {
  alert(`View project details (ID: ${projectId})\nThis will open a detail modal in production.`);
}

function searchProjects() {
  const search = document.getElementById('projectSearch').value;
  loadProjects(search);
}

// ==================== LOAD REVIEWS ====================

async function loadReviews() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/reviews', {
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`
      }
    });
    
    const data = await response.json();
    const tbody = document.getElementById('reviewsTable');
    tbody.innerHTML = '';
    
    if (data.reviews.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No reviews found</td></tr>';
      return;
    }
    
    data.reviews.forEach(review => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${review.id}</td>
        <td>${review.developer_name}</td>
        <td>${review.client_name}</td>
        <td>${'⭐'.repeat(review.rating)}</td>
        <td>${review.message.substring(0, 50)}${review.message.length > 50 ? '...' : ''}</td>
        <td>${DevHubAPI.formatDate(review.created_at)}</td>
        <td>
          <button class="action-btn" onclick="deleteReview(${review.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
  } catch (error) {
    console.error('Error loading reviews:', error);
    alert('Failed to load reviews');
  }
}

// ==================== REVIEW ACTIONS ====================

async function deleteReview(reviewId) {
  if (!confirm('Are you sure you want to delete this review?')) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`
      }
    });
    
    if (response.ok) {
      alert('Review deleted successfully');
      loadReviews();
      loadDashboardStats();
    } else {
      alert('Failed to delete review');
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    alert('Error deleting review');
  }
}

// ==================== LOAD ANALYTICS ====================

async function loadAnalytics() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/analytics?period=30', {
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`
      }
    });
    
    const data = await response.json();
    
    // Load top developers
    const topDevsTable = document.getElementById('topDevsTable');
    topDevsTable.innerHTML = '';
    
    if (data.topDevelopers.length === 0) {
      topDevsTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">No data</td></tr>';
    } else {
      data.topDevelopers.forEach(dev => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${dev.username}</td>
          <td>${dev.full_name}</td>
          <td>${parseFloat(dev.rating).toFixed(1)}⭐</td>
          <td>${dev.total_reviews}</td>
          <td>${dev.total_projects}</td>
        `;
        topDevsTable.appendChild(row);
      });
    }
    
    // Load top clients
    const topClientsTable = document.getElementById('topClientsTable');
    topClientsTable.innerHTML = '';
    
    if (data.topClients.length === 0) {
      topClientsTable.innerHTML = '<tr><td colspan="4" style="text-align: center;">No data</td></tr>';
    } else {
      data.topClients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${client.full_name}</td>
          <td>${client.email}</td>
          <td>${client.total_projects || 0}</td>
          <td>$${parseFloat(client.total_spent || 0).toFixed(2)}</td>
        `;
        topClientsTable.appendChild(row);
      });
    }
    
  } catch (error) {
    console.error('Error loading analytics:', error);
    alert('Failed to load analytics');
  }
}

// ==================== SETTINGS ====================

async function loadSettings() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/settings', {
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`
      }
    });
    
    const data = await response.json();
    
    document.getElementById('platformFee').value = data.platform_fee || '';
    document.getElementById('minBudget').value = data.min_project_budget || '';
    document.getElementById('maxBudget').value = data.max_project_budget || '';
    
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const settings = {
    platformFee: document.getElementById('platformFee').value,
    minProjectBudget: document.getElementById('minBudget').value,
    maxProjectBudget: document.getElementById('maxBudget').value,
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${DevHubAPI.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    
    if (response.ok) {
      alert('Settings updated successfully');
    } else {
      alert('Failed to update settings');
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    alert('Error updating settings');
  }
});

// ==================== TAB DATA LOADER ====================

function loadTabData(tabName) {
  switch(tabName) {
    case 'overview':
      loadDashboardStats();
      break;
    case 'users':
      loadUsers();
      break;
    case 'projects':
      loadProjects();
      break;
    case 'reviews':
      loadReviews();
      break;
    case 'analytics':
      loadAnalytics();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

// ==================== LOGOUT ====================

document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    DevHubAPI.Auth.logout();
  }
});

// ==================== UPDATE ADMIN INFO ====================

function updateAdminInfo() {
  document.getElementById('adminName').textContent = currentUser.fullName;
}

// ==================== INITIALIZE ====================

document.addEventListener('DOMContentLoaded', () => {
  updateAdminInfo();
  loadDashboardStats();
  
  // Auto-refresh stats every 60 seconds
  setInterval(loadDashboardStats, 60000);
});