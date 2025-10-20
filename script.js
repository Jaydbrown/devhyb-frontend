
const searchInput = document.getElementById('searchInput');

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    alert(`Searching for: ${query}`);
  } else {
    alert('Please enter something to search!');
  }
});

// 🌐 Existing navbar & toggle logic remains

// 🧭 Categories Slider
const slider = document.querySelector('.slider');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let index = 0;

function moveSlider() {
  const slideWidth = slides[0].clientWidth + 20; // +gap
  slider.style.transform = `translateX(-${index * slideWidth}px)`;
}

nextBtn.addEventListener('click', () => {
  index = (index + 1) % slides.length;
  moveSlider();
});

prevBtn.addEventListener('click', () => {
  index = (index - 1 + slides.length) % slides.length;
  moveSlider();
});

// 💬 Testimonials Auto Slide
const testimonials = [
  {
    text: '"DevHub helped me find a developer in just one day — amazing experience!"',
    author: "— Sarah, Startup Founder",
  },
  {
    text: '"Super smooth process! The developers were top-notch."',
    author: "— Daniel, Product Manager",
  },
  {
    text: '"I posted a job and got connected to great talent instantly!"',
    author: "— Lola, Agency Owner",
  },
];

let tIndex = 0;
const testimonialText = document.getElementById("testimonialText");
const testimonialAuthor = document.getElementById("testimonialAuthor");

setInterval(() => {
  tIndex = (tIndex + 1) % testimonials.length;
  testimonialText.textContent = testimonials[tIndex].text;
  testimonialAuthor.textContent = testimonials[tIndex].author;
}, 4000);

// ==== Modal Controls ====
  const openLogin = document.querySelector(".sign-in");
  const openSignup = document.querySelector(".log-in");

  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  openLogin.onclick = () => loginModal.style.display = "flex";
  openSignup.onclick = () => signupModal.style.display = "flex";

  function closeModal(id) {
    document.getElementById(id).style.display = "none";
  }

  window.onclick = (e) => {
    if (e.target === loginModal) closeModal('loginModal');
    if (e.target === signupModal) closeModal('signupModal');
  };

  // ==== Step Navigation ====
  let currentStep = 1;
  function showStep(step) {
    document.querySelectorAll(".signup-step").forEach((s) => s.classList.add("hidden"));
    document.getElementById(`signupStep${step}`).classList.remove("hidden");

    document.querySelectorAll(".dot").forEach((d) => d.classList.remove("active"));
    document.getElementById(`dot${step}`).classList.add("active");
    currentStep = step;
  }

  function nextStep(step) { showStep(step); }
  function prevStep(step) { showStep(step); }

  // ==== Developer / Client toggle ====
  document.getElementById("userType").addEventListener("change", (e) => {
    const dev = document.getElementById("devFields");
    const cli = document.getElementById("clientFields");
    if (e.target.value === "Developer") {
      dev.classList.remove("hidden");
      cli.classList.add("hidden");
    } else {
      cli.classList.remove("hidden");
      dev.classList.add("hidden");
    }
  });

  // ==== Generate Demo Details ====
  function generateDemo() {
    const random = () => Math.random().toString(36).substring(2, 7);
    document.getElementById("fullName").value = "Demo User " + random();
    document.getElementById("email").value = "demo_" + random() + "@mail.com";
    const pwd = "P@ss" + random() + "!";
    document.getElementById("password").value = pwd;
    document.getElementById("confirmPassword").value = pwd;
    document.getElementById("userType").value = "Developer";
  }