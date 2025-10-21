export function initUI() {

  // --- Theme Toggle ---
  const toggleBtn = document.getElementById("themeToggle");
  const body = document.body;

  if (toggleBtn && body) {
    // Set default dark mode and moon icon
    body.classList.remove("light-mode");
    toggleBtn.classList.remove("bi-brightness-high");
    toggleBtn.classList.add("bi-moon-stars");

    toggleBtn.addEventListener("click", () => {
      body.classList.toggle("light-mode");

      // Toggle icon
      if (body.classList.contains("light-mode")) {
        toggleBtn.classList.remove("bi-moon-stars");
        toggleBtn.classList.add("bi-brightness-high");
      } else {
        toggleBtn.classList.remove("bi-brightness-high");
        toggleBtn.classList.add("bi-moon-stars");
      }
    });
  }

  // --- "About Me" Resume Button Hover ---
  const resumeButton = document.querySelector(".resume-btn");
  const meText = document.querySelector(".me-text");

  if (resumeButton && meText) {
    resumeButton.addEventListener("mouseenter", function () {
      meText.style.color = "#008080"; // Change to teal on hover
    });

    resumeButton.addEventListener("mouseleave", function () {
      meText.style.color = "orange"; // Revert to default color
    });
  }

  // --- Navbar Scrollspy ---
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".Navbar2 .nav-link");

  if (sections.length && navLinks.length) {
    function activateNavLink() {
      let scrollPosition = window.scrollY + window.innerHeight * 0.3;
      // Adjusting offset to 30% of viewport height

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute("id");

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach((link) => {
            link.classList.remove("active"); // Remove active from all links
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active"); // Add active to the current section
            }
          });
        }
      });
    }
    window.addEventListener("scroll", activateNavLink);
    activateNavLink(); // Run once on load
  }

  // --- Scroll-to-Top Button ---
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) {
        scrollTopBtn.classList.add("show");
      } else {
        scrollTopBtn.classList.remove("show");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}