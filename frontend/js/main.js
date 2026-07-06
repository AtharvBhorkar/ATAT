/* ═══════════════════════════════════════════════════
   VOYAGO — main.js
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════════════════
     INJECT FLOATING BUTTON CSS (only once, always available)
  ══════════════════════════════════════════════════════════ */
  if (!document.getElementById('fabStylesInjected')) {
    const fabCSS = document.createElement('style');
    fabCSS.id = 'fabStylesInjected';
    fabCSS.textContent = `
      /* ── CONTAINER ── */
      .floating-btns {
        position: fixed;
        bottom: 28px;
        left: 0;
        right: 0;
        z-index: 9999;
        pointer-events: none;
        padding: 0 20px;
      }

      /* ── BUTTON BASE ── */
      .fab {
        pointer-events: all;
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        border-radius: 60px;
        padding: 14px 22px 14px 16px;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.03em;
        white-space: nowrap;
        cursor: pointer;
        border: none;
        box-shadow:
          0 6px 28px rgba(0, 0, 0, 0.25),
          0 2px 8px rgba(0, 0, 0, 0.15);
        transform: translateY(120px) scale(0.6);
        opacity: 0;
        transition:
          transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 0.4s ease,
          box-shadow 0.3s ease;
        will-change: transform, opacity;
      }

      .fab.visible {
        transform: translateY(0) scale(1);
        opacity: 1;
      }

      .fab:hover {
        transform: translateY(-4px) scale(1.05) !important;
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.35),
          0 4px 14px rgba(0, 0, 0, 0.2);
      }

      .fab:active {
        transform: translateY(-1px) scale(0.98) !important;
        transition-duration: 0.1s;
      }

      /* ── ICON CIRCLE ── */
      .fab-icon {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
        overflow: visible;   /* ← let the pulse ring show */
    }

      .fab-icon svg {
        width: 24px;
        height: 24px;
        position: relative;
        z-index: 2;
      }

      /* ── LABEL ── */
      .fab-label {
        position: relative;
        z-index: 2;
        line-height: 1.2;
      }
      .fab-sublabel {
        display: block;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.06em;
        opacity: 0.8;
        margin-top: 2px;
      }

      /* ══════════════════════════════════════
         WHATSAPP — LEFT SIDE
      ══════════════════════════════════════ */
      .fab-whatsapp {
        left: 20px;
        background: linear-gradient(135deg, #25D366 0%, #128C3E 100%);
        color: #fff;
      }

      .fab-whatsapp .fab-icon {
        background: rgba(255, 255, 255, 0.2);
        animation: whatsappPulse 2.5s ease-in-out infinite;
      }

      .fab-whatsapp:hover {
        background: linear-gradient(135deg, #2BE67A 0%, #0FA34A 100%);
      }

      .fab-whatsapp .fab-icon::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid rgba(37, 211, 102, 0.5);
        animation: fabRingPulse 2.5s ease-out infinite;
        z-index: 1;
      }

      @keyframes whatsappPulse {
        0%, 100% { transform: scale(1); }
        50%       { transform: scale(1.08); }
      }

      @keyframes fabRingPulse {
        0% {
          transform: scale(1);
          opacity: 0.7;
        }
        100% {
          transform: scale(1.6);
          opacity: 0;
        }
      }

      /* ══════════════════════════════════════
         CALL — RIGHT SIDE
      ══════════════════════════════════════ */
      .fab-call {
        right: 20px;
        background: linear-gradient(135deg, #6E1F2B 0%, #4d1520 100%);
        color: #fff;
      }

      .fab-call .fab-icon {
        background: rgba(217, 164, 65, 0.25);
        animation: callBounce 3s ease-in-out infinite;
      }

      .fab-call:hover {
        background: linear-gradient(135deg, #8a2535 0%, #6E1F2B 100%);
      }

      .fab-call .fab-icon::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid rgba(217, 164, 65, 0.4);
        animation: fabRingPulse 3s ease-out infinite 0.8s;
        z-index: 1;
      }

      @keyframes callBounce {
        0%, 100% { transform: scale(1) rotate(0deg); }
        15%  { transform: scale(1.1) rotate(-8deg); }
        30%  { transform: scale(1) rotate(0deg); }
        45%  { transform: scale(1.1) rotate(8deg); }
        60%  { transform: scale(1) rotate(0deg); }
      }

      /* ══════════════════════════════════════
         TOOLTIPS
      ══════════════════════════════════════ */
      .fab-tooltip {
        position: absolute;
        bottom: calc(100% + 12px);
        padding: 8px 14px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.25s ease, transform 0.25s ease;
        pointer-events: none;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      }

      .fab-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
      }

      .fab-whatsapp .fab-tooltip {
        left: 12px;
        background: #128C3E;
        color: #fff;
      }
      .fab-whatsapp .fab-tooltip::after {
        border-top-color: #128C3E;
      }

      .fab-call .fab-tooltip {
        right: 12px;
        background: #6E1F2B;
        color: #fff;
      }
      .fab-call .fab-tooltip::after {
        border-top-color: #6E1F2B;
      }

      .fab:hover .fab-tooltip {
        opacity: 1;
        transform: translateY(0);
      }

      /* ══════════════════════════════════════
         ENTRANCE ANIMATIONS
      ══════════════════════════════════════ */
      @keyframes fabSlideInLeft {
        0% {
          opacity: 0;
          transform: translateX(-40px) translateY(80px) scale(0.5);
        }
        100% {
          opacity: 1;
          transform: translateX(0) translateY(0) scale(1);
        }
      }

      @keyframes fabSlideInRight {
        0% {
          opacity: 0;
          transform: translateX(40px) translateY(80px) scale(0.5);
        }
        100% {
          opacity: 1;
          transform: translateX(0) translateY(0) scale(1);
        }
      }

      .fab-whatsapp.visible {
        animation: fabSlideInLeft 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
      }

      .fab-call.visible {
        animation: fabSlideInRight 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards !important;
      }

      /* ══════════════════════════════════════
         WIGGLE
      ══════════════════════════════════════ */
      @keyframes fabWiggle {
        0%   { transform: rotate(0deg); }
        15%  { transform: rotate(-8deg); }
        30%  { transform: rotate(6deg); }
        45%  { transform: rotate(-4deg); }
        60%  { transform: rotate(2deg); }
        75%  { transform: rotate(-1deg); }
        100% { transform: rotate(0deg); }
      }
      .fab-wiggle {
        animation: fabWiggle 0.7s ease-in-out !important;
      }

      /* ══════════════════════════════════════
         HIDE NEAR FOOTER
      ══════════════════════════════════════ */
      .fab.near-footer {
        opacity: 0 !important;
        transform: translateY(20px) scale(0.9) !important;
        pointer-events: none !important;
        transition: all 0.35s ease !important;
      }

      /* ══════════════════════════════════════
         RESPONSIVE — circle only on mobile
      ══════════════════════════════════════ */
      @media (max-width: 600px) {
        .fab-icon {
          width: 56px;
          height: 56px;
          overflow: visible;   /* ← add this here too */
        }
      }

        .fab {
          padding: 0;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          justify-content: center;
        }

        .fab-label {
          display: none;
        }

        .fab-icon {
          width: 56px;
          height: 56px;
        }

        .fab-tooltip {
          display: none;
        }

        .fab-whatsapp {
          left: 14px;
        }

        .fab-call {
          right: 14px;
        }
      }
    `;
    document.head.appendChild(fabCSS);
  }


  /* ══════════════════════════════════════════════════════════
     FLOATING BUTTONS LOGIC
  ══════════════════════════════════════════════════════════ */
  const fabWhatsapp = document.getElementById('fabWhatsapp');
  const fabCall     = document.getElementById('fabCall');
  const footer      = document.getElementById('siteFooter');

  /* Only run if the buttons exist in the HTML */
  if (fabWhatsapp || fabCall) {

    /* ── Show buttons after a delay ── */
    const FAB_SHOW_DELAY = 1800;

    setTimeout(() => {
      if (fabWhatsapp) fabWhatsapp.classList.add('visible');
      if (fabCall)     fabCall.classList.add('visible');
    }, FAB_SHOW_DELAY);


    /* ── Hide when footer is visible ── */
    if (footer) {
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const show = !entry.isIntersecting;
          if (fabWhatsapp) fabWhatsapp.classList.toggle('near-footer', !show);
          if (fabCall)     fabCall.classList.toggle('near-footer', !show);
        });
      }, { threshold: 0.15 });

      footerObserver.observe(footer);
    }


    /* ── Wiggle function ── */
    function addWiggle(el, delay) {
      setTimeout(() => {
        if (!el) return;
        el.style.animation = 'none';
        void el.offsetWidth; /* Force reflow */
        el.style.animation = '';
        el.classList.add('fab-wiggle');

        el.addEventListener('animationend', function handler() {
          el.classList.remove('fab-wiggle');
          el.removeEventListener('animationend', handler);
        });
      }, delay);
    }

    /* First wiggle after appearance */
    setTimeout(() => addWiggle(fabWhatsapp, 0), FAB_SHOW_DELAY + 3500);
    setTimeout(() => addWiggle(fabCall, 0),     FAB_SHOW_DELAY + 5000);

    /* Periodic re-wiggle */
    setInterval(() => addWiggle(fabWhatsapp, 0), 30000);
    setInterval(() => addWiggle(fabCall, 0),     35000);
  }


  /* ══════════════════════════════════════════════════════════
     ORIGINAL PAGE FUNCTIONALITY (unchanged)
  ══════════════════════════════════════════════════════════ */

  /* ─── NAVBAR SCROLL ─── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── HAMBURGER MENU ─── */
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


  /* ─── HERO PARALLAX ─── */
  const heroBg = document.getElementById('heroBg');
  if (heroBg) {
    const parallax = () => {
      const scrolled = window.scrollY;
      heroBg.style.transform = `translateY(${scrolled * 0.35}px)`;
    };
    window.addEventListener('scroll', parallax, { passive: true });
  }


  /* ─── SCROLL REVEAL ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-reveal]'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, idx * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));


  /* ─── COUNTER ANIMATION ─── */
  const counters = document.querySelectorAll(".count-up");

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = +counter.dataset.target;
      let count = 0;

      const duration = 2000;
      const increment = target / (duration / 16);

      function updateCounter() {
        count += increment;
        if (count < target) {
          counter.textContent = Math.floor(count).toLocaleString();
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString();
        }
      }

      updateCounter();
      counterObserver.unobserve(counter);
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));


  /* ─── PACKAGE TABS ─── */
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const pkgCards = document.querySelectorAll('.package-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-tab');
      pkgCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  /* ─── PACKAGES SLIDER (mobile) ─── */
  const slider     = document.getElementById('packagesGrid');
  const sliderDots = document.getElementById('sliderDots');
  const sliderPrev = document.getElementById('sliderPrev');
  const sliderNext = document.getElementById('sliderNext');

  let sliderIndex = 0;
  let sliderTotal = 0;

  const getVisibleCards = () => {
    if (!slider) return [];
    return Array.from(slider.querySelectorAll('.package-card:not(.hidden)'));
  };

  const getCardsPerView = () => {
    if (window.innerWidth < 700) return 1;
    if (window.innerWidth < 1100) return 2;
    return 3;
  };

  const updateSlider = () => {
    if (!slider) return;
    const cards = getVisibleCards();
    if (cards.length === 0) return;
    const perView = getCardsPerView();
    sliderTotal = Math.max(0, Math.ceil(cards.length / perView) - 1);
    sliderIndex = Math.min(sliderIndex, sliderTotal);

    if (window.innerWidth < 1100) {
      const cardW = cards[0].offsetWidth || 0;
      const gap = 28;
      slider.style.transform = `translateX(-${sliderIndex * (cardW + gap) * perView}px)`;
      slider.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    } else {
      slider.style.transform = '';
      slider.style.transition = '';
    }

    if (sliderDots) {
      sliderDots.innerHTML = '';
      for (let i = 0; i <= sliderTotal; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === sliderIndex ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => { sliderIndex = i; updateSlider(); });
        sliderDots.appendChild(dot);
      }
    }
  };

  if (sliderPrev) {
    sliderPrev.addEventListener('click', () => {
      sliderIndex = sliderIndex > 0 ? sliderIndex - 1 : sliderTotal;
      updateSlider();
    });
  }
  if (sliderNext) {
    sliderNext.addEventListener('click', () => {
      sliderIndex = sliderIndex < sliderTotal ? sliderIndex + 1 : 0;
      updateSlider();
    });
  }

  window.addEventListener('resize', () => {
    sliderIndex = 0;
    updateSlider();
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sliderIndex = 0;
      setTimeout(updateSlider, 50);
    });
  });

  updateSlider();


  /* ─── TESTIMONIALS CAROUSEL ─── */
  const track    = document.getElementById('testTrack');
  const tlPrev   = document.getElementById('tlPrev');
  const tlNext   = document.getElementById('tlNext');
  const tlDots   = document.getElementById('tlDots');
  const tCards   = document.querySelectorAll('.testimonial-card');

  let tlIndex = 0;

  const getTlPerView = () => window.innerWidth < 700 ? 1 : 2;

  const updateTestimonials = () => {
    if (!track || tCards.length === 0) return;
    const perView = getTlPerView();
    const total   = Math.ceil(tCards.length / perView) - 1;
    tlIndex       = Math.min(tlIndex, total);

    const cardW = tCards[0].offsetWidth || 0;
    const gap   = 28;
    track.style.transform  = `translateX(-${tlIndex * (cardW + gap) * perView}px)`;
    track.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';

    if (tlDots) {
      tlDots.innerHTML = '';
      for (let i = 0; i <= total; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === tlIndex ? ' active' : '');
        dot.setAttribute('aria-label', `Review ${i + 1}`);
        dot.addEventListener('click', () => { tlIndex = i; updateTestimonials(); resetTlAutoplay(); });
        tlDots.appendChild(dot);
      }
    }
  };

  let tlInterval = setInterval(() => {
    if (tCards.length === 0) return;
    const total = Math.ceil(tCards.length / getTlPerView()) - 1;
    tlIndex = tlIndex < total ? tlIndex + 1 : 0;
    updateTestimonials();
  }, 5000);

  const resetTlAutoplay = () => {
    clearInterval(tlInterval);
    tlInterval = setInterval(() => {
      if (tCards.length === 0) return;
      const total = Math.ceil(tCards.length / getTlPerView()) - 1;
      tlIndex = tlIndex < total ? tlIndex + 1 : 0;
      updateTestimonials();
    }, 5000);
  };

  if (tlPrev && tlNext) {
    const tlTotal = () => Math.ceil(tCards.length / getTlPerView()) - 1;
    tlPrev.addEventListener('click', () => {
      tlIndex = tlIndex > 0 ? tlIndex - 1 : tlTotal();
      updateTestimonials();
      resetTlAutoplay();
    });
    tlNext.addEventListener('click', () => {
      tlIndex = tlIndex < tlTotal() ? tlIndex + 1 : 0;
      updateTestimonials();
      resetTlAutoplay();
    });
  }

  window.addEventListener('resize', () => {
    tlIndex = 0;
    updateTestimonials();
  });

  updateTestimonials();


  /* ─── UPCOMING DEPARTURES SLIDER ─── */
  const evTrack = document.getElementById('evTrack');
  const evLeft  = document.getElementById('evLeft');
  const evRight = document.getElementById('evRight');

  let evIndex = 0;

  const getEvPerView = () => {
    if (window.innerWidth < 700) return 1;
    if (window.innerWidth < 900) return 2;
    if (window.innerWidth < 1100) return 3;
    return 4;
  };

  const updateEvents = () => {
    if (!evTrack) return;
    const evCards = evTrack.querySelectorAll('.event-card');
    if (evCards.length === 0) return;
    const perView = getEvPerView();
    const total = Math.max(0, evCards.length - perView);
    evIndex = Math.min(evIndex, total);

    const cardW = evCards[0].offsetWidth;
    const gap = 24;
    evTrack.style.transform = `translateX(-${evIndex * (cardW + gap)}px)`;
    evTrack.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
  };

  if (evLeft && evRight && evTrack) {
    evLeft.addEventListener('click', () => {
      const evCards = evTrack.querySelectorAll('.event-card');
      const perView = getEvPerView();
      const total = Math.max(0, evCards.length - perView);
      evIndex = evIndex > 0 ? evIndex - 1 : total;
      updateEvents();
    });

    evRight.addEventListener('click', () => {
      const evCards = evTrack.querySelectorAll('.event-card');
      const perView = getEvPerView();
      const total = Math.max(0, evCards.length - perView);
      evIndex = evIndex < total ? evIndex + 1 : 0;
      updateEvents();
    });

    window.addEventListener('resize', () => {
      evIndex = 0;
      updateEvents();
    });

    updateEvents();
  }

  window.initUpcomingDeparturesSlider = () => {
    evIndex = 0;
    updateEvents();
  };


  /* ─── SEARCH WIDGET ─── */
  const dateInput = document.querySelector('.search-widget input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  window.handleSearch = () => {
    const fromCity = document.getElementById('fromCity')?.value || '';
    const toCity   = document.getElementById('toCity')?.value || '';
    const travelDate  = document.getElementById('travelDate')?.value || '';
    const vehicleType = document.getElementById('vehicleType')?.value || '';

    const params = new URLSearchParams();
    if (fromCity) params.set('from', fromCity);
    if (toCity)   params.set('to', toCity);
    if (travelDate)  params.set('date', travelDate);
    if (vehicleType) params.set('type', vehicleType);

    window.location.href = `vehicles.html?${params.toString()}`;
  };


  /* ─── SMOOTH SCROLL HINT CLICK ─── */
  const scrollHint = document.querySelector('.hero-scroll-hint');
  if (scrollHint) {
    scrollHint.style.cursor = 'pointer';
    scrollHint.addEventListener('click', () => {
      document.querySelector('.stats-strip')?.scrollIntoView({ behavior: 'smooth' });
    });
  }


  /* ─── ACTIVE NAV LINK (scroll spy) ─── */
  const sections = document.querySelectorAll('section[id]');

  const updateActiveNavLink = () => {
    let activeId = '';
    const scrollY = window.scrollY;

    if (scrollY < 200) {
      if (navLinks) {
        navLinks.querySelectorAll('a').forEach(a => {
          const href = a.getAttribute('href');
          const isHome = href === 'home.html' || href === '#';
          a.style.fontWeight = isHome ? '700' : '';
          a.classList.toggle('active', isHome);
        });
      }
      return;
    }

    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        activeId = id;
      }
    });

    if (activeId && navLinks) {
      navLinks.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        const isMatch = href === `#${activeId}` || href === `${activeId}.html` || href.endsWith(`#${activeId}`);
        a.style.fontWeight = isMatch ? '700' : '';
        a.classList.toggle('active', isMatch);
      });
    }
  };

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();

}); /* end DOMContentLoaded */