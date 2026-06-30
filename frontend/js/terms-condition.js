document.addEventListener('DOMContentLoaded', function () {

  /* ─── NAVBAR SCROLL ─── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── HAMBURGER MENU ─── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    })
  );

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  /* ─── TOC SCROLLSPY ─── */
  const sections = document.querySelectorAll('.policy-section');
  const tocLinks = document.querySelectorAll('.toc-link');
  const tocPills = document.querySelectorAll('.toc-pill');
  const pillsNav = document.querySelector('.toc-pills');

  // Flag to prevent scrollIntoView from fighting user scroll
  let isUserScrolling = false;
  let pillScrollTimer = null;

  function setActiveLink(id) {
    tocLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === id);
    });
    tocPills.forEach(pill => {
      const isActive = pill.getAttribute('href') === '#' + id;
      pill.classList.toggle('active', isActive);
      // Only scroll pill into view if user is NOT currently scrolling the page
      if (isActive && pillsNav && !isUserScrolling) {
        clearTimeout(pillScrollTimer);
        pillScrollTimer = setTimeout(() => {
          pill.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        }, 150);
      }
    });
  }

  // Track if user is scrolling to prevent pill scrollIntoView conflict
  window.addEventListener('scroll', () => {
    isUserScrolling = true;
    clearTimeout(pillScrollTimer);
    pillScrollTimer = setTimeout(() => {
      isUserScrolling = false;
    }, 200);
  }, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, { rootMargin: '-5% 0px -55% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));

  /* ─── SMOOTH SCROLL for TOC links ─── */
  document.querySelectorAll('.toc-link, .toc-pill').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        // Account for sticky toc-pills height on mobile
        const pillsHeight = pillsNav && window.innerWidth <= 1024
          ? pillsNav.getBoundingClientRect().height
          : 0;
        const offset = 16 + pillsHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─── CONTACT FORM ─── */
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