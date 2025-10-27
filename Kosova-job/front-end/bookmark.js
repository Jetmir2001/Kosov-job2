  document.addEventListener("DOMContentLoaded", () => {
  const bookmarkList = document.getElementById("bookmark-list");
  const noBookmarks = document.getElementById("no-bookmarks");

  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  function renderBookmarks() {
    if (bookmarks.length === 0) {
      noBookmarks.classList.remove("hidden");
      bookmarkList.innerHTML = "";
      return;
    }
    noBookmarks.classList.add("hidden");

    bookmarkList.innerHTML = bookmarks.map((job, index) => `
      <div class="job-card">
        <img src="${job.logo}" alt="${job.company} Logo" class="job-logo">
        <h3 class="font-bold">${job.title}</h3>
        <p><strong>Company:</strong> ${job.company}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Type:</strong> ${job.type}</p>
        <p><strong>Date:</strong> ${job.date}</p>
        <button class="remove-btn" data-index="${index}">Remove</button>
      </div>
    `).join("");

    // Attach remove listeners
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.dataset.index;
        bookmarks.splice(idx, 1);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        renderBookmarks();
      });
    });
  }

  renderBookmarks();
});
