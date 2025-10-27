 // employer-dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  const jobList = document.getElementById("job-list");
  const totalJobs = document.getElementById("total-jobs");
  const totalApplicants = document.getElementById("total-applicants");
  const logoutBtn = document.getElementById("logout-btn");

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser || loggedInUser.role !== "employer") {
    alert("Access denied — employers only.");
    window.location.href = "signup.html";
    return;
  }

  // ---------- Helpers ----------
  function saveJobs(jobs) {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }

  function getJobs() {
    return JSON.parse(localStorage.getItem("jobs")) || [];
  }

  function ensureJobIds() {
    let jobs = getJobs();
    let changed = false;
    jobs = jobs.map(job => {
      if (!job.id) {
        job.id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
        changed = true;
      }
      // keep postedBy if already present; do not overwrite if different employer
      if (!job.postedBy && loggedInUser && loggedInUser.email) {
        job.postedBy = loggedInUser.email; // best-effort for legacy jobs
        changed = true;
      }
      return job;
    });
    if (changed) saveJobs(jobs);
    return jobs;
  }

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getApplications() {
    return JSON.parse(localStorage.getItem("applications")) || [];
  }

  // ---------- Render & Stats ----------
  function loadAndRender() {
    ensureJobIds();
    const jobs = getJobs();
    // show only jobs posted by logged in employer
    const employerJobs = jobs.filter(j => j.postedBy === loggedInUser.email);

    totalJobs.textContent = employerJobs.length;

    // count applicants for employer's jobs
    const applications = getApplications();
    const applicantCount = applications.reduce((sum, app) => {
      // match by jobId OR jobIndex OR fallback by title/company if present
      const jobIdMatch = app.jobId && employerJobs.some(j => j.id === app.jobId);
      let jobIndexMatch = false;
      if (app.jobIndex != null) {
        // In older apps jobIndex may refer to index in global jobs array.
        const index = Number(app.jobIndex);
        if (!Number.isNaN(index) && jobs[index]) {
          const job = jobs[index];
          if (job.postedBy === loggedInUser.email) jobIndexMatch = true;
        }
      }
      const jobTitleCompanyMatch = app.jobTitle && app.jobCompany && employerJobs.some(j => j.title === app.jobTitle && j.company === app.jobCompany);
      return sum + (jobIdMatch || jobIndexMatch || jobTitleCompanyMatch ? 1 : 0);
    }, 0);

    totalApplicants.textContent = applicantCount;

    // render job cards
    jobList.innerHTML = employerJobs.map(job => `
      <div class="job-card" data-id="${job.id}">
        <h3>${escapeHtml(job.title)}</h3>
        <p><strong>Company:</strong> ${escapeHtml(job.company)}</p>
        <p><strong>Location:</strong> ${escapeHtml(job.location || "")}</p>
        <p><strong>Type:</strong> ${escapeHtml(job.type || "")}</p>
        <p><strong>Posted:</strong> ${escapeHtml(job.date || "")}</p>

        <div class="job-actions">
          <button class="manage-btn">Manage ▾</button>
          <div class="manage-menu hidden">
            <button class="edit-btn">✏️ Edit</button>
            <button class="delete-btn">🗑️ Delete</button>
            <button class="view-applicants-btn">👥 View Applicants</button>
          </div>
        </div>
      </div>
    `).join("");

    attachHandlers();
  }

  // ---------- Event handling ----------
  function attachHandlers() {
    // manage menu toggles (event delegation via jobList)
    jobList.querySelectorAll(".manage-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        closeAllManageMenus(menu);
        menu.classList.toggle("hidden");
      };
    });

    // delegation for edit / delete / view applicants
    jobList.onclick = (e) => {
      const btn = e.target;
      const card = btn.closest(".job-card");
      if (!card) return;
      const jobId = card.dataset.id;
      if (btn.classList.contains("delete-btn")) {
        handleDelete(jobId);
      } else if (btn.classList.contains("edit-btn")) {
        openEditModal(jobId);
      } else if (btn.classList.contains("view-applicants-btn")) {
        openApplicantsModal(jobId);
      }
    };

    // close menus when clicking outside
    document.addEventListener("click", () => {
      closeAllManageMenus();
    });

    // logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (ev) => {
        // if it's an <a>, prevent navigation first
        ev.preventDefault && ev.preventDefault();
        localStorage.removeItem("loggedInUser");
        window.location.href = "signup.html";
      });
    }
  }

  function closeAllManageMenus(except = null) {
    document.querySelectorAll(".manage-menu").forEach(m => {
      if (m !== except) m.classList.add("hidden");
    });
  }

  // ---------- Delete ----------
  function handleDelete(jobId) {
    if (!confirm("Delete this job? This will also remove associated applications.")) return;
    let jobs = getJobs();
    jobs = jobs.filter(j => j.id !== jobId);
    saveJobs(jobs);

    // remove applications for this job
    let apps = getApplications();
    apps = apps.filter(a => {
      if (a.jobId && a.jobId === jobId) return false;
      // also consider legacy jobIndex mapping: remove if jobIndex refers to this job index in old data
      if (a.jobIndex != null) {
        const idx = Number(a.jobIndex);
        const allJobs = getJobs(); // updated
        if (!Number.isNaN(idx) && allJobs[idx] && allJobs[idx].id === jobId) return false;
      }
      // fallback: if app stored title/company, remove matching ones
      if (a.jobTitle && a.jobCompany) {
        const job = jobs.find(j => j.id === jobId);
        if (job && job.title === a.jobTitle && job.company === a.jobCompany) return false;
      }
      return true;
    });
    localStorage.setItem("applications", JSON.stringify(apps));

    loadAndRender();
  }

  // ---------- Edit (Modal) ----------
  function openEditModal(jobId) {
    const jobs = getJobs();
    const job = jobs.find(j => j.id === jobId);
    if (!job) return alert("Job not found.");

    const modalHtml = `
      <div class="modal">
        <div class="modal-content">
          <button class="modal-close" aria-label="Close">&times;</button>
          <h3>Edit Job</h3>
          <form id="edit-job-form">
            <label>Title<input type="text" name="title" required value="${escapeHtml(job.title)}"></label>
            <label>Company<input type="text" name="company" required value="${escapeHtml(job.company)}"></label>
            <label>Location<input type="text" name="location" value="${escapeHtml(job.location || "")}"></label>

            <label>Category
              <select name="category">
                <option ${job.category === "IT" ? "selected" : ""}>IT</option>
                <option ${job.category === "Hospitality" ? "selected" : ""}>Hospitality</option>
                <option ${job.category === "HR" ? "selected" : ""}>HR</option>
                <option ${job.category === "Finance" ? "selected" : ""}>Finance</option>
                <option ${job.category === "Content" ? "selected" : ""}>Content</option>
                <option ${job.category === "Management" ? "selected" : ""}>Management</option>
                <option ${job.category === "Sales" ? "selected" : ""}>Sales</option>
                <option ${job.category === "Design" ? "selected" : ""}>Design</option>
              </select>
            </label>

            <label>Type
              <select name="type">
                <option ${job.type === "Remote" ? "selected" : ""}>Remote</option>
                <option ${job.type === "Full-time" ? "selected" : ""}>Full-time</option>
                <option ${job.type === "Part-time" ? "selected" : ""}>Part-time</option>
                <option ${job.type === "Contract" ? "selected" : ""}>Contract</option>
                <option ${job.type === "Hybrid" ? "selected" : ""}>Hybrid</option>
                <option ${job.type === "On-site" ? "selected" : ""}>On-site</option>
              </select>
            </label>

            <label>Experience
              <select name="experience">
                <option ${job.experience === "Entry" ? "selected" : ""}>Entry</option>
                <option ${job.experience === "1-2 years" ? "selected" : ""}>1-2 years</option>
                <option ${job.experience === "2-3 years" ? "selected" : ""}>2-3 years</option>
                <option ${job.experience === "3+ years" ? "selected" : ""}>3+ years</option>
              </select>
            </label>

            <label>Description<textarea name="description" rows="5">${escapeHtml(job.description || "")}</textarea></label>

            <div style="display:flex;gap:8px;margin-top:12px;">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    openModal(modalHtml);

    // form handling
    const form = document.getElementById("edit-job-form");
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const formData = new FormData(form);
      const updated = {
        ...job,
        title: formData.get("title").trim(),
        company: formData.get("company").trim(),
        location: formData.get("location").trim(),
        category: formData.get("category"),
        type: formData.get("type"),
        experience: formData.get("experience"),
        description: formData.get("description").trim(),
        updatedAt: new Date().toISOString()
      };

      // persist
      let jobsAll = getJobs();
      jobsAll = jobsAll.map(j => j.id === jobId ? updated : j);
      saveJobs(jobsAll);
      closeModal();
      loadAndRender();
    });

    // cancel handler
    document.querySelector(".cancel-btn").addEventListener("click", () => {
      closeModal();
    });
  }

  // ---------- View Applicants (Modal) ----------
  function openApplicantsModal(jobId) {
    const jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    const job = jobs[jobIndex];
    if (!job) return alert("Job not found.");

    const apps = getApplications().filter(a => {
      if (a.jobId && a.jobId === jobId) return true;
      if (a.jobIndex != null && Number(a.jobIndex) === jobIndex) return true;
      if (a.jobTitle && a.jobCompany && a.jobTitle === job.title && a.jobCompany === job.company) return true;
      return false;
    });

    const listHtml = apps.length ? apps.map(a => `
      <li>
        <strong>${escapeHtml(a.name || a.applicantName || "Unnamed")}</strong>
        <div>${escapeHtml(a.email || a.applicantEmail || "")}</div>
        <div>CV: ${escapeHtml(a.cvName || a.cv || "—")}</div>
        <div>Cover: ${escapeHtml(a.coverLetter || a.cover || "")}</div>
        <div style="font-size:.8rem;color:#666">${escapeHtml(a.date || a.submittedAt || "")}</div>
      </li>
    `).join("") : `<li>No applicants yet.</li>`;

    const modalHtml = `
      <div class="modal">
        <div class="modal-content">
          <button class="modal-close" aria-label="Close">&times;</button>
          <h3>Applicants for "${escapeHtml(job.title)}"</h3>
          <ul style="margin-top:12px;gap:10px">${listHtml}</ul>
          <div style="text-align:right;margin-top:12px;"><button class="close-btn">Close</button></div>
        </div>
      </div>
    `;

    openModal(modalHtml);
    document.querySelector(".close-btn").addEventListener("click", closeModal);
  }

  // ---------- Modal utilities ----------
  function openModal(html) {
    // create overlay
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // close handlers
    overlay.querySelectorAll(".modal-close").forEach(btn => btn.addEventListener("click", closeModal));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  function closeModal() {
    document.querySelectorAll(".modal-overlay").forEach(n => n.remove());
  }

  // ---------- Init ----------
  loadAndRender();
});
