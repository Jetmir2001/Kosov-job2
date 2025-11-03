// ================================
// AGENCY.JS - FULLY REFACTORED VERSION
// ================================
document.addEventListener("DOMContentLoaded", () => {

  // ------------------------------
  // 1. AUTH CHECK
  // ------------------------------
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // ------------------------------
  // 2. DOM ELEMENTS
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
  let jobs = [];

  // ------------------------------
  // 3. LOAD JOBS FROM BACKEND / LOCALSTORAGE
  // ------------------------------
  async function loadJobs() {
    try {
      const res = await fetch("http://localhost:4000/api/jobs");
      const serverJobs = await res.json();

      if (Array.isArray(serverJobs) && serverJobs.length > 0) {
        jobs = serverJobs;
        localStorage.setItem("jobs", JSON.stringify(jobs));
      } else {
        const storedJobs = JSON.parse(localStorage.getItem("jobs")) || [];
        jobs = storedJobs.length ? storedJobs : getDefaultJobs();
      }
    } catch (err) {
      console.warn("Server not reachable, using localStorage jobs", err);
      const storedJobs = JSON.parse(localStorage.getItem("jobs")) || [];
      jobs = storedJobs.length ? storedJobs : getDefaultJobs();
    }

    renderJobs(jobs);
  }

  function getDefaultJobs() {
    const defaultJobs = [
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
    ];
    localStorage.setItem("jobs", JSON.stringify(defaultJobs));
    return defaultJobs;
  }

  // ------------------------------
  // 4. RENDER JOBS
  // ------------------------------
  function renderJobs(jobData) {
    jobListContainer.innerHTML = "";
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

    if (jobData.length === 0) {
      noResults.style.display = "block";
      return;
    }
    noResults.style.display = "none";

    jobData.forEach((job, index) => {
      const isBookmarked = bookmarks.some(b => b.title === job.title && b.company === job.company);

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
        <button class="bookmark-btn ${isBookmarked ? "active" : ""}" data-index="${index}" title="Save Job">🔖</button>
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

    // Bookmark event listeners
    document.querySelectorAll(".bookmark-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.dataset.index;
        toggleBookmark(jobData[idx], e.target);
      });
    });
  }

  // ------------------------------
  // 5. TOGGLE BOOKMARK
  // ------------------------------
  function toggleBookmark(job, button) {
    if (!loggedInUser) {
      alert("Please log in to save jobs.");
      window.location.href = "signup.html";
      return;
    }

    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    const index = bookmarks.findIndex(b => b.title === job.title && b.company === job.company);

    if (index === -1) {
      bookmarks.push(job);
      button.classList.add("active");
    } else {
      bookmarks.splice(index, 1);
      button.classList.remove("active");
    }
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  // ------------------------------
  // 6. FILTER JOBS
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
  // 7. USER ACCOUNT DROPDOWN
  // ------------------------------
  const accountIcon = document.getElementById("account-icon");
  const accountCard = document.getElementById("account-card");

  if (accountIcon && accountCard && loggedInUser) {
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
  // 8. RESPONSIVE NAVBAR
  // ------------------------------
  const hamburger = document.getElementById("hamburger");
  const navbar = document.getElementById("navbar");
  hamburger?.addEventListener("click", () => {
    navbar.classList.toggle("show");
  });

  // ------------------------------
  // 9. INITIAL LOAD
  // ------------------------------
  loadJobs();
});








