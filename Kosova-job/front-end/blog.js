 document.addEventListener("DOMContentLoaded", () => {
  const blogList = document.getElementById("blog-list");
  const template = document.getElementById("blog-card-template");
  const categoryButtons = document.querySelectorAll(".category-btn");

  const blogs = [
    {
      title: "5 Tips to Ace Your Job Interview",
      description: "Master your interview with these 5 practical tips from career experts. Always research the company, practice common questions, and stay confident. Dressing appropriately and following up after the interview can make a huge difference. Also, remember to ask thoughtful questions to show your interest.",
      image: "interview.jpg",
      category: "interview"
    },
    {
      title: "How to Build a Resume That Stands Out",
      description: "Learn the secrets to creating a resume that grabs recruiters' attention. Highlight your achievements, use action verbs, and keep it concise. Tailor your resume to each job, and ensure formatting is clean. Remember to include relevant skills and certifications.",
      image: "resss.jpg",
      category: "resume"
    },
    {
      title: "Top Emerging Careers in 2025",
      description: "Explore the hottest jobs in tech, finance, and healthcare this year. From AI engineers to sustainability consultants, knowing trends early helps you make informed career decisions. Upskilling in high-demand areas is crucial for success.",
      image: "crrr.jpg",
      category: "career"
    },
    {
      title: "Finding the Right Job in Your City",
      description: "A guide to locating and applying for the best opportunities near you. Use online platforms, network with professionals, and attend local career fairs. Customize your applications and stay organized to increase your chances.",
      image: "ccc.jpg",
      category: "jobs"
    }
  ];

  function renderBlogs(filter = "all") {
    blogList.innerHTML = "";
    const filtered = filter === "all" ? blogs : blogs.filter(b => b.category === filter);

    filtered.forEach(blog => {
      const clone = template.content.cloneNode(true);
      clone.querySelector("img").src = blog.image;
      clone.querySelector(".card-title").textContent = blog.title;

      const descEl = clone.querySelector(".blog-desc");
      const fullText = blog.description;
      const shortText = fullText.substring(0, 120) + "...";
      descEl.textContent = shortText;
      descEl.style.maxHeight = "4rem"; // 4 lines height

      const btn = clone.querySelector(".read-more-btn");
      let expanded = false;
      btn.addEventListener("click", () => {
        if (!expanded) {
          descEl.textContent = fullText;
          descEl.style.maxHeight = "500px";
          btn.textContent = "Read Less";
        } else {
          descEl.textContent = shortText;
          descEl.style.maxHeight = "4rem";
          btn.textContent = "Read More";
        }
        expanded = !expanded;
      });

      blogList.appendChild(clone);
    });
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderBlogs(btn.dataset.category);
    });
  });

  renderBlogs();
});
