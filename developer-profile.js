// developer-profile.js - Developer Profile Page Logic

// Get developer ID from URL
const urlParams = new URLSearchParams(window.location.search);
const developerId = urlParams.get('id') || 1;

let currentSlideIndex = 0;

// ==================== LOAD DEVELOPER PROFILE ====================

async function loadDeveloperProfile() {
  try {
    showLoading('profile');
    
    const response = await DevHubAPI.Developer.getById(developerId);
    const developer = response.developer || response;
    
    // Update profile header
    document.getElementById('dev-image').src = 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.full_name)}&size=120&background=007bff&color=fff`;
    document.getElementById('dev-name').textContent = developer.full_name;
    document.getElementById('dev-role').textContent = developer.skills || 'Full Stack Developer';
    document.getElementById('dev-rating').textContent = 
      `⭐ ${parseFloat(developer.rating).toFixed(1)} (${developer.total_reviews} reviews)`;
    
    // Update about section
    document.getElementById('dev-bio').textContent = 
      developer.bio || 'No bio available';
    
    // Update skills
    const skillsContainer = document.getElementById('skill-cards');
    skillsContainer.innerHTML = '';
    const skills = developer.skills ? developer.skills.split(',') : [];
    skills.forEach(skill => {
      const skillCard = document.createElement('div');
      skillCard.className = 'skill-card';
      skillCard.textContent = skill.trim();
      skillsContainer.appendChild(skillCard);
    });
    
    // Update portfolio slider
    loadPortfolioSlider(developer);
    
    // Load reviews
    loadReviews(developer.reviews || []);
    
    // Update pricing
    document.getElementById('dev-price').textContent = 
      `$${developer.hourly_rate || 45} / hour`;
    
    hideLoading('profile');
    
  } catch (error) {
    console.error('Error loading developer:', error);
    showError('Failed to load developer profile');
  }
}

// ==================== LOAD PORTFOLIO SLIDER ====================

function loadPortfolioSlider(developer) {
  const portfolioSlider = document.getElementById('portfolio-slider');
  portfolioSlider.innerHTML = '';
  
  // Default portfolio images
  const portfolioImages = [
    'https://source.unsplash.com/900x500/?webapp,code',
    'https://source.unsplash.com/900x500/?programming,developer',
    'https://source.unsplash.com/900x500/?website,design'
  ];
  
  portfolioImages.forEach((img, index) => {
    const image = document.createElement('img');
    image.src = img;
    image.alt = 'Portfolio Image';
    if (index === 0) image.classList.add('active');
    portfolioSlider.appendChild(image);
  });
}

// ==================== PORTFOLIO SLIDESHOW ====================

function showSlide(index) {
  const slides = document.querySelectorAll('.portfolio-slider img');
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === index) {
      slide.classList.add('active');
    }
  });
}

function nextSlide() {
  const slides = document.querySelectorAll('.portfolio-slider img');
  currentSlideIndex = (currentSlideIndex + 1) % slides.length;
  showSlide(currentSlideIndex);
}

function prevSlide() {
  const slides = document.querySelectorAll('.portfolio-slider img');
  currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
  showSlide(currentSlideIndex);
}

// Auto-advance slides
setInterval(nextSlide, 5000);

// ==================== LOAD REVIEWS ====================

function loadReviews(reviews) {
  const reviewsList = document.getElementById('reviews-list');
  reviewsList.innerHTML = '';
  
  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p style="padding: 20px; text-align: center;">No reviews yet</p>';
    return;
  }
  
  reviews.forEach(review => {
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'review';
    reviewDiv.innerHTML = `
      <strong>${review.client_name || review.author_name || 'Anonymous'}</strong>
      <small>• Rating: ${'⭐'.repeat(review.rating)}</small>
      <p>${review.message}</p>
      <small>${DevHubAPI.formatDate(review.created_at)}</small>
    `;
    reviewsList.appendChild(reviewDiv);
  });
}

// ==================== COMMENT FORM ====================

document.getElementById('comment-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const commentText = document.getElementById('comment-text').value;
  
  if (!commentText.trim()) {
    alert('Please write a comment');
    return;
  }
  
  // Check if user is logged in
  if (!DevHubAPI.Auth.isAuthenticated()) {
    alert('Please login to leave a comment');
    window.location.href = 'index.html';
    return;
  }
  
  const currentUser = DevHubAPI.getCurrentUser();
  
  // Only clients can leave reviews
  if (currentUser.userType !== 'Client') {
    alert('Only clients can leave reviews');
    return;
  }
  
  try {
    // For simplicity, using a default rating of 5
    // You can add a rating input field in your HTML
    await DevHubAPI.Review.add({
      developerId: parseInt(developerId),
      rating: 5,
      message: commentText
    });
    
    alert('Review submitted successfully!');
    document.getElementById('comment-text').value = '';
    
    // Reload profile to show new review
    loadDeveloperProfile();
    
  } catch (error) {
    alert(error.message || 'Failed to submit review. You may have already reviewed this developer.');
  }
});

// ==================== HIRE DEVELOPER ====================

document.querySelector('.pricing button')?.addEventListener('click', () => {
  // Check if user is logged in
  if (!DevHubAPI.Auth.isAuthenticated()) {
    alert('Please login to hire a developer');
    window.location.href = 'index.html';
    return;
  }
  
  const currentUser = DevHubAPI.getCurrentUser();
  
  // Only clients can hire developers
  if (currentUser.userType !== 'Client') {
    alert('Only clients can hire developers');
    return;
  }
  
  // Store developer ID and redirect to create project page
  localStorage.setItem('hire_developer_id', developerId);
  
  // For now, show alert (you can create a project creation page)
  const projectTitle = prompt('Enter project title:');
  if (projectTitle) {
    const projectDescription = prompt('Enter project description:');
    const budget = prompt('Enter budget (USD):');
    
    if (projectDescription && budget) {
      createProject(projectTitle, projectDescription, budget);
    }
  }
});

// ==================== CREATE PROJECT ====================

async function createProject(title, description, budget) {
  try {
    await DevHubAPI.Project.create({
      title,
      description,
      budget: parseFloat(budget),
      developerId: parseInt(developerId),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    });
    
    alert('Project created successfully! Check your dashboard.');
    window.location.href = 'client-dashboard.html';
    
  } catch (error) {
    alert(error.message || 'Failed to create project');
  }
}

// ==================== MESSAGE DEVELOPER ====================

function messageDeveloper() {
  // Check if user is logged in
  if (!DevHubAPI.Auth.isAuthenticated()) {
    alert('Please login to message developers');
    window.location.href = 'index.html';
    return;
  }
  
  // Get developer's user_id and redirect to messages
  // You'll need to implement a messages page
  alert('Messaging feature coming soon!');
}

// ==================== INITIALIZE ====================

document.addEventListener('DOMContentLoaded', () => {
  loadDeveloperProfile();
});