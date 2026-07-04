/* ═══════════════════════════════════════
   VOYAGO — vehicles.js & vehicle-modal.js
   100% Connected to Express + MongoDB backend
   Debug Ready Version
═══════════════════════════════════════ */

const API_BASE = window.location.port === '5500' || window.location.port === '3000'
? 'http://localhost:5000/api'
: '/api';



/* ─── FETCH VEHICLES FROM BACKEND ─── */
async function loadVehicles() {
  const grid = document.getElementById("vehiclesGrid");
  if (!grid) return;

  // Show loading text
  grid.innerHTML = '<div class="empty-state">Connecting to database...</div>';

  const url = `${API_BASE}/vehicles?limit=100`;
  console.log(`🚀 Trying to fetch vehicles from: ${url}`);

  try {
    const res = await fetch(url);
    console.log(`📡 Backend Response Status: ${res.status} ${res.statusText}`);
    
    const result = await res.json();
    console.log("📦 Raw JSON Data from Backend:", result);

    if (!result.success) {
      throw new Error(result.message || 'Backend returned unsuccessful response');
    }

    const vehiclesList = result.data || result.vehicles || [];
    
    if (vehiclesList.length === 0) {
      console.warn("⚠️ Backend connected successfully, but the database is EMPTY!");
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <h3 style="margin-bottom: 10px;">⚠️ Database is Empty</h3>
          <p style="color: #666; margin-bottom: 20px;">Backend is connected, but there are no vehicles in the database.<br>Please add vehicles using your Admin Dashboard at <a href="/admin/dashboard" style="color: #b8552e; font-weight: bold;">localhost:5000/admin/dashboard</a></p>
        </div>`;
      return;
    }

    console.log(`✅ Successfully loaded ${vehiclesList.length} vehicles from database`);
    renderVehicles(vehiclesList);

    // Wait for DOM update then init filters
    requestAnimationFrame(() => {
      initFilters();
    });

  } catch (err) {
    console.error("❌ FAILED TO CONNECT TO BACKEND:", err);
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <h3 style="margin-bottom: 10px;">Connection Error</h3>
        <p style="color: #b8552e; margin-bottom: 10px;">Could not connect to backend server.</p>
        <p style="color: #666; font-size: 14px;"><strong>Error:</strong> ${err.message}<br><br>
        Please make sure your Node.js server is running:<br>
        <code style="background:#f4f4f4; padding:5px 10px; border-radius:4px; display:inline-block; margin-top:5px;">node backend/server.js</code></p>
      </div>`;
  }
}

function renderVehicles(vehicles) {
  const grid = document.getElementById("vehiclesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  vehicles.forEach((vehicle, idx) => {
    const card = document.createElement("div");
    card.className = "vehicle-card";
    card.setAttribute('data-reveal', '');

    const vehicleType = (vehicle.type || 'standard').toLowerCase();
    card.dataset.type = vehicleType;
    card.dataset.ac = vehicle.ac !== false ? "true" : "false";
    card.dataset.price = Number(vehicle.pricePerDay || 0);
    card.dataset.seats = Number(vehicle.seats || 4);
    
    // Use slug or _id for the modal trigger
    const vehicleKey = vehicle.slug || vehicle._id;

    // Smart badge selection
    let badgeHtml = '';
    if (vehicle.badge) {
      const badgeCls = vehicle.badgeClass || 'badge--maroon';
      badgeHtml = `<span class="vehicle-badge ${badgeCls}">${vehicle.badge}</span>`;
    } else if (vehicle.totalTrips > 50) {
      badgeHtml = '<span class="vehicle-badge badge--maroon">Most Booked</span>';
    } else if (vehicle.rating >= 4.8) {
      badgeHtml = '<span class="vehicle-badge badge--gold">Popular</span>';
    }

    const typeLabel = vehicle.type ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) : 'Standard';

    const desc = vehicle.description
      ? (vehicle.description.length > 120 ? vehicle.description.substring(0, 120) + '...' : vehicle.description)
      : 'Comfortable, well-maintained vehicle perfect for your journey.';

    const starSvg = `<svg width="14" height="14" viewBox="0 0 14 14" fill="#D9A441" style="display:inline-block; vertical-align:middle; margin-right:3px;"><path d="M7 1.5l1.4 3.8H12l-2.9 2.3 1.1 3.8L7 9.1l-3.2 2.3 1.1-3.8L2 5.3h3.6z"/></svg>`;

    const specIcons = {
      seat: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="6" r="3.2"/><path d="M3 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke-linecap="round"/></svg>`,
      fuel: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 18V6l3-4h7l3 4v12" stroke-linecap="round" stroke-linejoin="round"/><rect x="7" y="9" width="6" height="4" rx="1" stroke-width="1.4"/></svg>`,
      ac:   `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 3v14M3 10h14M5.3 5.3l9.4 9.4M14.7 5.3L5.3 14.7" stroke-linecap="round"/><circle cx="10" cy="10" r="3" stroke-width="1.4"/></svg>`,
      gear: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="2.5"/><circle cx="14" cy="6" r="2.5"/><circle cx="10" cy="14" r="2.5"/><path d="M6 8.5V11M14 8.5V11M10 8v5.5M6 11l4 3M14 11l-4 3" stroke-linecap="round"/></svg>`
    };

    const formattedPrice = Number(vehicle.pricePerDay || 0).toLocaleString('en-IN');

    card.innerHTML = `
      <div class="vehicle-img-wrap">
        <img src="${vehicle.image || '/images/no-image.jpg'}" alt="${vehicle.name}" loading="lazy" onerror="this.src='https://placehold.co/600x400/e8e8e8/999?text=No+Image'">
        <div class="vehicle-img-overlay">
          <button class="quick-view-btn">Quick View</button>
        </div>
        ${badgeHtml}
      </div>

      <div class="vehicle-info">
        <div class="vehicle-header">
          <div>
            <div class="vehicle-type-label">${typeLabel}</div>
            <h3 class="vehicle-name">${vehicle.name}</h3>
          </div>
          <div class="vehicle-rating">
            ${starSvg} ${vehicle.rating || '4.5'}
          </div>
        </div>
        
        <p class="vehicle-desc">${desc}</p>

        <div class="vehicle-specs">
          <div class="spec-item">
            ${specIcons.seat}
            <span>${vehicle.seats || 4} Seats</span>
          </div>
          <div class="spec-item">
            ${specIcons.ac}
            <span>${vehicle.ac !== false ? 'AC' : 'Non-AC'}</span>
          </div>
          <div class="spec-item">
            ${specIcons.fuel}
            <span>${vehicle.fuelType || vehicle.fuel || 'Diesel'}</span>
          </div>
          <div class="spec-item">
            ${specIcons.gear}
            <span>${vehicle.transmission || 'Manual'}</span>
          </div>
        </div>

        <div class="vehicle-footer">
          <div class="vehicle-price">
            <span class="price-from">From</span>
            <span class="price-num">₹${formattedPrice}</span>
            <span class="price-unit">/day</span>
          </div>
          <div class="vehicle-actions">
            <button class="btn-primary btn-sm btn-book" onclick="event.stopPropagation(); window.location.href='booking.html?vehicle=${vehicle._id}'">Book Now</button>
          </div>
        </div>
      </div>
    `;

    // Make the whole card clickable to open modal
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-book')) return;
      e.preventDefault();
      openVehicleModal(vehicleKey);
    });

    grid.appendChild(card);
  });
}

/* ─── INITIALIZE FILTERS (runs AFTER cards are in the DOM) ─── */
function initFilters() {
  const cards        = Array.from(document.querySelectorAll('.vehicle-card'));
  const typeChips    = document.querySelectorAll('.filter-chips .chip');
  const acTrack      = document.getElementById('acTrack');
  const acToggle     = document.getElementById('acToggle');
  const sortSelect   = document.getElementById('sortSelect');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState   = document.getElementById('emptyState');
  const grid         = document.getElementById('vehiclesGrid');
  const resetBtn     = document.getElementById('resetFiltersBtn');

  if (!grid || cards.length === 0) return;

  let activeType = 'all';
  let acOnly     = false;

  // Read URL params on load
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  if (typeParam) {
    const matchChip = document.querySelector(`.chip[data-type="${typeParam}"]`);
    if (matchChip) {
      typeChips.forEach(c => c.classList.remove('active'));
      matchChip.classList.add('active');
      activeType = typeParam;
    }
  }

  // Sort helper
  const sortCards = (list) => {
    const val = sortSelect?.value || 'default';
    return list.sort((a, b) => {
      if (val === 'price-asc')  return +a.dataset.price - +b.dataset.price;
      if (val === 'price-desc') return +b.dataset.price - +a.dataset.price;
      if (val === 'seats-asc')  return +a.dataset.seats - +b.dataset.seats;
      if (val === 'seats-desc') return +b.dataset.seats - +a.dataset.seats;
      return 0;
    });
  };

  // Main filter + sort + re-render
  const applyFilters = () => {
    let visible = 0;

    const sorted = sortCards([...cards]);
    sorted.forEach(card => grid.appendChild(card));

    sorted.forEach(card => {
      const typeMatch = activeType === 'all' || card.dataset.type === activeType;
      const acMatch   = !acOnly || card.dataset.ac === 'true';
      const show      = typeMatch && acMatch;

      if (show) {
        card.classList.remove('hidden', 'card-enter');
        void card.offsetWidth; // trigger reflow for re-animation
        card.classList.add('card-enter');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (resultsCount) {
      resultsCount.innerHTML = `Showing <strong>${visible}</strong> vehicle${visible !== 1 ? 's' : ''}`;
    }
    if (emptyState) {
      emptyState.style.display = visible === 0 ? 'flex' : 'none';
    }
  };

  typeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      typeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeType = chip.dataset.type;
      applyFilters();
    });
  });

  if (acToggle && acTrack) {
    acToggle.addEventListener('click', () => {
      acOnly = !acOnly;
      acTrack.classList.toggle('on', acOnly);
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      typeChips.forEach(c => c.classList.remove('active'));
      const allChip = document.querySelector('.chip[data-type="all"]');
      if(allChip) allChip.classList.add('active');
      activeType = 'all';
      acOnly = false;
      if (acTrack) acTrack.classList.remove('on');
      if (sortSelect) sortSelect.value = 'default';
      applyFilters();
    });
  }

  applyFilters();
}


/* ═══════════════════════════════════════════════════════════════
   VEHICLE MODAL — Dynamic Backend Fetch (No Hardcoded Data)
   ═══════════════════════════════════════════════════════════════ */

function transformVehicleForModal(v) {
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : 'N/A';
  let type = (v.type || 'standard').toLowerCase();
  let bookType = type;
  if (type === 'tempo traveller' || type === 'tempo') bookType = 'tempo';
  if (type === 'luxury bus' || type === 'bus') bookType = 'bus';

  return {
    name: v.name || 'Unnamed Vehicle',
    type: capitalize(type),
    badge: v.badge || '',
    badgeClass: v.badgeClass || 'vm-badge--maroon',
    rating: v.rating || 0,
    trips: v.totalTrips || 0,
    desc: v.description || v.note || 'Comfortable vehicle for your journey.',
    images: v.images && v.images.length > 0 ? v.images : (v.image ? [v.image] : ['/images/no-image.jpg']),
    specs: [
      { icon: 'seat', label: 'Seating', val: `${v.seats || 4} Passengers` },
      { icon: 'fuel', label: 'Fuel', val: capitalize(v.fuelType || v.fuel || 'N/A') },
      { icon: 'ac', label: 'AC', val: v.ac !== false ? 'Fully AC' : 'Non-AC' },
      { icon: 'bag', label: 'Luggage', val: `${v.luggage || v.bags || 2} Large Bags` },
      { icon: 'gear', label: 'Transmission', val: capitalize(v.transmission || 'N/A') },
      { icon: 'km', label: 'Mileage', val: v.mileage || 'N/A' }
    ],
    features: v.amenities && v.amenities.length > 0 ? v.amenities : (v.features || ['Air Conditioning', 'Verified Driver']),
    priceKm: v.pricePerKm || 0,
    priceDay: v.pricePerDay || 0,
    minFare: v.minimumFare || v.minFare || 0,
    bookType: bookType
  };
}

/* SVG HELPERS */
const SPEC_ICONS = {
  seat: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M3 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  fuel: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 18V6l3-4h7l3 4v12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="7" y="9" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>`,
  ac:   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14M5.3 5.3l9.4 9.4M14.7 5.3L5.3 14.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.4"/></svg>`,
  bag:  `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="7" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7 7V5.5a3 3 0 016 0V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  gear: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="14" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="14" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M6 8.5V11M14 8.5V11M10 8v5.5M6 11l4 3M14 11l-4 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  km:   `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 17c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M10 10V6M7 12l3-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="17" r="1.5" fill="currentColor"/></svg>`
};

const FEAT_ICON = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function buildStars(r) {
  let h = '';
  for (let i = 0; i < 5; i++) {
    h += `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l1.4 3.8H12l-2.9 2.3 1.1 3.8L7 9.1l-3.2 2.3 1.1-3.8L2 5.3h3.6z" fill="${i < Math.floor(r) ? '#D9A441' : 'none'}" stroke="#D9A441" stroke-width="1"/></svg>`;
  }
  return h;
}

function injectModalHTML() {
  if (document.getElementById('vehicleModal')) return;
  const html = `
  <div id="vehicleModal" class="vm-backdrop" role="dialog" aria-modal="true" aria-labelledby="vmTitle">
    <div class="vm-drawer" id="vmDrawer">
      <button class="vm-close" id="vmClose" aria-label="Close"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      <div class="vm-inner" id="vmInner">
        <div class="vm-left">
          <div class="vm-gallery">
            <div class="vm-gallery-main-wrap"><img id="vmMainImg" src="" alt="" class="vm-gallery-main" /><span class="vm-img-badge" id="vmBadge"></span></div>
            <div class="vm-thumbs" id="vmThumbs"></div>
          </div>
          <div class="vm-info-header">
            <div class="vm-meta-row"><span class="vm-type-chip" id="vmType"></span><div class="vm-stars" id="vmStars"></div><span class="vm-rating-num" id="vmRatingNum"></span><span class="vm-trips" id="vmTrips"></span></div>
            <h2 class="vm-name" id="vmTitle"></h2>
            <p class="vm-desc" id="vmDesc"></p>
          </div>
          <div class="vm-block"><h3 class="vm-block-title">Specifications</h3><div class="vm-specs-grid" id="vmSpecs"></div></div>
          <div class="vm-block"><h3 class="vm-block-title">Amenities & Features</h3><div class="vm-features-grid" id="vmFeatures"></div></div>
        </div>
        <div class="vm-right">
          <div class="vm-pricing-card">
            <div class="vm-pricing-header"><p class="vm-pricing-eyebrow">Starting From</p><div class="vm-price-main"><span class="vm-price-currency">₹</span><span class="vm-price-num" id="vmPriceKm"></span><span class="vm-price-unit">/ km</span></div><div class="vm-price-day" id="vmPriceDay"></div></div>
            <div class="vm-pricing-body" id="vmPricingBody"></div>
            <div class="vm-advance-banner"><div class="vm-advance-content"><p class="vm-advance-title">Advance to Confirm Booking</p><p class="vm-advance-desc"><span id="vmAdvanceAmt">&#8377;--</span>&nbsp;<span class="vm-advance-pct-badge" id="vmAdvancePctBadge">10%</span>&nbsp;advance secures your slot.</p></div></div>
            <div class="vm-pricing-note">Tolls &amp; parking stated upfront. No hidden fees.</div>
            <a href="#" class="vm-book-btn" id="vmBookBtn">Book This Vehicle</a>
            <a href="contact.html" class="vm-contact-link">Talk to our team before booking</a>
            <div class="vm-trust-list">
              <div class="vm-trust-item">Fully insured rides</div>
              <div class="vm-trust-item">Free cancellation</div>
              <div class="vm-trust-item">Instant confirmation</div>
            </div>
          </div>
        </div>
      </div>
      <div class="vm-mobile-footer" id="vmMobileFooter"><a href="#" class="vm-book-btn-mobile-sticky" id="vmMobileStickyBookBtn">Book This Vehicle</a></div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function populateModal(V) {
  document.getElementById('vmType').textContent      = V.type;
  document.getElementById('vmStars').innerHTML       = buildStars(V.rating);
  document.getElementById('vmRatingNum').textContent = V.rating;
  document.getElementById('vmTrips').textContent     = `(${V.trips.toLocaleString()} trips)`;
  document.getElementById('vmTitle').textContent     = V.name;
  document.getElementById('vmDesc').textContent      = V.desc;

  const badge = document.getElementById('vmBadge');
  badge.textContent = V.badge;
  badge.className   = `vm-img-badge ${V.badgeClass}`;

  const mainImg = document.getElementById('vmMainImg');
  mainImg.src = V.images[0];
  mainImg.alt = V.name;

  const thumbs = document.getElementById('vmThumbs');
  thumbs.innerHTML = '';
  V.images.forEach((src, i) => {
    const t = document.createElement('button');
    t.className   = `vm-thumb${i === 0 ? ' active' : ''}`;
    t.innerHTML   = `<img src="${src}" alt="${V.name} view ${i+1}" loading="lazy"/>`;
    t.addEventListener('click', () => {
      mainImg.classList.add('vm-img-fade');
      setTimeout(() => { mainImg.src = src; mainImg.classList.remove('vm-img-fade'); }, 200);
      thumbs.querySelectorAll('.vm-thumb').forEach(el => el.classList.remove('active'));
      t.classList.add('active');
    });
    thumbs.appendChild(t);
  });

  const specsEl = document.getElementById('vmSpecs');
  specsEl.innerHTML = '';
  V.specs.forEach(s => {
    specsEl.insertAdjacentHTML('beforeend', `<div class="vm-spec-card"><div class="vm-spec-icon">${SPEC_ICONS[s.icon] || SPEC_ICONS.fuel}</div><span class="vm-spec-label">${s.label}</span><span class="vm-spec-val">${s.val}</span></div>`);
  });

  const featEl = document.getElementById('vmFeatures');
  featEl.innerHTML = '';
  V.features.forEach(f => {
    featEl.insertAdjacentHTML('beforeend', `<div class="vm-feat-item"><span class="vm-feat-icon">${FEAT_ICON}</span><span>${f}</span></div>`);
  });

  document.getElementById('vmPriceKm').textContent  = V.priceKm;
  document.getElementById('vmPriceDay').innerHTML   = `or <strong>₹${V.priceDay.toLocaleString()}</strong> / day`;

  document.getElementById('vmPricingBody').innerHTML = `
    <div class="vm-price-row"><span>Per Kilometre</span><strong class="hl">₹${V.priceKm}</strong></div>
    <div class="vm-price-row"><span>Per Day</span><strong>₹${V.priceDay.toLocaleString()}</strong></div>
    <div class="vm-price-row"><span>Minimum Fare</span><strong>₹${V.minFare}</strong></div>
    <div class="vm-price-row"><span>Driver Charges</span><strong>Included</strong></div>
    <div class="vm-price-row"><span>Toll / Parking</span><strong>Extra (stated upfront)</strong></div>`;

  const ADVANCE_RATES = { sedan: 0.10, suv: 0.15, muv: 0.15, tempo: 0.20, bus: 0.20 };
  const advRate    = ADVANCE_RATES[V.bookType] || 0.10;
  const advanceAmt = Math.round(V.priceDay * advRate);
  document.getElementById('vmAdvanceAmt').textContent = `₹${advanceAmt.toLocaleString()}`;
  document.getElementById('vmAdvancePctBadge').textContent = `${Math.round(advRate * 100)}%`;

  const bookingURL = `booking.html?type=${V.bookType}&vehicle=${encodeURIComponent(V.name)}`;
  document.getElementById('vmBookBtn').href = bookingURL;
  document.getElementById('vmMobileStickyBookBtn').href = bookingURL;

  const modal  = document.getElementById('vehicleModal');
  modal.classList.add('vm-active');
  document.body.style.overflow = 'hidden';
  document.getElementById('vmInner').scrollTop = 0;

  if (!modal._listenersAttached) {
    modal._listenersAttached = true;
    document.getElementById('vmClose').addEventListener('click', closeVehicleModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeVehicleModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVehicleModal(); });
  }
}

async function openVehicleModal(key) {
  injectModalHTML();
  const inner = document.getElementById('vmInner');
  if(inner) inner.innerHTML = '<div style="text-align:center;padding:60px;color:#666;">Loading vehicle details...</div>';

  try {
    const url = `${API_BASE}/vehicles/${key}`;
    console.log(`🔍 Fetching single vehicle from: ${url}`);
    
    const res = await fetch(url);
    const result = await res.json();
    console.log("📦 Single Vehicle Data:", result);
    
    if (!result.success || !result.data) {
      throw new Error('Vehicle not found in database');
    }
    
    const V = transformVehicleForModal(result.data);
    
    const oldModal = document.getElementById('vehicleModal');
    if(oldModal) oldModal.remove();
    injectModalHTML();
    populateModal(V);

  } catch (err) {
    console.error("❌ Modal Fetch Error:", err);
    const modalInner = document.getElementById('vmInner');
    if(modalInner) {
      modalInner.innerHTML = `<div style="text-align:center;padding:60px;color:#b8552e;"><h3>Failed to load details</h3><p style="margin:10px 0;">${err.message}</p><button onclick="closeVehicleModal()" style="margin-top:10px;padding:8px 16px;cursor:pointer;border:1px solid #b8552e;background:none;border-radius:4px;color:#b8552e;">Close</button></div>`;
    }
  }
}

function closeVehicleModal() {
  const modal = document.getElementById('vehicleModal');
  if (!modal) return;
  modal.classList.remove('vm-active');
  document.body.style.overflow = '';
}

/* AUTO-WIRE [data-vehicle] TRIGGERS */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-vehicle]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openVehicleModal(el.dataset.vehicle); });
  });
});

/* ═══════════════════════════════════════════════════════════════
   PAGE INITIALIZATION
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadVehicles();

  /* ─── NAVBAR SCROLL ─── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => { if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── HAMBURGER MENU ─── */
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open'); navLinks.classList.remove('open'); hamburger.setAttribute('aria-expanded', false);
    }));
    document.addEventListener('click', e => {
      if (navbar && !navbar.contains(e.target)) { hamburger.classList.remove('open'); navLinks.classList.remove('open'); hamburger.setAttribute('aria-expanded', false); }
    });
  }

  /* ─── PAGE HERO PARALLAX ─── */
  const heroBg = document.getElementById('pageHeroBg');
  if (heroBg) { window.addEventListener('scroll', () => { heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`; }, { passive: true }); }

  /* ─── SCROLL INDICATOR HIDE ─── */
  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    scrollIndicator.style.transition = 'opacity 0.4s ease';
    window.addEventListener('scroll', () => { scrollIndicator.style.opacity = window.scrollY > 80 ? '0' : '1'; }, { passive: true });
  }

  /* ─── FILTER BAR ELEVATION ─── */
  const filterBarWrap = document.getElementById('filterBarWrap');
  if (filterBarWrap) { window.addEventListener('scroll', () => { filterBarWrap.classList.toggle('elevated', filterBarWrap.getBoundingClientRect().top <= 72); }, { passive: true }); }

  /* ─── SCROLL REVEAL ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-reveal]'));
      setTimeout(() => entry.target.classList.add('revealed'), siblings.indexOf(entry.target) * 80);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ─── GRID / LIST VIEW TOGGLE ─── */
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');
  const grid        = document.getElementById('vehiclesGrid');
  if (gridViewBtn && listViewBtn && grid) {
    gridViewBtn.addEventListener('click', () => { grid.classList.remove('list-view'); gridViewBtn.classList.add('active'); listViewBtn.classList.remove('active'); });
    listViewBtn.addEventListener('click', () => { grid.classList.add('list-view'); listViewBtn.classList.add('active'); gridViewBtn.classList.remove('active'); });
  }

  /* ─── SMOOTH SCROLL TO GRID on hash ─── */
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  if (window.location.hash === '#vehicles' || typeParam) {
    setTimeout(() => { const section = document.querySelector('.vehicles-section'); if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 400);
  }
});