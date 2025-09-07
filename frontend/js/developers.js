const API_URL = "https://devhub-1-yefd.onrender.com";
const developersList = document.getElementById("developersList");
const searchInput = document.getElementById("searchInput");

// Fetch all developers
async function fetchDevelopers(query = "") {
    try {
        let url = API_URL;
        if (query) {
            url += `/search?q=${encodeURIComponent(query)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        displayDevelopers(data);
    } catch (err) {
        console.error("Error fetching developers:", err);
        developersList.innerHTML = `<p class="text-red-500">Failed to load developers.</p>`;
    }
}

// Display developers on UI
function displayDevelopers(developers) {
    developersList.innerHTML = "";

    if (developers.length === 0) {
        developersList.innerHTML = `<p class="text-gray-500 col-span-full">No developers found.</p>`;
        return;
    }

    developers.forEach(dev => {
        const card = document.createElement("div");
        card.className = "bg-white shadow-md rounded-xl p-6 border border-gray-200 transition hover:shadow-lg";

        card.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-xl font-semibold text-gray-800">${dev.full_name}</h3>
                <span class="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded">${dev.expertise}</span>
            </div>
            <p class="text-gray-600 mb-3">${dev.bio ? dev.bio : "No bio available."}</p>
            <div class="flex justify-between items-center mt-4">
                <span class="text-indigo-600 font-semibold">$${dev.hourly_rate || 0}/hr</span>
                <button onclick="viewProfile(${dev.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg">
                    View Profile
                </button>
            </div>
        `;

        developersList.appendChild(card);
    });
}

// View developer profile
function viewProfile(devId) {
    window.location.href = `developer-profile.html?id=${devId}`;
}

// Search developers in real-time
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    fetchDevelopers(query);
});

// Load all developers on page load
fetchDevelopers();
