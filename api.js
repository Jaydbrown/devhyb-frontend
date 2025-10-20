// DevHub API Client
// Include this file in all your HTML pages

const API_BASE_URL = 'www.devhyb-frontend.vercel.app';

// ==================== HELPER FUNCTIONS ====================

// Get token from localStorage
const getToken = () => localStorage.getItem('devhub_token');

// Set token to localStorage
const setToken = (token) => localStorage.setItem('devhub_token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('devhub_token');

// Get current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('devhub_user');
  return user ? JSON.parse(user) : null;
};

// Set current user to localStorage
const setCurrentUser = (user) => {
  localStorage.setItem('devhub_user', JSON.stringify(user));
};

// Remove current user from localStorage
const removeCurrentUser = () => {
  localStorage.removeItem('devhub_user');
};

// Make API request with optional authentication
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== AUTHENTICATION API ====================

const AuthAPI = {
  // Register new user
  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.token) {
      setToken(data.token);
      setCurrentUser(data.user);
    }
    
    return data;
  },

  // Login user
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      setToken(data.token);
      setCurrentUser(data.user);
    }
    
    return data;
  },

  // Get current user
  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },

  // Logout user
  logout: () => {
    removeToken();
    removeCurrentUser();
    window.location.href = 'index.html';
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!getToken();
  },

  // Get user type (Developer or Client)
  getUserType: () => {
    const user = getCurrentUser();
    return user ? user.userType : null;
  },
};

// ==================== DEVELOPER API ====================

const DeveloperAPI = {
  // Get all developers with filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`/developers${params ? `?${params}` : ''}`);
  },

  // Get single developer by ID
  getById: async (id) => {
    return await apiRequest(`/developers/${id}`);
  },

  // Update developer profile
  update: async (id, data) => {
    return await apiRequest(`/developers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete developer profile
  delete: async (id) => {
    return await apiRequest(`/developers/${id}`, {
      method: 'DELETE',
    });
  },

  // Search developers
  search: async (query) => {
    return await apiRequest(`/developers?search=${encodeURIComponent(query)}`);
  },

  // Filter by skill
  filterBySkill: async (skill) => {
    return await apiRequest(`/developers?skill=${encodeURIComponent(skill)}`);
  },

  // Filter by location
  filterByLocation: async (location) => {
    return await apiRequest(`/developers?location=${encodeURIComponent(location)}`);
  },

  // Filter by rating
  filterByRating: async (minRating) => {
    return await apiRequest(`/developers?rating=${minRating}`);
  },
};

// ==================== PROJECT API ====================

const ProjectAPI = {
  // Get all projects
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`/projects${params ? `?${params}` : ''}`);
  },

  // Get single project
  getById: async (id) => {
    return await apiRequest(`/projects/${id}`);
  },

  // Create new project
  create: async (projectData) => {
    return await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  // Update project
  update: async (id, data) => {
    return await apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete project
  delete: async (id) => {
    return await apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Get projects by status
  getByStatus: async (status) => {
    return await apiRequest(`/projects?status=${status}`);
  },

  // Get client's projects
  getClientProjects: async (clientId) => {
    return await apiRequest(`/projects?clientId=${clientId}`);
  },

  // Get developer's projects
  getDeveloperProjects: async (developerId) => {
    return await apiRequest(`/projects?developerId=${developerId}`);
  },
};

// ==================== REVIEW API ====================

const ReviewAPI = {
  // Get developer reviews
  getDeveloperReviews: async (developerId) => {
    return await apiRequest(`/reviews/developer/${developerId}`);
  },

  // Add review
  add: async (reviewData) => {
    return await apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Update review
  update: async (id, data) => {
    return await apiRequest(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete review
  delete: async (id) => {
    return await apiRequest(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== MESSAGE API ====================

const MessageAPI = {
  // Get all messages
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`/messages${params ? `?${params}` : ''}`);
  },

  // Get conversations
  getConversations: async () => {
    return await apiRequest('/messages/conversations');
  },

  // Send message
  send: async (receiverId, message) => {
    return await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, message }),
    });
  },

  // Mark message as read
  markAsRead: async (id) => {
    return await apiRequest(`/messages/${id}/read`, {
      method: 'PATCH',
    });
  },

  // Mark all messages from sender as read
  markAllAsRead: async (senderId) => {
    return await apiRequest(`/messages/read-all/${senderId}`, {
      method: 'PATCH',
    });
  },

  // Delete message
  delete: async (id) => {
    return await apiRequest(`/messages/${id}`, {
      method: 'DELETE',
    });
  },

  // Get conversation with specific user
  getConversation: async (userId) => {
    return await apiRequest(`/messages?conversationWith=${userId}`);
  },
};

// ==================== STATS API ====================

const StatsAPI = {
  // Get client stats
  getClientStats: async (clientId) => {
    return await apiRequest(`/stats/client/${clientId}`);
  },

  // Get developer stats
  getDeveloperStats: async (developerId) => {
    return await apiRequest(`/stats/developer/${developerId}`);
  },

  // Get platform stats
  getPlatformStats: async () => {
    return await apiRequest('/stats/platform');
  },
};

// ==================== UTILITY FUNCTIONS ====================

// Check authentication on page load
const checkAuth = () => {
  if (!AuthAPI.isAuthenticated()) {
    // Redirect to login if not authenticated (except on public pages)
    const publicPages = ['index.html', 'login.html', 'register.html', ''];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!publicPages.includes(currentPage)) {
      window.location.href = 'index.html';
    }
  }
};

// Redirect based on user type
const redirectToDashboard = () => {
  const userType = AuthAPI.getUserType();
  
  if (userType === 'Developer') {
    window.location.href = 'developer-dashboard.html';
  } else if (userType === 'Client') {
    window.location.href = 'client-dashboard.html';
  }
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Format time ago
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return formatDate(dateString);
};

// Show loading spinner
const showLoading = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<div class="spinner">Loading...</div>';
  }
};

// Hide loading spinner
const hideLoading = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '';
  }
};

// Show error message
const showError = (message, elementId = 'error-message') => {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="error-alert">${message}</div>`;
    setTimeout(() => {
      element.innerHTML = '';
    }, 5000);
  } else {
    alert(message);
  }
};

// Show success message
const showSuccess = (message, elementId = 'success-message') => {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="success-alert">${message}</div>`;
    setTimeout(() => {
      element.innerHTML = '';
    }, 5000);
  } else {
    alert(message);
  }
};

// ==================== EXPORT FOR USE ====================

// Make APIs available globally
window.DevHubAPI = {
  Auth: AuthAPI,
  Developer: DeveloperAPI,
  Project: ProjectAPI,
  Review: ReviewAPI,
  Message: MessageAPI,
  Stats: StatsAPI,
  
  // Utility functions
  checkAuth,
  redirectToDashboard,
  formatDate,
  timeAgo,
  showLoading,
  hideLoading,
  showError,
  showSuccess,
  getCurrentUser,
  getToken,
};


console.log('✅ DevHub API Client loaded successfully!');
