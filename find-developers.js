// find-developers.js - Find Developers Page Logic

let currentFilters = {
  search: '',
  skill: '',
  location: '',
  rating: '',
};

// ==================== LOAD ALL DEVELOPERS ====================

async function loadDevelopers() {
  try {
    showLoading('developer-list');
    
    const response = await DevHubAPI.Developer.getAll(currentFilters);
    const developers = response.developers || response;
    
    const developerList = document.querySelector('.developer-list');
    developerList.innerHTML = '';
    
    if (developers.length === 0) {
      developerList.innerHTML = '<p style="text-align: center; padding: 40px;">No developers found matching your criteria</p>';
      return;
    }
    
    developers.forEach(dev => {
      const devCard = createDeveloperCard(dev);
      developerList.appendChild(devCard);
    });
    
    hideLoading('developer-list');
    
  } catch (error) {
    console.error('Error loading developers:', error);
    showError('Failed to load developers');
  }
}

// ==================== CREATE DEVELOPER CARD ====================

function createDeveloperCard(dev) {
  const devCard = document.createElement('div');
  devCard.className = 'developer-card';
  
  const skills = dev.skills ? dev.skills.split(',').slice(0, 5).join(', ') : 'Full Stack Developer';
  const bio = dev.bio || 'Experienced developer ready to bring your projects to life.';
  
  devCard.innerHTML = `
    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(dev.full_name)}&size=90&background=007bff&color=fff" alt="${dev.full_name}" />
    <div class="dev-info">
      <h3>${dev.full_name}</h3>
      <p class="dev-skill">${skills}</p>
      <p class="dev-bio">${bio.substring(0, 150)}${bio.length > 150 ? '...' : ''}</p>
      <div class="rating">⭐ ${parseFloat(dev.rating || 0).toFixed(1)} (${dev.total_reviews || 0} reviews)</div>
      <div class="dev-buttons">
        <a href="developer-profile.html?id=${dev.id}" class="btn-outline">View Profile</a>
        <a href="javascript:void(0)" onclick="messageDeveloper(${dev.user_id})" class="btn-blue">Message Developer</a>
      </div>
    </div>
  `;
  
  return devCard;
}

// ==================== FILTER FUNCTIONALITY ====================

// Apply filters button
document.querySelector('.filter-bar button')?.addEventListener('click', () => {
  applyFilters();
});

// Search input (Enter key)
document.querySelector('.filter-bar input[type="text"]')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    applyFilters();
  }
});

function applyFilters() {
  const searchInput = document.querySelector('.filter-bar input[type="text"]');
  const skillSelect = document.querySelectorAll('.filter-bar select')[0];
  const locationSelect = document.querySelectorAll('.filter-bar select')[1];
  const ratingSelect = document.querySelectorAll('.filter-bar select')[2];
  
  currentFilters = {
    search: searchInput?.value || '',
    skill: skillSelect?.value || '',
    location: locationSelect?.value || '',
    rating: ratingSelect?.value === '4 Stars & Above' ? '4' : 
            ratingSelect?.value === '3 Stars & Above' ? '3' : '',
  };
  
  // Remove empty filters
  Object.keys(currentFilters).forEach(key => {
    if (!currentFilters[key]) {
      delete currentFilters[key];
    }
  });
  
  loadDevelopers();
}

// ==================== MESSAGE DEVELOPER ====================

function messageDeveloper(userId) {
  // Check if user is logged in
  if (!DevHubAPI.Auth.isAuthenticated()) {
    alert('Please login to message developers');
    window.location.href = 'index.html';
    return;
  }
  
  // Store user ID and redirect to messages page
  localStorage.setItem('message_to_user', userId);
  
  // For now, show a prompt (you can create a dedicated messages page)
  const message = prompt('Enter your message:');
  if (message) {
    sendMessage(userId, message);
  }
}

// ==================== SEND MESSAGE ====================

async function sendMessage(receiverId, message) {
  try {
    await DevHubAPI.Message.send(receiverId, message);
    alert('Message sent successfully!');
  } catch (error) {
    alert(error.message || 'Failed to send message');
  }
}

// ==================== QUICK FILTER BUTTONS ====================

// Add quick filter functionality for popular searches
function quickFilter(type, value) {
  const searchInput = document.querySelector('.filter-bar input[type="text"]');
  const skillSelect = document.querySelectorAll('.filter-bar select')[0];
  const locationSelect = document.querySelectorAll('.filter-bar select')[1];
  
  if (type === 'skill' && skillSelect) {
    skillSelect.value = value;
  } else if (type === 'location' && locationSelect) {
    locationSelect.value = value;
  } else if (type === 'search' && searchInput) {
    searchInput.value = value;
  }
  
  applyFilters();
}

// ==================== INITIALIZE ====================

document.addEventListener('DOMContentLoaded', () => {
  loadDevelopers();
  
  // Check if user is logged in and update UI
  if (DevHubAPI.Auth.isAuthenticated()) {
    const user = DevHubAPI.getCurrentUser();
    console.log('Logged in as:', user.fullName);
  }
});