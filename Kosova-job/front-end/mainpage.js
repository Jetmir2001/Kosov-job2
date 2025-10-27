 // ===== Counters =====
const counters = document.querySelectorAll('.counter');
counters.forEach(counter => {
  const updateCount = () => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText;
    const increment = target / 200;

    if(count < target){
      counter.innerText = Math.ceil(count + increment);
      setTimeout(updateCount, 10);
    } else {
      counter.innerText = target;
    }
  }
  updateCount();
});

// ===== Blog Accordion =====
document.addEventListener('DOMContentLoaded', () => {
  const toggleButtons = document.querySelectorAll('.toggle-btn');

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const post = btn.closest('.blog-post');
      const content = post.querySelector('.blog-content');

      if(post.classList.contains('active')){
        content.style.maxHeight = null;
        post.classList.remove('active');
        btn.textContent = '+';
      } else {
        document.querySelectorAll('.blog-post.active').forEach(activePost => {
          activePost.querySelector('.blog-content').style.maxHeight = null;
          activePost.classList.remove('active');
          activePost.querySelector('.toggle-btn').textContent = '+';
        });

        content.style.maxHeight = content.scrollHeight + 'px';
        post.classList.add('active');
        btn.textContent = '−';
      }
    });
  });
});

// ===== Job Apply Navigation =====
document.addEventListener("DOMContentLoaded", () => {
  // Create the observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          // Remove "visible" if you want the animation to repeat
          entry.target.classList.remove("visible");
        }
      });
    },
    {
      threshold: 0.2, // 20% visible
    }
  );

  // Observe all elements with .scroll-animate class
  const elements = document.querySelectorAll(".scroll-animate");
  elements.forEach((el) => observer.observe(el));
});


// Select all elements with the scroll-animate class
const scrollElements = document.querySelectorAll(".scroll-animate");

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1
};

const scrollObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Add animation class
      entry.target.classList.add(entry.target.dataset.animation || "animate-fade-slide-up");
    } else {
      // Remove animation class when out of view (so it replays on scroll back)
      entry.target.classList.remove(entry.target.dataset.animation || "animate-fade-slide-up");
    }
  });
}, observerOptions);

// Observe each scroll element
scrollElements.forEach(el => scrollObserver.observe(el));
