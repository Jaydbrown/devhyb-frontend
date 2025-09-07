const API_URL = "http://localhost:5000/api/developers";
const profileContainer = document.getElementById("developerProfile");
const messageBox = document.getElementById("messageBox");

// Get Developer ID from URL
const urlParams = new URLSearchParams(window.location.search);
const devId = urlParams.get("id");

// Show notification messages
function showMessage(msg, type = "success") {
    messageBox.textContent = msg;
    messageBox.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white ${
        type === "success" ? "bg-green-600" : "bg-red-600"
    }`;
    messageBox.classList.remove("hidden");
    setTimeout(() => messageBox.classList.add("hidden"), 3000);
}

// Fetch developer profile data
async function fetchDeveloperProfile() {
    try {
        const res = await fetch(`${API_URL}/${devId}`);
        if (!res.ok) throw new Error("Failed to fetch developer profile");

        const dev = await res.json();
        displayDeveloperProfile(dev);
    } catch (err) {
        console.error(err);
        profileContainer.innerHTML = `<p class="text-red-500">Developer profile not found.</p>`;
    }
}

// Display profile details
function displayDeveloperProfile(dev) {
    profileContainer.innerHTML = `
        <div class="flex flex-col sm:flex-row items-center sm:items-start">
            <img src="${dev.avatar || '../images/default-avatar.png'}" alt="Profile Picture" class="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-md mr-6" />
            <div class="flex-1 mt-4 sm:mt-0">
                <h1 class="text-3xl font-bold text-gray-800">${dev.full_name}</h1>
                <p class="text-indigo-600 font-semibold mt-1">${dev.expertise}</p>
                <p class="text-gray-500 mt-1">${dev.location || "Unknown location"}</p>
                <p class="mt-4 text-gray-600">${dev.bio || "This developer has not added a bio yet."}</p>
                <p class="mt-3 text-gray-700"><strong>Experience:</strong> ${dev.experience || 0} years</p>
                <p class="mt-1 text-gray-700"><strong>Hourly Rate:</strong> $${dev.hourly_rate || 0}/hr</p>
            </div>
        </div>

        <div class="mt-6">
            <button onclick="hireDeveloper(${dev.id})"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg shadow-md transition">
                Hire Developer
            </button>
        </div>
    `;
}

// Hire developer API call
async function hireDeveloper(devId) {
    try {
        const res = await fetch(`http://localhost:5000/api/hire`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ developer_id: devId, client_id: 1 }) // TODO: Use logged-in user ID
        });

        if (!res.ok) throw new Error("Failed to send hire request");

        const data = await res.json();
        showMessage("Hire request sent successfully!", "success");
        console.log("Hire Request Response:", data);
    } catch (err) {
        console.error(err);
        showMessage("Failed to send hire request.", "error");
    }
}

// Load profile on page load
fetchDeveloperProfile();