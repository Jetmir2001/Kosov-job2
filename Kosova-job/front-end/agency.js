   // ================================
// AGENCY.JS - FULLY WORKING VERSION
// ================================
document.addEventListener("DOMContentLoaded", () => {

  // ------------------------------
  // 1. AUTH CHECK
  // ------------------------------
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    window.location.href = "signup.html";
    return;
  }

  // ------------------------------
  // 2. JOB SEARCH & FILTER
  // ------------------------------
  const keywordInput = document.getElementById("search-keyword");
  const locationInput = document.getElementById("search-location");
  const typeSelect = document.getElementById("search-type");
  const experienceSelect = document.getElementById("search-experience");
  const searchBtn = document.getElementById("search-btn");
  const clearBtn = document.getElementById("clear-btn");
  const categoryButtons = document.querySelectorAll(".categories button");
  const jobListContainer = document.querySelector(".job-listings");
  const noResults = document.getElementById("no-results");

  let selectedCategory = "";
  let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

  //trying backend



// Try fetching from server as fallback
fetch("http://localhost:4000/api/jobs")
  .then(res => res.json())
  .then(serverJobs => {
    if (serverJobs.length) {
      jobs = serverJobs;
      localStorage.setItem("jobs", JSON.stringify(jobs));
      renderJobs(jobs);
    }
  })
  .catch(err => {
    console.warn("Server not reachable, using localStorage jobs", err);
    renderJobs(jobs);
  });


  // ------------------------------
  // 3. POPULATE DEFAULT JOBS IF NONE
  // ------------------------------
  if (jobs.length === 0) {
    jobs = [
      { title: "Frontend Developer", company: "TechNova", location: "Prishtinë", type: "Remote", category: "IT", date: "2 days ago", logo: "webdev.jpg" },
      { title: "Backend Developer", company: "CodeWorks", location: "Prizren", type: "Full-time", category: "IT", date: "1 week ago", logo: "be.jpg" },
      { title: "Team Member", company: "Burger King", location: "Gjakove", type: "Full-time", category: "Hospitality", date: "1 week ago", logo: "bg.jpg" },
      { title: "Waiter", company: "Troja", location: "Prishtine", type: "Full-time", category: "Hospitality", date: "1 week ago", logo: "restaurant.jpg" },
      { title: "Sales person", company: "CodeWorks", location: "Peja", type: "Full-time", category: "Sales", date: "1 week ago", logo: "hr.jpg" },
      { title: "Mechanic", company: "Auto repair", location: "Prishtine", type: "Full-time", category: "Content", date: "1 week ago", logo: "ash.jpg" },
      { title: "Construction", company: "BuiltA", location: "Gjilan", type: "Full-time", category: "Management", date: "1 week ago", logo: "csc.jpg" },
      { title: "Accountant", company: "AL Bank", location: "Ferizaj", type: "Full-time", category: "Finance", date: "1 week ago", logo: "bank.jpg" },
      { title: "Graphic designer", company: "GD", location: "Prishtine", type: "Full-time", category: "Design", date: "1 week ago", logo: "creat.jpg" },
      { title: "Cyber security", company: "CodeWorks", location: "Peja", type: "Full-time", category: "IT", date: "1 week ago", logo: "csl.jpg" },
    
     

      // Add more default jobs if needed
    ];
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }

  // ------------------------------
  // 4. RENDER JOBS FUNCTION
  // ------------------------------
function renderJobs(jobData) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

 jobListContainer.innerHTML = ""; // clear container

jobData.forEach((job, index) => {
  const isBookmarked = bookmarks.some(
    b => b.title === job.title && b.company === job.company
  );

  const card = document.createElement("div");
  card.classList.add("job-card", "fade-in");
  card.dataset.category = job.category;
  card.dataset.location = job.location;
  card.dataset.type = job.type;
  card.dataset.experience = job.experience || "";

  card.innerHTML = `
    <img src="${job.logo}" alt="${job.company} Logo" class="job-logo">
    <h3>${job.title}</h3>
    <p><strong>Company:</strong> ${job.company}</p>
    <p><strong>Location:</strong> ${job.location}</p>
    <p><strong>Type:</strong> ${job.type}</p>
    <p><strong>Date:</strong> ${job.date}</p>
    <button class="bookmark-btn ${isBookmarked ? "active" : ""}" 
            data-index="${index}" 
            title="Save Job">🔖</button>
  `;

  // Apply Now button
  const applyBtn = document.createElement("button");
  applyBtn.textContent = "Apply Now";
  applyBtn.classList.add("btn1");
  applyBtn.addEventListener("click", () => {
    sessionStorage.setItem("selectedJob", JSON.stringify(job));
    window.location.href = "detaje.html";
  });

  card.appendChild(applyBtn);
  jobListContainer.appendChild(card);
});



  // Attach bookmark listeners
  document.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      toggleBookmark(jobData[idx], e.target);
    });
  });
}

// ------------------------------
// Toggle bookmark function
function toggleBookmark(job, button) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  const index = bookmarks.findIndex(
    b => b.title === job.title && b.company === job.company
  );

  if (index === -1) {
    // Add bookmark
    bookmarks.push(job);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    button.classList.add("active");
  } else {
    // Remove bookmark
    bookmarks.splice(index, 1);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    button.classList.remove("active");
  }
}




  // Initial render
  renderJobs(jobs);

  // ------------------------------
  // 5. FILTER JOBS FUNCTION
  // ------------------------------
  function filterJobs() {
    const keyword = keywordInput.value.toLowerCase();
    const location = locationInput.value.toLowerCase();
    const type = typeSelect.value;
    const experience = experienceSelect.value;

    const filtered = jobs.filter(job => {
      const title = job.title.toLowerCase();
      const company = job.company.toLowerCase();
      const matchesKeyword = !keyword || title.includes(keyword) || company.includes(keyword);
      const matchesLocation = !location || job.location.toLowerCase().includes(location);
      const matchesCategory = !selectedCategory || job.category === selectedCategory;
      const matchesType = !type || job.type === type;
      const matchesExperience = !experience || (job.experience && job.experience === experience);

      return matchesKeyword && matchesLocation && matchesCategory && matchesType && matchesExperience;
    });

    renderJobs(filtered);
    noResults.style.display = filtered.length === 0 ? "block" : "none";
  }

  searchBtn?.addEventListener("click", filterJobs);

  clearBtn?.addEventListener("click", () => {
    keywordInput.value = "";
    locationInput.value = "";
    typeSelect.value = "";
    experienceSelect.value = "";
    selectedCategory = "";
    categoryButtons.forEach(btn => btn.classList.remove("active"));
    renderJobs(jobs);
    noResults.style.display = "none";
  });

  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.category;
      filterJobs();
    });
  });

  // ------------------------------
  // 6. JOB CARD NAVIGATION
  // ------------------------------
  window.goToJob = function(index) {
    window.location.href = `detaje.html?id=${index}`;
  };

  // ------------------------------
  // 7. USER ACCOUNT INFO (DROPDOWN)
  // ------------------------------
  const accountIcon = document.getElementById("account-icon");
  const accountCard = document.getElementById("account-card");

  if (accountIcon && accountCard) {
    document.getElementById("acc-name").textContent = loggedInUser.name;
    document.getElementById("acc-email").textContent = loggedInUser.email;
    document.getElementById("acc-role").textContent = loggedInUser.role;
    accountIcon.textContent = loggedInUser.name[0].toUpperCase();

    accountIcon.addEventListener("click", () => {
      accountCard.classList.toggle("show");
      accountCard.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!accountIcon.contains(e.target) && !accountCard.contains(e.target)) {
        accountCard.classList.add("hidden");
        accountCard.classList.remove("show");
      }
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "signup.html";
    });
  }

  // ------------------------------
  // 8. RESPONSIVE NAVBAR TOGGLE
  // ------------------------------
  const hamburger = document.getElementById("hamburger");
  const navbar = document.getElementById("navbar");

  hamburger?.addEventListener("click", () => {
    navbar.classList.toggle("show");
  });







});









