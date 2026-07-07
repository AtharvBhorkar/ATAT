/* ═══════════════════════════════════════════════════════════════
   VOYAGO — vehicle-detail.js
   100% Connected to Express + MongoDB backend.
   All hardcoded row data removed. Fetches dynamically via API.
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   API CONFIGURATION
───────────────────────────────────────── */
const API_BASE = window.location.port === '5500' || window.location.port === '3000'
    ? 'http://localhost:5000/api/public'
    : '/api/public';

/* ─────────────────────────────────────────
   HELPERS & SVGs
───────────────────────────────────────── */
const $ = (id) => document.getElementById(id);
const qs = (sel, ctx = document) => ctx.querySelector(sel);

function getSVGForSpec(icon) {
  const svgs = {
    seat: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="7" r="3.5" stroke="currentColor" stroke-width="1.6"/><path d="M3 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    fuel: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 20V5l3-3h9l3 3v15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="7" y="9" width="8" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M17 8l2 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    ac: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v16M3 11h16M5.6 5.6l10.8 10.8M16.4 5.6L5.6 16.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="11" cy="11" r="3" stroke="currentColor" stroke-width="1.5"/></svg>`,
    luggage: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="7" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7.5 7V5.5a3.5 3.5 0 017 0V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 12h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    gearbox: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="11" cy="16" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M6 8.5V13M16 8.5V13M11 8v5.5M6 13l5 3M16 13l-5 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    efficiency: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 18c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M11 10V6M8 12l3-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="11" cy="18" r="1.5" fill="currentColor"/></svg>`
  };
  return svgs[icon] || svgs.fuel;
}

// Dynamic feature icon (replaces 100-line hardcoded map)
function getFeatureSVG(name) {
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 8l2.5 2.5L11 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4"/></svg>`;
}

function buildStars(rating) {
  let html = '';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 0; i < full; i++) {
    html += `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.5 4h4.2l-3.4 2.5 1.3 4L8 9.8 4.4 12l1.3-4L2.3 5.5h4.2z" fill="#D9A441"/></svg>`;
  }
  if (half) {
    html += `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.5 4h4.2l-3.4 2.5 1.3 4L8 9.8V1.5z" fill="#D9A441"/><path d="M8 1.5L6.5 5.5H2.3l3.4 2.5-1.3 4L8 9.8z" fill="none" stroke="#D9A441" stroke-width="1"/></svg>`;
  }
  return html;
}

/* ─────────────────────────────────────────
   TRANSFORM DB DATA → UI FORMAT
───────────────────────────────────────── */
function transformVehicleForDetailPage(v) {
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : 'N/A';
  let type = (v.type || 'standard').toLowerCase();
  let bookType = type;
  if (type.includes('tempo')) bookType = 'tempo';
  if (type.includes('bus')) bookType = 'bus';
  if (type.includes('muv')) bookType = 'muv';

  const images = v.images && v.images.length > 0 ? v.images : (v.image ? [v.image] : ['https://placehold.co/1920x1080/e8e8e8/999?text=No+Image']);

  return {
    name: v.name || 'Unnamed Vehicle',
    type: capitalize(type),
    badge: v.badge || '',
    badgeClass: v.badgeClass || 'badge--maroon',
    rating: v.rating || 0,
    trips: v.totalTrips || 0,
    kmLakh: v.totalKmLakhs || 0,
    ratingAvg: (v.rating || 0).toFixed(1),
    heroImg: images[0],
    description: v.description || v.note || 'Comfortable vehicle for your journey.',
    images: images,
    specs: [
      { icon: 'seat', label: 'Seating', value: `${v.seats || 4} Passengers` },
      { icon: 'fuel', label: 'Fuel Type', value: capitalize(v.fuelType || v.fuel || 'N/A') },
      { icon: 'ac', label: 'AC', value: v.ac !== false ? 'Fully AC' : 'Non-AC' },
      { icon: 'luggage', label: 'Luggage', value: `${v.luggage || v.bags || 2} Large Bags` },
      { icon: 'gearbox', label: 'Transmission', value: capitalize(v.transmission || 'N/A') },
      { icon: 'efficiency', label: 'Mileage', value: v.mileage || 'N/A' }
    ],
    pricing: {
      perKm: v.pricePerKm || 0,
      perDay: v.pricePerDay || 0,
      minFare: v.minimumFare || v.minFare || 0,
      toll: v.tollParking || 'Extra, stated upfront',
      driver: v.driverCharges || 'Included'
    },
    features: v.amenities && v.amenities.length > 0 ? v.amenities : (v.features || ['Air Conditioning', 'Verified Driver']),
    routes: v.idealFor && v.idealFor.length > 0 ? v.idealFor.map(r => ({ icon: '📍', label: r })) : [{ icon: '🛤️', label: 'Outstation Trips' }],
    bookType: bookType,
    slug: v.slug || v._id,
    _id: v._id
  };
}

/* ─────────────────────────────────────────
   MAIN INIT (Now Async to fetch from DB)
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  /* ── 1. URL PARAM PARSING ── */
  const params = new URLSearchParams(window.location.search);
  
  // Support multiple URL formats: ?id=xxx, ?slug=xxx, or legacy ?type=suv&model=innova
  let fetchKey = params.get('slug') || params.get('id') || params.get('vehicle');
  let typeForBooking = params.get('type') || 'suv';

  if (!fetchKey) {
    const type = (params.get('type') || '').toLowerCase().replace(/\s+/g, '');
    const model = (params.get('model') || '').toLowerCase().replace(/\s+/g, '-');
    if (type) {
      fetchKey = model ? `${type}-${model}` : type;
      typeForBooking = type;
    }
  }

  if (!fetchKey) {
    document.body.innerHTML = '<div style="text-align:center;padding:100px 20px;"><h2>Vehicle Not Specified</h2><p>Please go back to the vehicles page and select a vehicle.</p><a href="vehicles.html" style="color:#b8552e;">Back to Vehicles</a></div>';
    return;
  }

  /* ── 2. FETCH FROM BACKEND ── */
  let V;
  try {
    const res = await fetch(`${API_BASE}/vehicles/${fetchKey}`);
    const result = await res.json();
    if (!result.success || !result.data) {
      throw new Error('Vehicle not found in database');
    }
    V = transformVehicleForDetailPage(result.data);
    typeForBooking = V.bookType; // Override with accurate DB type
  } catch (err) {
    console.error('Failed to load vehicle:', err);
    document.body.innerHTML = `<div style="text-align:center;padding:100px 20px;"><h2>Failed to Load Vehicle</h2><p>${err.message}</p><a href="vehicles.html" style="color:#b8552e;">Back to Vehicles</a></div>`;
    return;
  }

  /* ── 3. POPULATE DOM ── */
  
  // Update page title & meta
  if($('pageTitle')) $('pageTitle').textContent = `${V.name} - Voyago Vehicle Details`;
  const pageDesc = qs('meta[name="description"]');
  if(pageDesc) pageDesc.setAttribute('content', `Book the ${V.name} with Voyago. Starting from ₹${V.pricing.perKm}/km. ${V.description}`);

  /* ── HERO ── */
  const heroBg = $('pageHeroBg');
  if (heroBg) heroBg.style.backgroundImage = `url('${V.heroImg}')`;
  if($('heroVehicleName')) $('heroVehicleName').textContent = V.name;
  if($('heroTypeBadge')) $('heroTypeBadge').textContent = V.type + ' · Vehicle Details';
  if($('heroTitle')) $('heroTitle').innerHTML = `Meet the<br><em>${V.name}</em>`;
  if($('heroSub')) $('heroSub').textContent = V.description;

  /* ── GALLERY ── */
  const mainImg = $('galleryMain');
  const thumbsWrap = $('galleryThumbs');
  const badge = $('galleryBadge');

  if(badge) {
    badge.textContent = V.badge;
    badge.className = `gallery-badge ${V.badgeClass}`;
  }
  if(mainImg) {
    mainImg.src = V.heroImg;
    mainImg.alt = `${V.name} - main view`;
  }

  if(thumbsWrap) {
    thumbsWrap.innerHTML = '';
    V.images.forEach((src, i) => {
      const thumb = document.createElement('div');
      thumb.className = `gallery-thumb${i === 0 ? ' active' : ''}`;
      thumb.innerHTML = `<img src="${src}" alt="${V.name} angle ${i + 1}" loading="lazy"/><div class="gallery-thumb-overlay"></div>`;
      thumb.addEventListener('click', () => {
        if(mainImg) {
          mainImg.classList.add('switching');
          setTimeout(() => {
            mainImg.src = src;
            mainImg.classList.remove('switching');
          }, 220);
        }
        document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
      thumbsWrap.appendChild(thumb);
    });
  }

  /* ── VEHICLE INFO ── */
  if($('vdTypeLabel')) $('vdTypeLabel').textContent = V.type;
  if($('vdStars')) $('vdStars').innerHTML = buildStars(V.rating);
  if($('vdRatingNum')) $('vdRatingNum').textContent = V.rating;
  if($('vdRatingCount')) $('vdRatingCount').textContent = `(${V.trips.toLocaleString()} trips)`;
  if($('vdVehicleName')) $('vdVehicleName').textContent = V.name;
  if($('vdDesc')) $('vdDesc').textContent = V.description;

  /* ── STATS (count-up on reveal) ── */
  const statTripsEl = $('statTrips');
  const statKmEl = $('statKm');
  const statRatingEl = $('statRating');

  function countUp(el, target, suffix = '', decimals = 0) {
    if(!el) return;
    const duration = 1200;
    const start = performance.now();
    const isFloat = decimals > 0;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      el.textContent = isFloat ? current.toFixed(decimals) + suffix : Math.round(current).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    countUp(statTripsEl, V.trips, '+');
    countUp(statKmEl, V.kmLakh, '+');
    countUp(statRatingEl, parseFloat(V.ratingAvg), '', 1);
    statsObserver.disconnect();
  }, { threshold: 0.3 });

  const statsRow = qs('.vd-stats-row');
  if (statsRow) statsObserver.observe(statsRow);

  /* ── SPECS GRID ── */
  const specsGrid = $('vdSpecsGrid');
  if(specsGrid) {
    specsGrid.innerHTML = '';
    V.specs.forEach(spec => {
      const card = document.createElement('div');
      card.className = 'vd-spec-card';
      card.innerHTML = `
        <div class="vd-spec-icon">${getSVGForSpec(spec.icon)}</div>
        <span class="vd-spec-label">${spec.label}</span>
        <span class="vd-spec-value">${spec.value}</span>
      `;
      specsGrid.appendChild(card);
    });
  }

  /* ── FEATURES ── */
  const featuresGrid = $('vdFeaturesGrid');
  if(featuresGrid) {
    featuresGrid.innerHTML = '';
    V.features.forEach(feat => {
      const item = document.createElement('div');
      item.className = 'vd-feature-item';
      item.innerHTML = `
        <span class="vd-feature-icon">${getFeatureSVG(feat)}</span>
        <span>${feat}</span>
      `;
      featuresGrid.appendChild(item);
    });
  }

  /* ── PRICING SIDEBAR ── */
  if($('sidebarPriceKm')) $('sidebarPriceKm').textContent = V.pricing.perKm;
  if($('sidebarDayRate')) $('sidebarDayRate').textContent = `₹${V.pricing.perDay.toLocaleString()}`;

  const breakdown = $('sidebarBreakdown');
  if(breakdown) {
    breakdown.innerHTML = '';
    const rowIcons = {
      km: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5h10M8.5 3.5l3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      day: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M4 1v2M9 1v2M1 5.5h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
      min: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 4v3l2 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
      driver: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2" stroke="currentColor" stroke-width="1.4"/><path d="M2 12c0-2.5 2-4.5 4.5-4.5S11 9.5 11 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
      toll: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 10V5l2-4h5l2 4v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="10" r="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="9" cy="10" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>`
    };

    const pricingRows = [
      { label: 'Per Kilometre', value: `₹${V.pricing.perKm}`, icon: 'km', highlight: true },
      { label: 'Per Day', value: `₹${V.pricing.perDay.toLocaleString()}`, icon: 'day', highlight: false },
      { label: 'Min. Fare', value: `₹${V.pricing.minFare}`, icon: 'min', highlight: false },
      { label: 'Driver Charges', value: V.pricing.driver, icon: 'driver', highlight: false },
      { label: 'Toll / Parking', value: V.pricing.toll, icon: 'toll', highlight: false }
    ];

    pricingRows.forEach(row => {
      const div = document.createElement('div');
      div.className = 'pricing-row';
      div.innerHTML = `
        <span class="pricing-row-label">${rowIcons[row.icon]} ${row.label}</span>
        <span class="pricing-row-value${row.highlight ? ' highlight' : ''}">${row.value}</span>
      `;
      breakdown.appendChild(div);
    });

    /* Advance Payment Box */
    const ADVANCE_RATE_MAP = { sedan: 0.10, suv: 0.15, muv: 0.15, tempo: 0.20, bus: 0.20 };
    const advRate = ADVANCE_RATE_MAP[typeForBooking] || 0.10;
    const advanceAmt = Math.round(V.pricing.perDay * advRate);
    const advPct = Math.round(advRate * 100);

    const advanceBox = document.createElement('div');
    advanceBox.className = 'pricing-advance-box';
    advanceBox.innerHTML = `
      <div class="adv-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="4" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M1 8h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="5" cy="12" r="1.2" fill="currentColor"/><path d="M9 12h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      </div>
      <div class="adv-content">
        <p class="adv-title">Advance to Confirm Booking</p>
        <div class="adv-amount-row">
          <span class="adv-amount">₹${advanceAmt.toLocaleString()}</span>
          <span class="adv-pct-badge">${advPct}%</span>
        </div>
        <p class="adv-note">Balance due on the day of journey. Free cancellation 24h prior.</p>
      </div>
    `;
    breakdown.insertAdjacentElement('afterend', advanceBox);
  }

  /* ── PRICING MOBILE ── */
  const pricingMobileWrap = $('vdPricingMobile');
  if(pricingMobileWrap && $('vdBookBtnMobile')) {
    const mobileCards = [
      { label: 'Per KM', price: `₹${V.pricing.perKm}`, unit: 'per kilometre', featured: true },
      { label: 'Per Day', price: `₹${V.pricing.perDay.toLocaleString()}`, unit: 'per day', featured: false }
    ];
    mobileCards.forEach(c => {
      const el = document.createElement('div');
      el.className = `vd-pricing-card-item${c.featured ? ' featured' : ''}`;
      el.innerHTML = `<span class="pc-label">${c.label}</span><div class="pc-price">${c.price}</div><span class="pc-unit">${c.unit}</span>`;
      pricingMobileWrap.insertBefore(el, $('vdBookBtnMobile'));
    });
  }

  /* ── BOOK BUTTON LINKS ── */
  const bookingURL = `booking.html?type=${typeForBooking}&vehicle=${encodeURIComponent(V.name)}`;
  if($('vdBookBtn')) $('vdBookBtn').href = bookingURL;
  if($('vdBookBtnMobile')) $('vdBookBtnMobile').href = bookingURL;
  if($('mobileCtaBtn')) $('mobileCtaBtn').href = bookingURL;
  if($('mobileCtaPrice')) $('mobileCtaPrice').textContent = `₹${V.pricing.perKm}`;

  /* ── ROUTES ── */
  const routesGrid = $('vdRoutesGrid');
  if(routesGrid) {
    routesGrid.innerHTML = '';
    V.routes.forEach(r => {
      const el = document.createElement('div');
      el.className = 'vd-route-tag';
      el.innerHTML = `<div class="vd-route-tag-icon"><span style="font-size:1.2rem;">${r.icon}</span></div><span>${r.label}</span>`;
      routesGrid.appendChild(el);
    });
  }

  /* ── SIMILAR VEHICLES (Fetched from Backend) ── */
  await buildSimilarVehicles(V._id || V.slug, typeForBooking);

  /* ─── SCROLL EFFECTS & UI INIT ─── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => { if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    }));
    document.addEventListener('click', e => {
      if (navbar && !navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });
  }

  const heroBgEl = document.getElementById('pageHeroBg');
  if (heroBgEl) {
    window.addEventListener('scroll', () => {
      heroBgEl.style.transform = `translateY(${window.scrollY * 0.28}px)`;
    }, { passive: true });
  }

  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    scrollIndicator.style.transition = 'opacity 0.4s ease';
    window.addEventListener('scroll', () => {
      scrollIndicator.style.opacity = window.scrollY > 80 ? '0' : '1';
    }, { passive: true });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-reveal]'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('revealed'), idx * 90);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  const stickyBar = document.getElementById('mobileStickyCtA');
  const hero = document.getElementById('vdHero');
  if (stickyBar && hero) {
    const heroHeight = hero.offsetHeight;
    window.addEventListener('scroll', () => {
      stickyBar.classList.toggle('visible', window.scrollY > heroHeight * 0.6);
    }, { passive: true });
  }

}); // end DOMContentLoaded


/* ─────────────────────────────────────────
   BUILD SIMILAR VEHICLES (From Backend)
───────────────────────────────────────── */
async function buildSimilarVehicles(currentId, currentType) {
  const grid = document.getElementById('similarVehiclesGrid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/vehicles?type=${currentType}&limit=4`);
    const result = await res.json();
    
    // Filter out the current vehicle and take up to 3
    const list = (result.data || []).filter(v => (v._id || v.slug) !== currentId).slice(0, 3);

    if (list.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666;">No similar vehicles found.</p>';
      return;
    }

    list.forEach((v, i) => {
      const vType = (v.type || 'standard').toLowerCase();
      const detailURL = `vehicle-detail.html?slug=${v.slug || v._id}`;
      const bookURL = `booking.html?type=${vType}&vehicle=${encodeURIComponent(v.name)}`;
      const img = v.image || v.images?.[0] || 'https://placehold.co/700x400/e8e8e8/999?text=Vehicle';

      const card = document.createElement('div');
      card.className = 'vehicle-card';
      card.setAttribute('data-reveal', '');
      card.innerHTML = `
        <div class="vehicle-img-wrap">
          <img src="${img}" alt="${v.name}" loading="lazy" />
          <span class="vehicle-badge ${v.badgeClass || 'badge--maroon'}">${v.badge || ''}</span>
          <div class="vehicle-img-overlay">
            <a href="${detailURL}" class="quick-view-btn">View Details</a>
          </div>
        </div>
        <div class="vehicle-info">
          <div class="vehicle-header">
            <div>
              <p class="vehicle-type-label">${v.type || 'Vehicle'}</p>
              <h3 class="vehicle-name">${v.name}</h3>
            </div>
            <div class="vehicle-rating">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1 3h3l-2.4 1.8.9 3L6 7.2 3.5 8.8l.9-3L2 4h3z" fill="#D9A441"/></svg>
              <span>${v.rating || 0}</span>
            </div>
          </div>
          <p class="vehicle-desc">${(v.description || v.note || '').substring(0, 90)}…</p>
          <div class="vehicle-specs">
            <div class="spec-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.3" stroke="currentColor" stroke-width="1.4"/><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              <span>${v.seats || 4} Passengers</span>
            </div>
            <div class="spec-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v1M7 12v1M1 7h1M12 7h1M2.9 2.9l.7.7M10.4 10.4l.7.7M10.4 3.6l.7-.7M2.9 11.1l.7-.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.4"/></svg>
              <span>${v.ac !== false ? 'AC' : 'Non-AC'}</span>
            </div>
            <div class="spec-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="4.5" width="10" height="7" rx="1.2" stroke="currentColor" stroke-width="1.4"/><path d="M4.5 4.5V3.5a2.5 2.5 0 015 0v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              <span>${v.luggage || v.bags || 2} Bags</span>
            </div>
            <div class="spec-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 10V5l2-3h8l2 3v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="10" r="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="10" cy="10" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>
              <span>${v.fuelType || v.fuel || 'Diesel'}</span>
            </div>
          </div>
          <div class="vehicle-footer">
            <div class="vehicle-price">
              <span class="price-from">from</span>
              <strong class="price-num">₹${v.pricePerKm || 0}</strong>
              <span class="price-unit">/ km</span>
            </div>
            <div class="vehicle-actions">
              <a href="${detailURL}" class="btn-outline btn-sm">Details</a>
              <a href="${bookURL}" class="btn-primary btn-sm">Book Now</a>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Re-observe dynamically added cards
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-reveal]'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('revealed'), idx * 100);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.06 });

    grid.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  } catch (err) {
    console.error('Error loading similar vehicles:', err);
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666;">Could not load similar vehicles.</p>';
  }
}