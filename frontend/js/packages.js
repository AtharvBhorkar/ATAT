/* ═══════════════════════════════════════════════════════════════
   VOYAGO — packages.js  (100% Backend-Driven)
   Safe version — works with your existing HTML as-is.
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Config ── */
  const API_BASE = '/api/packages';
  const INITIAL_LIMIT = 8;
  const EXPANDED_LIMIT = 200;

  /* ── DOM (all safe — won't crash if element missing) ── */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const navbar         = $('#navbar');
  const hamburger      = $('#hamburger');
  const navLinks       = $('#navLinks');
  const heroBg         = $('#pkHeroBg');
  const grid           = $('#packagesGrid');
  const loadMoreBtn    = $('#loadMoreBtn');
  const loadMoreWrap   = $('#loadMoreWrap');
  const noResultsEl    = $('#noResultsState');
  const errorStateEl   = $('#errorState');
  const errorMessage   = $('#errorMessage');
  const retryBtn       = $('#retryBtn');
  const searchQueryW   = $('#searchQueryWord');
  const resetFiltersBtn= $('#resetFiltersBtn');
  const clearAllBtn    = $('#clearAllFiltersBtn');
  const pillsContainer = $('#pillsContainer');
  const activePillsEl  = $('#activeFilterPills');
  const searchInput    = $('#pkgSearchInput');
  const tabs           = $$('#pkgTabs .tab-btn');
  const statsSection   = $('.stats-bar-section');

  /* ── Safe style helper — never crashes on null ── */
  function setDisplay(el, value) {
    if (el) el.style.display = value;
  }

  /* ── State ── */
  let allPackages     = [];
  let currentCategory = 'all';
  let searchQuery     = '';
  let itemsLimit      = INITIAL_LIMIT;
  let apiStats        = null;
  let isFetching      = false;

  /* ═══════════════════════════════════════════════════════════
     TAB → DB CATEGORY MAPPING
     Your HTML tabs say "hill" but DB stores "hill-station".
     This map bridges the gap so your HTML stays unchanged.
     ═══════════════════════════════════════════════════════════ */
  const tabToDbCategory = {
    'all':        'all',
    'hill':       'hill-station',
    'pilgrimage': 'pilgrimage',
    'weekend':    'weekend',
    'corporate':  'corporate'
  };

  const categoryLabels = {
    'hill-station': 'Hill Station',
    'pilgrimage':   'Pilgrimage',
    'weekend':      'Weekend Escape',
    'corporate':    'Corporate Tour',
    'adventure':    'Adventure',
    'beach':        'Beach',
    'wildlife':     'Wildlife',
    'heritage':     'Heritage',
    'honeymoon':    'Honeymoon',
    'family':       'Family',
    'cultural':     'Cultural',
    'mountain':     'Mountain',
    'city':         'City'
  };

  const badgeClassMap = {
    'hill-station': 'badge-hill',
    'pilgrimage':   'badge-pilgrimage',
    'weekend':      'badge-weekend',
    'corporate':    'badge-corporate',
    'adventure':    'badge-hill',
    'beach':        'badge-weekend',
    'wildlife':     'badge-pilgrimage',
    'heritage':     'badge-corporate',
    'honeymoon':    'badge-weekend',
    'family':       'badge-hill',
    'cultural':     'badge-pilgrimage',
    'mountain':     'badge-hill',
    'city':         'badge-corporate'
  };

  /* ── Smart include icon picker ── */
  function getIncludeIcon(text) {
    const t = text.toLowerCase();
    if (t.match(/cab|car|sedan|suv|tempo|vehicle|transport|transfer|coach|bus/i)) {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
    }
    if (t.match(/hotel|stay|resort|villa|accommodation|room|camp|tent/i)) {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zm-6 4h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>`;
    }
    if (t.match(/meal|breakfast|lunch|dinner|food|buffet|veg|tea|bbq/i)) {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
    }
    if (t.match(/guide|driver|captain|escort/i)) {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    }
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  }

  /* ── Star renderer ── */
  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.4 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '★' : '') + '☆'.repeat(empty);
  }

  /* ── Price formatter ── */
  function formatPrice(n) {
    return (n || 0).toLocaleString('en-IN');
  }

  /* ── Skeleton loader HTML ── */
  function skeletonHTML(count) {
    return Array.from({ length: count }, () => `
      <div class="pkg-skeleton-card" aria-hidden="true">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line w60"></div>
          <div class="skeleton-line w90"></div>
          <div class="skeleton-line w75"></div>
          <div class="skeleton-line w40"></div>
        </div>
      </div>
    `).join('');
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER ONE CARD — 100% from DB data
     ═══════════════════════════════════════════════════════════ */
  function renderCardHTML(pkg) {
    const title    = pkg.title || pkg.name || '';
    const desc     = pkg.description || '';
    const cat      = pkg.category || '';
    const badge    = badgeClassMap[cat] || '';
    const label    = categoryLabels[cat] || cat;
    const days     = pkg.durationDays || 1;
    const nights   = pkg.durationNights || 0;
    const durText  = pkg.duration || `${days}D / ${nights}N`;
    const price    = pkg.price || 0;
    const orig     = pkg.originalPrice || pkg.discountPrice || null;
    const rating   = pkg.rating || 0;
    const reviews  = pkg.reviewCount || 0;
    const slug     = pkg.slug || pkg._id;
    const image    = pkg.image || '';
    const includes = (pkg.includes || []).slice(0, 3);

    const reviewText = reviews >= 1000
      ? `${(reviews / 1000).toFixed(1)}k reviews`
      : reviews > 0 ? `${reviews} reviews` : '';

    const includesHTML = includes.map(inc =>
      `<span>${getIncludeIcon(inc)} ${inc}</span>`
    ).join('');

    let priceHTML = `<span class="from">from</span> <strong>₹${formatPrice(price)}</strong> <span class="per">/ person</span>`;
    if (orig && orig > price) {
      priceHTML = `<span class="from">from</span> <strong>₹${formatPrice(price)}</strong> <span class="pkg-original-price">₹${formatPrice(orig)}</span> <span class="per">/ person</span>`;
    }

    const imgSrc = image
      ? `src="${image}"`
      : `src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' fill='%23e2e2e2'%3E%3Crect width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"`;

    return `
      <div class="package-card" data-category="${cat}" data-slug="${slug}">
        <div class="pkg-img-wrap">
          <img ${imgSrc} alt="${title}" loading="lazy" />
          ${badge ? `<span class="pkg-category-badge ${badge}">${label}</span>` : ''}
          <div class="pkg-overlay"><span class="pkg-duration">${durText}</span></div>
        </div>
        <div class="pkg-info">
          ${rating > 0 ? `
          <div class="pkg-rating">
            <span class="stars">${renderStars(rating)}</span>
            ${reviewText ? `<span class="rating-text">${rating.toFixed(1)} (${reviewText})</span>` : ''}
          </div>` : ''}
          <h3>${title}</h3>
          ${desc ? `<p>${desc.length > 120 ? desc.substring(0, 120) + '...' : desc}</p>` : ''}
          ${includesHTML ? `<div class="pkg-includes">${includesHTML}</div>` : ''}
          <div class="pkg-footer">
            <div class="pkg-price">${priceHTML}</div>
            <a href="booking.html?type=package&package=${encodeURIComponent(slug)}" class="pkg-btn">Book Now</a>
          </div>
        </div>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════════
     FETCH FROM BACKEND — the ONLY data source
     ═══════════════════════════════════════════════════════════ */
  async function fetchPackages() {
    if (isFetching) return;
    isFetching = true;

    // Safely show/hide — won't crash if element is null
    if (grid) grid.innerHTML = skeletonHTML(6);
    setDisplay(errorStateEl, 'none');
    setDisplay(noResultsEl, 'none');
    setDisplay(loadMoreWrap, 'none');
    setDisplay(statsSection, 'none');

    try {
      const res = await fetch(`${API_BASE}?active=true&limit=200`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load');

      allPackages = json.data || [];
      apiStats    = json.stats || null;

      // Show stats bar only if API returned stats
      if (apiStats) {
        setDisplay(statsSection, '');
        startStatCounters(apiStats);
      }

      // Auto-filter from URL param (e.g. ?type=pilgrimage)
      const urlType = new URLSearchParams(window.location.search).get('type');
      if (urlType) {
        const tabVal = urlType.toLowerCase();
        // Match against both raw tab value and mapped DB value
        const matched = Array.from(tabs).find(t => {
          const dbCat = tabToDbCategory[t.dataset.filter] || t.dataset.filter;
          return t.dataset.filter === tabVal || dbCat === tabVal;
        });
        if (matched) {
          tabs.forEach(t => t.classList.remove('active'));
          matched.classList.add('active');
          currentCategory = matched.dataset.filter;
        }
      }

      updatePackagesGrid();

    } catch (err) {
      console.error('Fetch error:', err);

      // If error state elements exist in HTML, use them
      if (errorStateEl && errorMessage) {
        if (grid) grid.innerHTML = '';
        errorMessage.textContent = err.message || 'Unable to load packages.';
        setDisplay(errorStateEl, 'block');
      } else {
        // Fallback: show error inside the grid itself
        if (grid) {
          grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#666;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px;display:block;opacity:0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              <h3 style="margin:0 0 8px;color:#333;">Something went wrong</h3>
              <p style="margin:0 0 20px;">${err.message || 'Unable to load packages.'}</p>
              <button class="btn-primary" onclick="location.reload()">Try Again</button>
            </div>
          `;
        }
      }
    } finally {
      isFetching = false;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     FILTER + RENDER GRID
     ═══════════════════════════════════════════════════════════ */
  function updatePackagesGrid() {
    // Convert current tab filter to DB category
    const dbCategory = tabToDbCategory[currentCategory] || currentCategory;

    let visibleCount = 0;
    let totalMatching = 0;
    let html = '';

    allPackages.forEach((pkg) => {
      const cat = pkg.category || '';
      const searchable = [
        pkg.title, pkg.name, pkg.description,
        pkg.destination, pkg.state
      ].filter(Boolean).join(' ').toLowerCase();

      const catMatch = dbCategory === 'all' || cat === dbCategory;
      const searchMatch = !searchQuery || searchable.includes(searchQuery);

      if (catMatch && searchMatch) {
        totalMatching++;
        if (dbCategory === 'all' && !searchQuery) {
          if (visibleCount < itemsLimit) {
            html += renderCardHTML(pkg);
            visibleCount++;
          }
        } else {
          html += renderCardHTML(pkg);
          visibleCount++;
        }
      }
    });

    if (grid) grid.innerHTML = html;

    // Stagger animate
    if (grid) {
      grid.querySelectorAll('.package-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.35s ease ${i * 0.05}s, transform 0.35s ease ${i * 0.05}s`;
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      });
    }

    // Toggle no-results / load-more states
    if (totalMatching === 0) {
      setDisplay(noResultsEl, 'block');
      if (searchQueryW) searchQueryW.textContent = searchQuery || currentCategory;
      setDisplay(loadMoreWrap, 'none');
    } else {
      setDisplay(noResultsEl, 'none');
      setDisplay(errorStateEl, 'none');
      setDisplay(loadMoreWrap,
        (dbCategory === 'all' && !searchQuery && totalMatching > itemsLimit) ? 'block' : 'none'
      );
    }

    updateFilterPills();
  }

  /* ── Filter pills ── */
  function updateFilterPills() {
    if (!pillsContainer) return;
    pillsContainer.innerHTML = '';
    let hasPills = false;

    if (currentCategory !== 'all') {
      const tab = Array.from(tabs).find(t => t.dataset.filter === currentCategory);
      createPill(tab ? tab.textContent : currentCategory, () => {
        const allTab = Array.from(tabs).find(t => t.dataset.filter === 'all');
        if (allTab) allTab.click();
      });
      hasPills = true;
    }

    if (searchQuery) {
      createPill(`"${searchQuery}"`, () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        updatePackagesGrid();
      });
      hasPills = true;
    }

    setDisplay(activePillsEl, hasPills ? 'flex' : 'none');
  }

  function createPill(text, onRemove) {
    if (!pillsContainer) return;
    const pill = document.createElement('div');
    pill.className = 'filter-pill';
    pill.innerHTML = `<span>${text}</span>`;
    const btn = document.createElement('button');
    btn.className = 'filter-pill-close';
    btn.innerHTML = '&times;';
    btn.setAttribute('aria-label', `Remove: ${text}`);
    btn.addEventListener('click', onRemove);
    pill.appendChild(btn);
    pillsContainer.appendChild(pill);
  }

  /* ── Reset ── */
  function resetAll() {
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    itemsLimit = INITIAL_LIMIT;
    tabs.forEach(t => t.classList.remove('active'));
    const allTab = Array.from(tabs).find(t => t.dataset.filter === 'all');
    if (allTab) allTab.classList.add('active');
    currentCategory = 'all';
    updatePackagesGrid();
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ═══════════════════════════════════════════════════════════
     STAT COUNTERS — only from API stats
     ═══════════════════════════════════════════════════════════ */
  let statsAnimated = false;

  function animateCounter(el, target, suffix, duration) {
    if (!el) return;
    if (!target || target <= 0) { el.textContent = '0' + suffix; return; }
    duration = duration || 1500;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('en-IN') + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function startStatCounters(stats) {
    if (statsAnimated) return;
    statsAnimated = true;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter($('#statPackages'), stats.packages || 0, '+');
          animateCounter($('#statDests'),    stats.destinations || 0, '+');
          animateCounter($('#statTrips'),    stats.travellers || 0, '+');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    if (statsSection) obs.observe(statsSection);
  }

  /* ═══════════════════════════════════════════════════════════
     NAVBAR + SCROLL + PARALLAX + MOBILE MENU
     ═══════════════════════════════════════════════════════════ */
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }));
  }

  if (heroBg) {
    window.addEventListener('scroll', () => {
      heroBg.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.05)`;
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     EVENT LISTENERS
     ═══════════════════════════════════════════════════════════ */
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.filter; // e.g. "hill" — mapped to DB later
    itemsLimit = INITIAL_LIMIT;
    updatePackagesGrid();
  }));

  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = e.target.value.toLowerCase().trim();
        updatePackagesGrid();
      }, 300);
    });
  }

  if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => {
    itemsLimit = EXPANDED_LIMIT;
    updatePackagesGrid();
  });

  if (clearAllBtn) clearAllBtn.addEventListener('click', resetAll);
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAll);
  if (retryBtn) retryBtn.addEventListener('click', fetchPackages);

  /* ═══════════════════════════════════════════════════════════
     SCROLL REVEAL (non-card elements)
     ═══════════════════════════════════════════════════════════ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('revealed'), e.target.dataset.delay || 0);
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  $$('[data-reveal]').forEach(el => revealObs.observe(el));

  /* ═══════════════════════════════════════════════════════════
     BOOT — fetch everything from backend
     ═══════════════════════════════════════════════════════════ */
  fetchPackages();

});