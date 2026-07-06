/* Nav js*/

document.addEventListener('DOMContentLoaded', () => {

  
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    
    const mobileOnlyItems = navLinks.querySelectorAll('.mobile-only');
    if (mobileOnlyItems.length === 0) {
      const signInLi = document.createElement('li');
      signInLi.className = 'mobile-only';
      signInLi.innerHTML = '<a href="login.html" class="nav-btn-signin">Sign In</a>';

      const bookLi = document.createElement('li');
      bookLi.className = 'mobile-only';
      bookLi.innerHTML = '<a href="booking.html" class="nav-btn-book">Book a Ride</a>';

      navLinks.appendChild(signInLi);
      navLinks.appendChild(bookLi);
    }

  
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });

   
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      })
    );

   
    document.addEventListener('click', e => {
      if (navbar && !navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });
  }

});


/* TOC scrollspy + Contact form js */

document.addEventListener('DOMContentLoaded', function () {

  /* TOC SCROLLSPY */
  const sections = document.querySelectorAll('.policy-section');
  const tocLinks = document.querySelectorAll('.toc-link');
  const tocPills = document.querySelectorAll('.toc-pill');
  const pillsNav = document.querySelector('.toc-pills');

 
  let isUserScrolling = false;
  let pillScrollTimer = null;

  function setActiveLink(id) {
    tocLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === id);
    });
    tocPills.forEach(pill => {
      const isActive = pill.getAttribute('href') === '#' + id;
      pill.classList.toggle('active', isActive);
    
      if (isActive && pillsNav && !isUserScrolling) {
        clearTimeout(pillScrollTimer);
        pillScrollTimer = setTimeout(() => {
          pill.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        }, 150);
      }
    });
  }

 
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

  /*  SMOOTH SCROLL  */
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

  /* CONTACT FORM */
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