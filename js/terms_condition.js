document.addEventListener('DOMContentLoaded', function () {

  // ===== TOC SCROLLSPY (sidebar + pills) =====
  const sections = document.querySelectorAll('.policy-section');
  const tocLinks = document.querySelectorAll('.toc-link');
  const tocPills = document.querySelectorAll('.toc-pill');

  function setActiveLink(id) {
    tocLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === id);
    });
    tocPills.forEach(pill => {
      const isActive = pill.getAttribute('href') === '#' + id;
      pill.classList.toggle('active', isActive);
      if (isActive) {
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));

  // ===== SMOOTH SCROLL FOR ALL TOC LINKS =====
  document.querySelectorAll('.toc-link, .toc-pill').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ===== CONTACT FORM SUBMISSION =====
  const termsForm = document.getElementById('termsContactForm');
  if (termsForm) {
    termsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const successBox = document.getElementById('cfSuccess');
      termsForm.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);
      termsForm.querySelector('.cf-submit').style.display = 'none';
      if (successBox) successBox.style.display = 'block';
    });
  }

});