const API_URL = "https://devhub-1-yefd.onrender.com";

// Fetch Dashboard Data
async function fetchDashboardData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch dashboard data");

    const data = await res.json();
    updateDashboardUI(data);
  } catch (err) {
    console.error("Dashboard Error:", err);
  }
}

// Update Dashboard Stats & Lists
function updateDashboardUI(data) {
  document.getElementById("totalDevelopers").textContent = data.totalDevelopers;
  document.getElementById("totalJobs").textContent = data.totalJobs;
  document.getElementById("pendingRequests").textContent = data.pendingRequests;
  document.getElementById("completedJobs").textContent = data.completedJobs;

  // Populate Recent Jobs
  const jobsList = document.getElementById("recentJobs");
  jobsList.innerHTML = data.recentJobs.length
    ? data.recentJobs.map(job => `
        <li class="border-b pb-2">
          <h3 class="text-lg font-semibold text-indigo-600">${job.title}</h3>
          <p class="text-gray-500">${job.description}</p>
        </li>
      `).join("")
    : `<p class="text-gray-500">No recent jobs available.</p>`;

  // Populate Recent Hire Requests
  const hiresList = document.getElementById("recentHires");
  hiresList.innerHTML = data.recentHires.length
    ? data.recentHires.map(hire => `
        <li class="border-b pb-2">
          <p><strong>${hire.client_name}</strong> requested <strong>${hire.dev_name}</strong></p>
          <p class="text-gray-500">Status: ${hire.status}</p>
        </li>
      `).join("")
    : `<p class="text-gray-500">No hire requests yet.</p>`;
}

// Load dashboard on page load
fetchDashboardData();
