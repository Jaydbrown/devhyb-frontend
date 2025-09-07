const API_URL = "http://localhost:5000/api"; // ✅ FIXED

// Load Profile Data
async function fetchProfile() {
  try {
    const token = localStorage.getItem("devhub_token");
    if (!token) {
      console.error("⚠️ No token found, please log in again.");
      return;
    }

    const res = await fetch(`${API_URL}/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch profile");

    const data = await res.json();

    // Populate Fields
    document.getElementById("profilePic").src = data.profile_pic || "../images/default-avatar.png";
    document.getElementById("userName").textContent = data.name || data.full_name || "No Name";
    document.getElementById("userRole").textContent = data.role || "N/A";
    document.getElementById("fullName").value = data.name || data.full_name || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("location").value = data.location || "";

    // Role-specific fields
    if (data.role === "developer") {
      document.getElementById("developerSection").classList.remove("hidden");
      document.getElementById("skills").value = data.skills ? data.skills.join(", ") : "";
      document.getElementById("hourlyRate").value = data.hourly_rate || "";
    } else if (data.role === "client") {
      document.getElementById("clientSection").classList.remove("hidden");
      document.getElementById("company").value = data.company || "";
      document.getElementById("budget").value = data.budget || "";
    }
  } catch (err) {
    console.error("Profile Fetch Error:", err);
  }
}

// Save Profile Changes
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("devhub_token");
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const formData = new FormData();
    formData.append("full_name", document.getElementById("fullName").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("location", document.getElementById("location").value);

    // Developer fields
    if (!document.getElementById("developerSection").classList.contains("hidden")) {
      formData.append("skills", document.getElementById("skills").value);
      formData.append("hourly_rate", document.getElementById("hourlyRate").value);
    }

    // Client fields
    if (!document.getElementById("clientSection").classList.contains("hidden")) {
      formData.append("company", document.getElementById("company").value);
      formData.append("budget", document.getElementById("budget").value);
    }

    // Profile picture
    const fileInput = document.getElementById("profileImageInput");
    if (fileInput.files[0]) {
      formData.append("profile_pic", fileInput.files[0]);
    }

    // Password change
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;
    if (newPass && newPass === confirmPass) {
      formData.append("new_password", newPass);
    }

    const res = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) throw new Error("Profile update failed");
    alert("Profile updated successfully!");
    fetchProfile();
  } catch (err) {
    console.error("Profile Update Error:", err);
  }
});

// Load on Page Start
fetchProfile();
