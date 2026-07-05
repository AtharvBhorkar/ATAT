/**
 * VOYAGO home.html — API Integration
 * Fetches live vehicles & packages from the backend.
 * Existing hardcoded HTML acts as fallback if API is unavailable.
 *
 * Requires: js/api.js loaded BEFORE this file.
 */
(function () {
  'use strict';

  /* ══════════ Helpers ══════════ */
  var $ = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return Array.from((p || document).querySelectorAll(s)); };
  function esc(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmt(n) { return '\u20B9' + Number(n || 0).toLocaleString('en-IN'); }

  /* Map whatever category the admin set → tab slug used in HTML */
  function mapCategory(cat) {
    if (!cat) return 'all';
    var c = cat.toLowerCase().trim();
    if (/hill/.test(c)) return 'hill';
    if (/pilgrim|yatra|temple|dham|char/.test(c)) return 'pilgrimage';
    if (/weekend|escape|short|getaway/.test(c)) return 'weekend';
    return c.replace(/\s+/g, '-');
  }

  function categoryLabel(cat) {
    var map = { hill: 'Hill Station', pilgrimage: 'Pilgrimage', weekend: 'Weekend Escape' };
    return map[cat] || (cat || '').replace(/-/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); });
  }

  /* ══════════ Update Stat Numbers ══════════ */
  function updateStats(stats) {
    if (!stats) return;

    var vc = stats.totalVehicles || stats.vehicleCount || 0;
    var pc = stats.totalPackages || stats.activePackageCount || stats.packageCount || 0;

    /* Stats strip — .count-up elements: [Years, Vehicles, Destinations, Travellers] */
    var counts = $$('.count-up');
    if (counts[1] && vc > 0) counts[1].dataset.target = vc;
    if (counts[2] && pc > 0) { counts[2].dataset.target = pc; /* repurpose Destinations slot for packages if needed */ }

    /* Hero floating cards — .stat-card-num elements: [Travellers, Vehicles, Destinations] */
    var heroNums = $$('.stat-card-num');
    if (heroNums[1] && vc > 0) heroNums[1].innerHTML = vc + '<span>+</span>';
    if (heroNums[2] && pc > 0) {
      heroNums[2].innerHTML = pc + '<span>+</span>';
      var lbl = heroNums[2].nextElementSibling;
      if (lbl) lbl.textContent = 'Tour Packages';
    }

    /* Re-trigger count-up if the function is global */
    if (typeof window.initCountUp === 'function') window.initCountUp();
  }

  /* ══════════ Vehicle Card Builder ══════════ */
  function vehicleCardHTML(v, idx) {
    var featured = idx === 0 ? ' featured-card' : '';

    /* Smart badge */
    var badge = '';
    if (v.totalTrips > 50) badge = '<span class="vehicle-badge">Most Booked</span>';
    else if (v.rating >= 4.5) badge = '<span class="vehicle-badge">Popular</span>';
    else if (v.featured) badge = '<span class="vehicle-badge">Featured</span>';

    var seats = v.seats || v.capacity || '\u2014';
    var priceStr = '';
    if (v.pricePerKm) priceStr = fmt(v.pricePerKm) + ' / km';
    else if (v.pricePerDay) priceStr = fmt(v.pricePerDay) + ' / day';
    else if (v.price) priceStr = fmt(v.price);
    else priceStr = 'Contact for price';

    var slug = v.slug || v._id;
    var desc = v.description
      ? (v.description.length > 120 ? v.description.substring(0, 120) + '\u2026' : v.description)
      : 'Comfortable, well-maintained vehicle perfect for your journey.';

    var fallbackImg = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80';

    return '' +
      '<div class="vehicle-card' + featured + '" data-reveal>' +
        '<div class="vehicle-img-wrap">' +
          '<img src="' + esc(v.image) + '" alt="' + esc(v.name) + '" loading="lazy" onerror="this.src=\'' + fallbackImg + '\'" />' +
          badge +
        '</div>' +
        '<div class="vehicle-info">' +
          '<h3>' + esc(v.name) + '</h3>' +
          '<p>' + esc(desc) + '</p>' +
          '<div class="vehicle-meta">' +
            '<span><span class="meta-icon"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.2" stroke="currentColor" stroke-width="1.4"/><path d="M2 12c0-2.5 2-4.5 4.5-4.5S11 9.5 11 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span> ' + seats + ' Seats</span>' +
            '<span><span class="meta-icon"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v1M6.5 11v1M1 6.5h1M11 6.5h1M2.8 2.8l.7.7M9.5 9.5l.7.7M9.5 3.5l.7-.7M2.8 10.2l.7-.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" stroke-width="1.4"/></svg></span> ' + esc(v.fuelType || 'AC') + '</span>' +
            (v.transmission ? '<span><span class="meta-icon"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="4" width="9" height="7" rx="1.2" stroke="currentColor" stroke-width="1.4"/><path d="M4.5 4V3a2 2 0 014 0v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M5 7.5h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></span> ' + esc(v.transmission) + '</span>' : '') +
          '</div>' +
          '<div class="vehicle-price">From <strong>' + priceStr + '</strong></div>' +
          '<a href="#" data-vehicle="' + esc(slug) + '" class="btn-primary btn-sm">View Details</a>' +
        '</div>' +
      '</div>';
  }

  /* ══════════ Package Card Builder ══════════ */
  function packageCardHTML(p) {
    var cat = mapCategory(p.category);
    var catLabel = categoryLabel(cat);
    var duration = (p.days || p.nights)
      ? (p.days || '?') + ' Days / ' + (p.nights || '?') + ' Nights'
      : 'Custom Duration';
    var desc = p.description
      ? (p.description.length > 140 ? p.description.substring(0, 140) + '\u2026' : p.description)
      : '';
    var slug = p.slug || p._id;
    var title = p.title || p.name || 'Package';
    var fallbackImg = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80';

    return '' +
      '<div class="package-card" data-category="' + cat + '" data-reveal>' +
        '<div class="pkg-img-wrap">' +
          '<img src="' + esc(p.image) + '" alt="' + esc(title) + '" loading="lazy" onerror="this.src=\'' + fallbackImg + '\'" />' +
          '<div class="pkg-overlay"><span class="pkg-duration">' + duration + '</span></div>' +
        '</div>' +
        '<div class="pkg-info">' +
          '<p class="pkg-category">' + catLabel + '</p>' +
          '<h3>' + esc(title) + '</h3>' +
          '<p>' + esc(desc) + '</p>' +
          '<div class="pkg-footer">' +
            '<div class="pkg-price"><span class="from">from</span> <strong>' + fmt(p.price) + '</strong> <span class="per">/ person</span></div>' +
            '<a href="booking.html" class="pkg-btn">Book Now</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ══════════ Render Functions ══════════ */
  function renderVehicles(vehicles) {
    var grid = $('.vehicles-grid');
    if (!grid || !vehicles.length) return;

    /* Homepage shows max 8 vehicles */
    var shown = vehicles.slice(0, 8);
    grid.innerHTML = shown.map(function (v, i) { return vehicleCardHTML(v, i); }).join('');

    /* Re-init things that main.js may have set up */
    reinitReveal();
    reinitVehicleModal();
  }

  function renderPackages(packages) {
    var grid = $('#packagesGrid');
    if (!grid || !packages.length) return;

    grid.innerHTML = packages.map(function (p) { return packageCardHTML(p); }).join('');

    reinitReveal();
    reinitPackageSlider();
    bindPackageTabs(packages);
  }

  function renderUpcomingDepartures(packages) {
    var track = $('#evTrack');
    if (!track || !packages.length) return;

    /* Generate upcoming departure dates dynamically: today + 7 days + idx * 7 days */
    function getUpcomingDateString(idx) {
      var d = new Date();
      d.setDate(d.getDate() + 7 + idx * 7);
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var mName = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()];
      return days[d.getDay()] + ', ' + d.getDate() + ' ' + mName;
    }

    function eventCardHTML(p, idx) {
      var slug = p.slug || p._id;
      var title = p.title || p.name || 'Package';
      var fallbackImg = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80';
      var dateStr = getUpcomingDateString(idx);
      var loc = p.destination ? (p.destination + (p.state ? ', ' + p.state : '')) : 'India';

      return '' +
        '<div class="event-card" onclick="window.location.href=\'package-detail.html?slug=' + esc(slug) + '\'" style="cursor: pointer;" data-reveal>' +
          '<div class="event-img">' +
            '<img src="' + esc(p.image) + '" alt="' + esc(title) + '" loading="lazy" onerror="this.src=\'' + fallbackImg + '\'" />' +
          '</div>' +
          '<div class="event-info">' +
            '<p class="event-date">' + dateStr + '</p>' +
            '<h4>' + esc(title.toUpperCase()) + '</h4>' +
            '<p class="event-loc">' +
              '<svg width="12" height="12" viewBox="0 0 12 12" fill="none">' +
                '<path d="M6 1C4.3 1 3 2.3 3 4c0 2.5 3 7 3 7s3-4.5 3-7c0-1.7-1.3-3-3-3z" stroke="currentColor" stroke-width="1.2" />' +
                '<circle cx="6" cy="4" r="1.2" fill="currentColor" />' +
              '</svg>' +
              esc(loc) +
            '</p>' +
          '</div>' +
        '</div>';
    }

    track.innerHTML = packages.map(function (p, i) { return eventCardHTML(p, i); }).join('');

    reinitReveal();
    if (typeof window.initUpcomingDeparturesSlider === 'function') {
      window.initUpcomingDeparturesSlider();
    }
  }

  /* ══════════ Re-init Helpers ══════════ */
  function reinitReveal() {
    /* Try common reveal/scroll animation initializers */
    if (typeof window.initReveal === 'function') window.initReveal();
    else if (typeof window.initScrollReveal === 'function') window.initScrollReveal();
    /* Fallback: manually observe new [data-reveal] elements */
    else observeReveals();
  }

  function observeReveals() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    $$('[data-reveal]:not(.revealed)').forEach(function (el) { obs.observe(el); });
  }

  function reinitVehicleModal() {
    if (typeof window.initVehicleModal === 'function') window.initVehicleModal();
  }

  function reinitPackageSlider() {
    if (typeof window.initPackageSlider === 'function') window.initPackageSlider();
    else if (typeof window.initSlider === 'function') window.initSlider();
  }

  /* ══════════ Package Tab Filtering ══════════ */
  function bindPackageTabs(allPackages) {
    var tabs = $$('.tab-btn');
    if (!tabs.length) return;

    tabs.forEach(function (btn) {
      /* Remove old listeners by cloning */
      var clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);

      clone.addEventListener('click', function () {
        $$('.tab-btn').forEach(function (t) { t.classList.remove('active'); });
        clone.classList.add('active');

        var tab = clone.dataset.tab;
        var grid = $('#packagesGrid');
        if (!grid) return;

        var filtered = tab === 'all'
          ? allPackages
          : allPackages.filter(function (p) { return mapCategory(p.category) === tab; });

        grid.innerHTML = filtered.map(function (p) { return packageCardHTML(p); }).join('');
        reinitPackageSlider();
      });
    });
  }

  /* ══════════ Main Fetch ══════════ */
  async function loadFromAPI() {
    /* Guard: API must be available */
    if (typeof window.API === 'undefined' || !window.API.public) {
      console.warn('[Voyago] API utility not found. Using hardcoded fallback.');
      return;
    }

    try {
      var results = await Promise.allSettled([
        window.API.public.getStats(),
        window.API.public.getVehicles('available=true&limit=8'),
        window.API.public.getPackages('limit=20')
      ]);

      /* ── Stats ── */
      var statsRes = results[0];
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        updateStats(statsRes.value.data);
      }

      /* ── Vehicles ── */
      var vehRes = results[1];
      var vehicles = null;
      if (vehRes.status === 'fulfilled' && vehRes.value.success && vehRes.value.data && vehRes.value.data.length) {
        vehicles = vehRes.value.data;
      }
      /* Fallback: try featuredVehicles from stats response */
      if (!vehicles && statsRes.status === 'fulfilled' && statsRes.value.success && statsRes.value.data && statsRes.value.data.featuredVehicles && statsRes.value.data.featuredVehicles.length) {
        vehicles = statsRes.value.data.featuredVehicles;
      }
      if (vehicles) renderVehicles(vehicles);

      /* ── Packages ── */
      var pkgRes = results[2];
      var packages = null;
      if (pkgRes.status === 'fulfilled' && pkgRes.value.success && pkgRes.value.data && pkgRes.value.data.length) {
        packages = pkgRes.value.data;
      }
      /* Fallback: try featuredPackages from stats response */
      if (!packages && statsRes.status === 'fulfilled' && statsRes.value.success && statsRes.value.data && statsRes.value.data.featuredPackages && statsRes.value.data.featuredPackages.length) {
        packages = statsRes.value.data.featuredPackages;
      }
      if (packages) {
        renderPackages(packages);
        renderUpcomingDepartures(packages);
      }

      console.log('[Voyago] Home page loaded from API \u2714');

    } catch (err) {
      console.warn('[Voyago] API unavailable, keeping hardcoded fallback.', err.message);
    }
  }

  /* ══════════ Boot ══════════ */
  function boot() {
    /* Small delay so main.js DOMContentLoaded handlers run first and set up
       the page with hardcoded content. Then we replace with API data and
       re-init. This guarantees the page always looks complete. */
    setTimeout(loadFromAPI, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();