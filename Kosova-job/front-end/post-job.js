 
    document.addEventListener("DOMContentLoaded", () => {
      const jobForm = document.getElementById("job-form");
      const jobListContainer = document.getElementById("job-listings");
      const deleteModal = document.getElementById("delete-modal"); // plain modal div
const cancelDeleteBtn = document.getElementById("cancel-delete"); // Cancel button inside modal

      const confirmDeleteBtn = document.getElementById("confirm-delete");

      let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
      let editIndex = null;
      let deleteIndex = null;

//cancel modal
          cancelDeleteBtn.addEventListener("click", () => {
  deleteIndex = null;
  deleteModal.classList.add("hidden"); // Hide modal
});


      // Render Jobs
function renderJobs() {
  jobListContainer.innerHTML = jobs.map((job, index) => `
    <div class="card card-side bg-base-100 shadow-lg fade-in p-4 items-center space-x-4 rounded-lg">
      <img src="${job.logo || 'https://via.placeholder.com/50'}" alt="${job.company} Logo" class="job-logo-tiny">
      <div class="flex-1">
        <h2 class="card-title text-lg font-bold">${job.title}</h2>
        <p><strong>Company:</strong> ${job.company}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Type:</strong> ${job.type}</p>
        <p><strong>Category:</strong> ${job.category}</p>
        <p><strong>Details:</strong> ${job.details}</p>

        <div class="flex space-x-2 mt-4">
          <button 
            class="btn btn-sm rounded-lg text-white px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 shadow-md hover:scale-105 hover:shadow-lg transition-transform edit-btn" 
            data-index="${index}">
            Edit
          </button>
          <button 
            class="btn btn-sm rounded-lg text-white px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 shadow-md hover:scale-105 hover:shadow-lg transition-transform delete-btn" 
            data-index="${index}">
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}





      // Initial render
      renderJobs();

      // Post or Edit Job
      jobForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const job = {
           id: Date.now(),
          title: document.getElementById("job-title").value,
          company: document.getElementById("job-company").value,
          location: document.getElementById("job-location").value,
          type: document.getElementById("job-type").value,
          category: document.getElementById("job-category").value,
          logo: document.getElementById("job-logo").value,
          details: document.getElementById("job-details").value,
            requirements: document.getElementById("job-requirements").value,



          date: "Just now"
        };

        if (editIndex !== null) {
          jobs[editIndex] = job;
          editIndex = null;
        } else {
          jobs.push(job);
        }

        localStorage.setItem("jobs", JSON.stringify(jobs));
        renderJobs();
        jobForm.reset();

        // Save to server as fallback
        // Save to server as fallback
fetch("http://localhost:4000/api/jobs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(job)
})
.then(res => res.json())
.then(data => console.log("Job synced to server:", data))
.catch(err => console.warn("Server not reachable, saved only in localStorage", err));




      });

      // Edit & Delete buttons
      jobListContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-btn")) {
          editIndex = e.target.dataset.index;
          const job = jobs[editIndex];
          document.getElementById("job-title").value = job.title;
          document.getElementById("job-company").value = job.company;
          document.getElementById("job-location").value = job.location;
          document.getElementById("job-type").value = job.type;
          document.getElementById("job-category").value = job.category;
          document.getElementById("job-logo").value = job.logo;
           document.getElementById("job-description").value = job.description || "";
      document.getElementById("job-requirements").value = job.requirements || "";
        }

if (e.target.classList.contains("delete-btn")) {
  deleteIndex = e.target.dataset.index;
  deleteModal.classList.remove("hidden"); // ✅ Show modal
}


      });

      // Confirm delete
      confirmDeleteBtn.addEventListener("click", () => {
        if (deleteIndex !== null) {
          jobs.splice(deleteIndex, 1);
          localStorage.setItem("jobs", JSON.stringify(jobs));
          renderJobs();
          deleteIndex = null;
         deleteModal.classList.add("hidden"); // ✅ Hide modal

         // Delete on server as fallback
fetch(`http://localhost:4000/api/jobs/${jobs[deleteIndex].id}`, {
  method: "DELETE"
})
.then(res => res.json())
.then(data => console.log("Job deleted on server:", data))
.catch(err => console.warn("Server not reachable, deleted only in localStorage", err));



        }
      });
    });


