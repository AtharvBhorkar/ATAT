/* ═══════════════════════════════════════
   VOYAGO — main.js
═══════════════════════════════════════ */

    document.addEventListener('DOMContentLoaded', () => {

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
        // Generate mobile helper buttons dynamically if they don't exist
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

        // Toggle menu visibility
        hamburger.addEventListener('click', () => {
          const open = hamburger.classList.toggle('open');
          navLinks.classList.toggle('open', open);
          hamburger.setAttribute('aria-expanded', open);
        });

        // Close menu when a link inside is clicked
        navLinks.querySelectorAll('a').forEach(a =>
          a.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
          })
        );

        // Close menu when clicking outside the navbar
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
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger sibling reveals
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

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const counter = entry.target;
    const target = +counter.dataset.target;
    let count = 0;

    const duration = 2000; // 2 seconds
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

    observer.unobserve(counter);
  });
}, {
  threshold: 0.5
});

counters.forEach(counter => observer.observe(counter));


  /* ─── PACKAGE TABS ─── */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const pkgCards  = document.querySelectorAll('.package-card');

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
    const perView = getCardsPerView();
    sliderTotal = Math.max(0, Math.ceil(cards.length / perView) - 1);
    sliderIndex = Math.min(sliderIndex, sliderTotal);

    // Only apply transform on mobile/tablet
    if (window.innerWidth < 1100) {
      const cardW = cards[0]?.offsetWidth || 0;
      const gap = 28;
      slider.style.transform = `translateX(-${sliderIndex * (cardW + gap) * perView}px)`;
      slider.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    } else {
      slider.style.transform = '';
      slider.style.transition = '';
    }

    // Dots
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

  // Watch for tab changes
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sliderIndex = 0;
      setTimeout(updateSlider, 50);
    });
  });

  updateSlider();


  /* ─── TESTIMONIALS INFINITE LOOP ─── */
  const track = document.getElementById('testTrack');
  if (track) {
    // cards ko ek baar duplicate karo taaki loop seamless dikhe
    const originalCards = Array.from(track.children);
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }


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


  /* ─── SEARCH WIDGET: SET TODAY AS MIN DATE & HANDLE SEARCH ─── */
  const dateInput = document.querySelector('.search-widget input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  window.handleSearch = () => {
    const fromCity = document.getElementById('fromCity')?.value || '';
    const toCity = document.getElementById('toCity')?.value || '';
    const travelDate = document.getElementById('travelDate')?.value || '';
    const vehicleType = document.getElementById('vehicleType')?.value || '';
    
    const params = new URLSearchParams();
    if (fromCity) params.set('from', fromCity);
    if (toCity) params.set('to', toCity);
    if (travelDate) params.set('date', travelDate);
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
  });