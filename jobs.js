const API_URL = "http://localhost:5000/api/jobs";
const jobForm = document.getElementById("jobForm");
const jobsList = document.getElementById("jobsList");
const messageBox = document.getElementById("messageBox");

const user = JSON.parse(localStorage.getItem("devhub_user")) || null;

// Show success/error messages
function showMessage(msg, type = "success") {
    messageBox.textContent = msg;
    messageBox.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white ${
        type === "success" ? "bg-green-600" : "bg-red-600"
    }`;
    messageBox.classList.remove("hidden");
    setTimeout(() => messageBox.classList.add("hidden"), 3000);
}

// Fetch all jobs from backend
async function fetchJobs() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch jobs");

        const jobs = await res.json();
        displayJobs(jobs);
    } catch (err) {
        console.error(err);
        jobsList.innerHTML = `<p class="text-red-500">Failed to load jobs.</p>`;
    }
}

// Display jobs in the UI
function displayJobs(jobs) {
    jobsList.innerHTML = jobs.length
        ? jobs.map(job => `
            <div class="p-5 border border-gray-300 rounded-lg shadow-sm bg-gray-50">
                <h3 class="text-xl font-semibold text-gray-800">${job.title}</h3>
                <p class="text-gray-600">${job.description}</p>
                <p class="text-indigo-600 font-semibold mt-2">Budget: $${job.budget}</p>
                <p class="text-gray-500">Posted on: ${new Date(job.created_at).toLocaleDateString()}</p>
                <div class="mt-4 flex space-x-4">
                    <button onclick="applyForJob(${job.id})" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Apply</button>
                    <button onclick="assignDeveloper(${job.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Assign Developer</button>
                </div>
            </div>
        `).join("")
        : `<p class="text-gray-500">No jobs available.</p>`;
}

// Submit new job
jobForm.addEventListener("submit", async e => {
    e.preventDefault();

    //  Get the logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem("devhub_user"));

    //  Check if user is logged in
    if (!user || !user.id) {
        showMessage("You must be logged in to post a job.", "error");
        return;
    }

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const budget = document.getElementById("budget").value;
    const deadline = document.getElementById("deadline")?.value || null;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                description,
                budget,
                client_id: user.id            
            })
        });

        if (!res.ok) throw new Error("Failed to post job");

        showMessage("Job posted successfully!", "success");
        jobForm.reset();
        fetchJobs();
    } catch (err) {
        console.error(err);
        showMessage("Failed to post job.", "error");
    }
});

// Apply for a job
async function applyForJob(jobId) {
    try {
        const user = JSON.parse(localStorage.getItem("devhub_user"));
        if (!user || user.role !== "developer") {
            return showMessage("You must be logged in as a developer to apply.", "error");
        }

        const res = await fetch(`${API_URL}/${jobId}/apply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ developer_id: user.id }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showMessage("Application sent successfully!", "success");
    } catch (err) {
        console.error(err);
        showMessage("Failed to apply for job.", "error");
    }
}

// Assign a developer manually
async function assignDeveloper(jobId) {
    try {
        const developerId = prompt("Enter developer ID:");
        if (!developerId) return;

        const res = await fetch(`${API_URL}/${jobId}/assign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ developer_id: developerId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showMessage("Developer assigned successfully!", "success");
        fetchJobs();
    } catch (err) {
        console.error(err);
        showMessage("Failed to assign developer.", "error");
    }
}

// Load jobs on page load
fetchJobs();