// developer-profile.js - Developer Profile Page Logic

const API_BASE = 'https://devhub-rshq.onrender.com/api';

// ==================== PAGE LOAD ====================
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const devId = urlParams.get('id');
  
  if (!devId) {
    alert('Developer ID not provided');
    window.location.href = 'find-developers.html';
    return;
  }
  
  loadDeveloperProfile(devId);
  setupCommentForm(devId);
  checkLoginStatus();
});

// ==================== LOAD DEVELOPER PROFILE ====================
async function loadDeveloperProfile(devId) {
  try {
    const response = await fetch(`${API_BASE}/developers/${devId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const developer = data.developer || data;
    
    // Populate profile header
    populateProfileHeader(developer);
    
    // Populate about section
    populateAbout(developer);
    
    // Populate skills
    populateSkills(developer);
    
    // Populate portfolio
    populatePortfolio(developer);
    
    // Populate reviews
    populateReviews(developer);
    
    // Populate pricing
    populatePricing(developer);
    
    // Setup hire button
    setupHireButton(developer);
    
  } catch (error) {
    console.error('Error loading developer profile:', error);
    document.querySelector('.profile-container').innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h2 style="color: #f44336; margin-bottom: 10px;">⚠️ Failed to load profile</h2>
        <p style="color: #666; margin-bottom: 20px;">The developer profile could not be loaded.</p>
        <a href="find-developers.html" style="background: #007bff; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Back to Developers
        </a>
      </div>
    `;
  }
}

// ==================== POPULATE PROFILE HEADER ====================
function populateProfileHeader(dev) {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.full_name)}&size=200&background=667eea&color=fff`;
  
  document.getElementById('dev-image').src = avatarUrl;
  document.getElementById('dev-name').textContent = dev.full_name;
  
  const skills = dev.skills ? dev.skills.split(',').slice(0, 2).join(' • ') : 'Full Stack Developer';
  document.getElementById('dev-role').textContent = skills;
  
  const rating = parseFloat(dev.rating || 0).toFixed(1);
  const reviews = dev.total_reviews || 0;
  document.getElementById('dev-rating').textContent = `⭐ ${rating} (${reviews} reviews)`;
}

// ==================== POPULATE ABOUT ====================
function populateAbout(dev) {
  const bio = dev.bio || 'Experienced developer passionate about building high-quality software solutions. Ready to bring your ideas to life with clean, efficient code.';
  document.getElementById('dev-bio').textContent = bio;
}

// ==================== POPULATE SKILLS ====================
function populateSkills(dev) {
  const skillsContainer = document.getElementById('skill-cards');
  skillsContainer.innerHTML = '';
  
  const skillsArray = dev.skills ? dev.skills.split(',').map(s => s.trim()) : ['JavaScript', 'React', 'Node.js', 'Python'];
  
  skillsArray.forEach(skill => {
    const skillCard = document.createElement('div');
    skillCard.className = 'skill-card';
    skillCard.textContent = skill;
    skillsContainer.appendChild(skillCard);
  });
}

// ==================== POPULATE PORTFOLIO ====================
function populatePortfolio(dev) {
  const portfolioSlider = document.getElementById('portfolio-slider');
  portfolioSlider.innerHTML = '';
  
  // Use portfolio URL if available, otherwise use placeholder images
  const portfolioImages = dev.projects && dev.projects.length > 0
    ? dev.projects.slice(0, 3).map((_, i) => `https://source.unsplash.com/900x500/?code,project,${i}`)
    : [
        'https://source.unsplash.com/900x500/?code,programming',
        'https://source.unsplash.com/900x500/?webapp,design',
        'https://source.unsplash.com/900x500/?technology,software'
      ];
  
  portfolioImages.forEach((imgSrc, index) => {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = `Portfolio project ${index + 1}`;
    if (index === 0) img.classList.add('active');
    portfolioSlider.appendChild(img);
  });
  
  // If there's a portfolio URL, add a link
  if (dev.portfolio_url) {
    const portfolioLink = document.createElement('div');
    portfolioLink.style.cssText = 'text-align: center; margin-top: 10px;';
    portfolioLink.innerHTML = `
      <a href="${dev.portfolio_url}" target="_blank" rel="noopener noreferrer" 
         style="color: #007bff; text-decoration: none; font-weight: 600;">
        🔗 View Full Portfolio →
      </a>
    `;
    document.querySelector('.portfolio').appendChild(portfolioLink);
  }
}

// ==================== POPULATE REVIEWS ====================
function populateReviews(dev) {
  const reviewsList = document.getElementById('reviews-list');
  reviewsList.innerHTML = '';
  
  if (dev.reviews && dev.reviews.length > 0) {
    dev.reviews.forEach(review => {
      const reviewDiv = document.createElement('div');
      reviewDiv.className = 'review';
      
      const rating = '⭐'.repeat(Math.round(review.rating || 5));
      const date = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      reviewDiv.innerHTML = `
        <strong>${review.author_name || review.client_name || 'Anonymous Client'}</strong> 
        <small>• ${rating} • ${date}</small>
        <p>${review.message || 'Great developer to work with!'}</p>
      `;
      
      reviewsList.appendChild(reviewDiv);
    });
  } else {
    reviewsList.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666;">
        <p>No reviews yet. Be the first to work with this developer!</p>
      </div>
    `;
  }
}

// ==================== POPULATE PRICING ====================
function populatePricing(dev) {
  const hourlyRate = dev.hourly_rate || 45;
  document.getElementById('dev-price').textContent = `$${hourlyRate} / hour`;
  
  // Add experience info
  const yearsExp = dev.years_experience || 0;
  const location = dev.location || 'Remote';
  
  const pricingSection = document.querySelector('.pricing');
  const infoDiv = document.createElement('div');
  infoDiv.style.cssText = 'margin-bottom: 1rem; color: #555; font-size: 0.95rem;';
  infoDiv.innerHTML = `
    <p>📍 ${location}</p>
    <p>💼 ${yearsExp}+ years experience</p>
    <p>⚡ ${dev.experience_level || 'Mid'} Level</p>
  `;
  
  pricingSection.insertBefore(infoDiv, pricingSection.querySelector('.price'));
}

// ==================== SETUP HIRE BUTTON ====================
function setupHireButton(dev) {
  const hireButton = document.querySelector('.pricing button');
  
  hireButton.addEventListener('click', () => {
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
    
    showHireModal(dev);
  });
}

// ==================== SHOW HIRE MODAL ====================
function showHireModal(dev) {
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
  
  const today = new Date().toISOString().split('T')[0];
  
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; margin: 20px;">
      <h2 style="margin-bottom: 15px; color: #007bff;">💼 Hire ${dev.full_name}</h2>
      <p style="color: #666; margin-bottom: 20px; font-size: 0.95rem;">
        Fill in the details below to start working with this developer.
      </p>
      
      <form id="hireForm">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Project Title</label>
          <input type="text" id="projectTitle" placeholder="e.g., E-commerce Website Development" required 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Project Description</label>
          <textarea id="projectDesc" placeholder="Describe your project requirements, features, and expectations..." required 
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 120px; resize: vertical; font-size: 0.95rem;"></textarea>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Budget (USD)</label>
          <input type="number" id="projectBudget" placeholder="e.g., 5000" required min="100"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
          <small style="color: #666; font-size: 0.85rem;">Developer's rate: $${dev.hourly_rate || 45}/hour</small>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Project Deadline</label>
          <input type="date" id="projectDeadline" required min="${today}"
            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button type="submit" style="flex: 1; background: #007bff; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem;">
            Send Proposal
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
  document.getElementById('hireForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    const projectData = {
      title: document.getElementById('projectTitle').value,
      description: document.getElementById('projectDesc').value,
      budget: parseFloat(document.getElementById('projectBudget').value),
      deadline: document.getElementById('projectDeadline').value,
      developerId: dev.id
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
        alert(`✅ Project proposal sent to ${dev.full_name}! Check your dashboard for updates.`);
        modal.remove();
        window.location.href = 'client-dashboard.html';
      } else {
        const error = await response.json();
        alert('Failed to send proposal: ' + (error.message || 'Please try again.'));
        submitButton.disabled = false;
        submitButton.textContent = 'Send Proposal';
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error sending proposal. Please check your connection and try again.');
      submitButton.disabled = false;
      submitButton.textContent = 'Send Proposal';
    }
  });
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ==================== SETUP COMMENT FORM ====================
function setupCommentForm(devId) {
  const commentForm = document.getElementById('comment-form');
  
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('devhub_token');
    if (!token) {
      alert('Please login to leave a comment');
      window.location.href = 'index.html';
      return;
    }
    
    const user = JSON.parse(localStorage.getItem('devhub_user') || '{}');
    if (user.userType !== 'Client') {
      alert('Only clients can leave reviews');
      return;
    }
    
    const commentText = document.getElementById('comment-text').value.trim();
    
    if (!commentText) {
      alert('Please write a comment');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          developerId: devId,
          rating: 5, // Default rating
          message: commentText
        })
      });
      
      if (response.ok) {
        alert('✅ Review submitted successfully!');
        document.getElementById('comment-text').value = '';
        
        // Reload the page to show the new review
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        alert('Failed to submit review: ' + (error.message || 'You may have already reviewed this developer.'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  });
}

// ==================== PORTFOLIO SLIDESHOW ====================
let slideIndex = 0;

function showSlide(index) {
  const slides = document.querySelectorAll('.portfolio-slider img');
  if (slides.length === 0) return;
  
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === index) slide.classList.add('active');
  });
}

window.nextSlide = function() {
  const slides = document.querySelectorAll('.portfolio-slider img');
  if (slides.length === 0) return;
  
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
};

window.prevSlide = function() {
  const slides = document.querySelectorAll('.portfolio-slider img');
  if (slides.length === 0) return;
  
  slideIndex = (slideIndex - 1 + slides.length) % slides.length;
  showSlide(slideIndex);
};

// Auto-advance portfolio slides every 5 seconds
setInterval(() => {
  const slides = document.querySelectorAll('.portfolio-slider img');
  if (slides.length > 1) {
    window.nextSlide();
  }
}, 5000);

// ==================== CHECK LOGIN STATUS ====================
function checkLoginStatus() {
  const token = localStorage.getItem('devhub_token');
  const user = JSON.parse(localStorage.getItem('devhub_user') || '{}');
  
  if (token && user.fullName) {
    const nav = document.querySelector('.top-nav');
    const navLinks = document.createElement('div');
    navLinks.style.cssText = 'margin-left: auto; display: flex; gap: 15px; align-items: center;';
    navLinks.innerHTML = `
      <span style="color: #666;">Welcome, ${user.fullName.split(' ')[0]}!</span>
      <a href="${user.userType === 'Developer' ? 'developer-dashboard.html' : 'client-dashboard.html'}" 
         style="color: #007bff; text-decoration: none; font-weight: 600;">Dashboard</a>
      <button onclick="logout()" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
        Logout
      </button>
    `;
    nav.appendChild(navLinks);
  }
}

// ==================== LOGOUT ====================
window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('devhub_token');
    localStorage.removeItem('devhub_user');
    window.location.href = 'index.html';
  }
};
