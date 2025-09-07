// public/js/auth.js
const API_URL = "https://devhub-1-yefd.onrender.com/api/auth"; // ✅ FIXED

// Show login modal
function showLogin() {
  document.getElementById("authModals").classList.remove("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
}

// Show register modal
function showRegister() {
  document.getElementById("authModals").classList.remove("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
}

// Close modal
function closeAuth() {
  document.getElementById("authModals").classList.add("hidden");
}

// Handle Login
document.getElementById("loginFormEl")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    // Save token & user data
    localStorage.setItem("devhub_token", data.token);
    localStorage.setItem("devhub_user", JSON.stringify(data.user));

    alert("✅ Login successful!");
    closeAuth();
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});

// Handle Register
document.getElementById("registerFormEl")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  const role = document.getElementById("registerRole").value;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");

    // Save token & user data immediately
    localStorage.setItem("devhub_token", data.token);
    localStorage.setItem("devhub_user", JSON.stringify(data.user));

    alert("✅ Registration successful! Redirecting...");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(`❌ ${err.message}`);
  }
});
