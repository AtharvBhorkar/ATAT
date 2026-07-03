

const VEHICLE_DATA = {

  /* ── SEDANS ── */
  'sedan-dzire': {
    name: 'Swift Dzire', type: 'Sedan',
    badge: 'Most Booked', badgeClass: 'vm-badge--maroon',
    rating: 4.8, trips: 1840,
    desc: 'India\'s classic highway companion — smooth, fuel-efficient and perfectly sized for couples or small families on long drives.',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=900&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80',
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=900&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=900&q=80',
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&q=80'
    ],
    specs: [
      { icon: 'seat', label: 'Seating', val: '4 Passengers' },
      { icon: 'fuel', label: 'Fuel', val: 'Petrol / CNG' },
      { icon: 'ac', label: 'AC', val: 'Fully AC' },
      { icon: 'bag', label: 'Luggage', val: '2 Large Bags' },
      { icon: 'gear', label: 'Transmission', val: 'Manual / Auto' },
      { icon: 'km', label: 'Mileage', val: '22–26 km/L' }
    ],
    features: ['Air Conditioning', 'USB Charging Port', 'GPS Navigation', 'Music System', 'Reclining Seats', 'Sanitised After Each Trip', 'Emergency Assistance', 'Verified Driver'],
    priceKm: 12, priceDay: 2800, minFare: 350,
    bookType: 'sedan'
  },

  'sedan-city': {
    name: 'Honda City', type: 'Sedan',
    badge: 'Premium', badgeClass: 'vm-badge--gold',
    rating: 4.9, trips: 2210,
    desc: 'Step up the comfort — spacious cabin, premium leather interiors and a whisper-quiet ride. Ideal for business trips and special occasions.',
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&q=80',
      'https://images.unsplash.com/photo-1617469165786-8007eda3caa7?w=900&q=80',
      'https://images.unsplash.com/photo-1536700503339-1e771d4c635d?w=900&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80',
      'https://images.unsplash.com/photo-1493238792000-8113da705763?w=900&q=80'
    ],
    specs: [
      { icon: 'seat', label: 'Seating', val: '4 Passengers' },
      { icon: 'fuel', label: 'Fuel', val: 'Petrol' },
      { icon: 'ac', label: 'AC', val: 'Dual Zone AC' },
      { icon: 'bag', label: 'Luggage', val: '2 Large Bags' },
      { icon: 'gear', label: 'Transmission', val: 'CVT Automatic' },
      { icon: 'km', label: 'Mileage', val: '18–21 km/L' }
    ],
    features: ['Dual Zone AC', 'USB & Type-C Charging', 'GPS Navigation', 'Premium Sound System', 'Leather Seats', 'Sunroof', 'Sanitised After Each Trip', 'Verified Driver'],
    priceKm: 15, priceDay: 3500, minFare: 450,
    bookType: 'sedan'
  },

  /* ── SUVs ── */
  'suv-innova': {
    name: 'Innova Crysta', type: 'SUV',
    badge: 'Popular', badgeClass: 'vm-badge--maroon',
    rating: 4.9, trips: 3120,
    desc: 'India\'s favourite family mover — powerful diesel engine, roomy 7-seater cabin and smooth commanding ride on any terrain.',
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=80',
      'https://images.unsplash.com/photo-1551830820-330a71b99659?w=900&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80',
      'https://images.unsplash.com/photo-1506015391300-4802dc74ee37?w=900&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80'
    ],
    specs: [
      { icon: 'seat', label: 'Seating', val: '7 Passengers' },
      { icon: 'fuel', label: 'Fuel', val: 'Diesel' },
      { icon: 'ac', label: 'AC', val: 'Dual Roof AC' },
      { icon: 'bag', label: 'Luggage', val: '4 Large Bags' },
      { icon: 'gear', label: 'Transmission', val: 'Manual / Auto' },
      { icon: 'km', label: 'Mileage', val: '14–17 km/L' }
    ],
    features: ['Dual Roof AC', 'USB Charging (All Rows)', 'GPS Navigation', 'Premium Music System', 'Captain Seats (Row 2)', '4WD Capability', 'Sanitised After Each Trip', 'Verified Driver'],
    priceKm: 18, priceDay: 4500, minFare: 600,
    bookType: 'suv'
  },

  'suv-fortuner': {
    name: 'Toyota Fortuner', type: 'SUV',
    badge: 'Luxury', badgeClass: 'vm-badge--gold',
    rating: 4.9, trips: 980,
    desc: 'The pinnacle of SUV luxury — powerful 4WD, premium leather cabin and commanding road presence for those who demand the best.',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=80',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80',
      'https://images.unsplash.com/photo-1551830820-330a71b99659?w=900&q=80'
    ],
    specs: [
      { icon: 'seat', label: 'Seating', val: '7 Passengers' },
      { icon: 'fuel', label: 'Fuel', val: 'Diesel' },
      { icon: 'ac', label: 'AC', val: 'Multi-Zone AC' },
      { icon: 'bag', label: 'Luggage', val: '5 Large Bags' },
      { icon: 'gear', label: 'Transmission', val: 'Automatic 4WD' },
      { icon: 'km', label: 'Mileage', val: '12–15 km/L' }
    ],
    features: ['Multi-Zone AC', 'USB & Wireless Charging', 'GPS Navigation', 'JBL Sound System', 'Leather Seats', '4WD Terrain Modes', 'Sunroof', 'Verified Driver'],
    priceKm: 24, priceDay: 6000, minFare: 800,
    bookType: 'suv'
  },

  /* ── MUV ── */
  'muv-ertiga': {
    name: 'Maruti Ertiga', type: 'MUV',
    badge: 'Family Pick', badgeClass: 'vm-badge--rust',
    rating: 4.7, trips: 1560,
    desc: 'The sweet spot between a sedan and a full SUV — ideal for joint families and small group outings with great fuel efficiency.',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=900&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80'
    ],
    specs: [
      { icon: 'seat', label: 'Seating', val: '7 Passengers' },
      { icon: 'fuel', label: 'Fuel', val: 'Petrol / CNG' },
      { icon: 'ac', label: 'AC', val: 'Fully AC' },
      { icon: 'bag', label: 'Luggage', val: '3 Large Bags' },
      { icon: 'gear', label: 'Transmission', val: 'Manual' },
      { icon: 'km', label: 'Mileage', val: '17–20 km/L' }
    ],
    features: ['Air Conditioning', 'USB Charging Ports', 'GPS Navigation', 'Touchscreen Infotainment', 'Foldable 3rd Row', 'Roof Rails', 'Sanitised After Each Trip', 'Verified Driver'],
    priceKm: 16, priceDay: 3800, minFare: 500,
    bookType: 'muv'
  },

  /* ── TEMPO ── */
  'tempo-12': {
    name: 'Tempo Traveller 12', type: 'Tempo',
    badge: 'Group Fav', badgeClass: 'vm-badge--maroon',
    rating: 4.8, trips: 890,
    desc: 'Push-back seats, USB charging ports, reading lights and dedicated luggage racks — perfect for comfortable group getaways and pilgrimages.',
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=900&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
      'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=900&q=80'
    ],
    specs: [
      { icon: 'seat', label: 'Seating', val: '12 Passengers' },
      { icon: 'fuel', label: 'Fuel', val: 'Diesel' },
      { icon: 'ac', label: 'AC', val: 'Roof-Mounted AC' },
      { icon: 'bag', label: 'Luggage', val: '8 Large Bags' },
      { icon: 'gear', label: 'Transmission', val: 'Manual' },
      { icon: 'km', label: 'Mileage', val: '10–13 km/L' }
    ],
    features: ['Roof-Mounted AC', 'Push-Back Seats', 'GPS Navigation', 'Premium Music System', 'Reading Lights', 'Luggage Boot', 'Sanitised After Each Trip', 'Verified Driver'],
    priceKm: 28, priceDay: 7000, minFare: 1200,
    bookType: 'tempo'
  },

  'tempo-20': {
    name: 'Tempo Traveller 20', type: 'Tempo',
    badge: 'Large Groups', badgeClass: 'vm-badge--maroon',
    rating: 4.7, trips: 560,
    desc: 'Larger pilgrimages and big family tours — wide push-back seats, enhanced suspension and ample luggage storage for extended journeys.',
    images: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=900&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
      'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=900&q=80'
    ],
    specs: [
      { icon: 'seat', label: 'Seating', val: '20 Passengers' },
      { icon: 'fuel', label: 'Fuel', val: 'Diesel' },
      { icon: 'ac', label: 'AC', val: 'Roof-Mounted AC' },
      { icon: 'bag', label: 'Luggage', val: 'Group Luggage' },
      { icon: 'gear', label: 'Transmission', val: 'Manual' },
      { icon: 'km', label: 'Mileage', val: '8–11 km/L' }
    ],
    features: ['Roof-Mounted AC', 'Wide Push-Back Seats', 'GPS Navigation', 'Music System', 'Enhanced Suspension', 'Large Luggage Boot', 'Sanitised After Each Trip', 'Verified Driver'],
    priceKm: 38, priceDay: 9500, minFare: 2000,
    bookType: 'tempo'
  },

  /* ── BUS ── */
  'bus': {
    name: 'Luxury Coach', type: 'Bus',
    badge: 'Large Groups', badgeClass: 'vm-badge--maroon',
    rating: 4.7, trips: 420,
    desc: 'Our luxury coaches seat 35+ passengers in airline-style reclining seats with personal AC vents and entertainment screens for long hauls.',
    images: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=900&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
      'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=900&q=80'
    ],
    specs: [
      { icon: 'seat', label: 'Seating', val: '35+ Passengers' },
      { icon: 'fuel', label: 'Fuel', val: 'Diesel' },
      { icon: 'ac', label: 'AC', val: 'Individual Vents' },
      { icon: 'bag', label: 'Luggage', val: 'Under-Bus Storage' },
      { icon: 'gear', label: 'Transmission', val: 'Automatic' },
      { icon: 'km', label: 'Mileage', val: '6–9 km/L' }
    ],
    features: ['Individual AC Vents', 'Reclining Seats', 'GPS Tracking', 'Entertainment Screens', 'Onboard Pantry', 'Emergency Exit', 'Sanitised After Each Trip', 'Verified Driver + Co-Driver'],
    priceKm: 55, priceDay: 14000, minFare: 3500,
    bookType: 'bus'
  },

  /* ── HOME PAGE GENERIC ALIASES ── */
  'sedan': null,
  'suv': null,
  'tempo': null
};

/* Resolve generic aliases */
VEHICLE_DATA['sedan'] = VEHICLE_DATA['sedan-dzire'];
VEHICLE_DATA['suv'] = VEHICLE_DATA['suv-innova'];
VEHICLE_DATA['tempo'] = VEHICLE_DATA['tempo-12'];

const SPEC_ICONS = {
  seat: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M3 19c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  fuel: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 18V6l3-4h7l3 4v12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="7" y="9" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>`,
  ac: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14M5.3 5.3l9.4 9.4M14.7 5.3L5.3 14.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.4"/></svg>`,
  bag: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="7" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7 7V5.5a3 3 0 016 0V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  gear: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="14" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="14" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M6 8.5V11M14 8.5V11M10 8v5.5M6 11l4 3M14 11l-4 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  km: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 17c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M10 10V6M7 12l3-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="17" r="1.5" fill="currentColor"/></svg>`
};

const FEAT_ICON = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function buildStars(r) {
  let h = '';
  for (let i = 0; i < 5; i++) {
    const f = i < Math.floor(r) ? '#D9A441' : (i < r ? 'url(#half)' : 'none');
    h += `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l1.4 3.8H12l-2.9 2.3 1.1 3.8L7 9.1l-3.2 2.3 1.1-3.8L2 5.3h3.6z" fill="${i < Math.floor(r) ? '#D9A441' : 'none'}" stroke="#D9A441" stroke-width="1"/></svg>`;
  }
  return h;
}


function injectModalHTML() {
  if (document.getElementById('vehicleModal')) return;

  const html = `
  <div id="vehicleModal" class="vm-backdrop" role="dialog" aria-modal="true" aria-labelledby="vmTitle">
    <div class="vm-drawer" id="vmDrawer">

      <!-- Close button -->
      <button class="vm-close" id="vmClose" aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Scrollable inner -->
      <div class="vm-inner" id="vmInner">

        <!-- ── LEFT PANEL ── -->
        <div class="vm-left">

          <!-- Gallery -->
          <div class="vm-gallery">
            <div class="vm-gallery-main-wrap">
              <img id="vmMainImg" src="" alt="" class="vm-gallery-main" />
              <span class="vm-img-badge" id="vmBadge"></span>
            </div>
            <div class="vm-thumbs" id="vmThumbs"></div>
          </div>

          <!-- Info header -->
          <div class="vm-info-header">
            <div class="vm-meta-row">
              <span class="vm-type-chip" id="vmType"></span>
              <div class="vm-stars" id="vmStars"></div>
              <span class="vm-rating-num" id="vmRatingNum"></span>
              <span class="vm-trips" id="vmTrips"></span>
            </div>
            <h2 class="vm-name" id="vmTitle"></h2>
            <p class="vm-desc" id="vmDesc"></p>
          </div>

          <!-- Specs -->
          <div class="vm-block">
            <h3 class="vm-block-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 4.5v4c0 4 2.7 7 7 8 4.3-1 7-4 7-8v-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
              Specifications
            </h3>
            <div class="vm-specs-grid" id="vmSpecs"></div>
          </div>

          <!-- Features -->
          <div class="vm-block">
            <h3 class="vm-block-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M5 8l2.2 2.2L11 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Amenities & Features
            </h3>
            <div class="vm-features-grid" id="vmFeatures"></div>
          </div>
        </div>

        <!-- ── RIGHT PANEL ── -->
        <div class="vm-right">
          <div class="vm-pricing-card">

            <div class="vm-pricing-header">
              <p class="vm-pricing-eyebrow">Starting From</p>
              <div class="vm-price-main">
                <span class="vm-price-currency">₹</span>
                <span class="vm-price-num" id="vmPriceKm"></span>
                <span class="vm-price-unit">/ km</span>
              </div>
              <div class="vm-price-day" id="vmPriceDay"></div>
            </div>

            <div class="vm-pricing-body" id="vmPricingBody"></div>

            <!-- ★ ADVANCE PAYMENT BANNER ★ -->
            <div class="vm-advance-banner">
              <div class="vm-advance-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M1 7h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="5" cy="11" r="1" fill="currentColor"/><path d="M9 11h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              </div>
              <div class="vm-advance-content">
                <p class="vm-advance-title">Advance to Confirm Booking</p>
                <p class="vm-advance-desc"><span id="vmAdvanceAmt">&#8377;--</span>&nbsp;<span class="vm-advance-pct-badge" id="vmAdvancePctBadge">10%</span>&nbsp;advance secures your slot. Balance due on journey day.</p>
              </div>
            </div>

            <div class="vm-pricing-note">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M6.5 6v3M6.5 4.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              Tolls &amp; parking stated upfront. No hidden fees.
            </div>

            <a href="#" class="vm-book-btn" id="vmBookBtn">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="2" y="3" width="13" height="11" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 3V1.5M11.5 3V1.5M2 6.5h13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              Book This Vehicle
            </a>

            <a href="contact.html" class="vm-contact-link">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 1.5h3l1 2.5-1.5 1.5a8 8 0 003 3L8.5 7l2.5 1v3a1 1 0 01-1 1C4.3 12 1 8.7 1 2.5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3"/></svg>
              Talk to our team before booking
            </a>

            <div class="vm-trust-list">
              <div class="vm-trust-item">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1L2 3.5v3.8c0 3.5 2.2 6.5 5.5 7.7C10.8 13.8 13 10.8 13 7.3V3.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 7.5l2 2 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Fully insured rides
              </div>
              <div class="vm-trust-item">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="3.5" width="11" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 3.5V2a2 2 0 014 0v1.5M5 8h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                Free cancellation
              </div>
              <div class="vm-trust-item">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M7.5 5v3l2 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                Instant confirmation
              </div>
            </div>
          </div>
        </div>

      </div><!-- /vm-inner -->

      <!-- Sticky Mobile Footer -->
      <div class="vm-mobile-footer" id="vmMobileFooter">
        <a href="#" class="vm-book-btn-mobile-sticky" id="vmMobileStickyBookBtn">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="2" y="3" width="13" height="11" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 3V1.5M11.5 3V1.5M2 6.5h13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          Book This Vehicle
        </a>
      </div>

    </div><!-- /vm-drawer -->
  </div><!-- /vm-backdrop -->`;

  document.body.insertAdjacentHTML('beforeend', html);
}

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

function populateModal(V) {
  /* ── Populate header ── */
  document.getElementById('vmType').textContent = V.type;
  document.getElementById('vmStars').innerHTML = buildStars(V.rating);
  document.getElementById('vmRatingNum').textContent = V.rating;
  document.getElementById('vmTrips').textContent = `(${V.trips.toLocaleString()} trips)`;
  document.getElementById('vmTitle').textContent = V.name;
  document.getElementById('vmDesc').textContent = V.desc;

  /* ── Badge ── */
  const badge = document.getElementById('vmBadge');
  if (badge) {
    badge.textContent = V.badge;
    badge.className = `vm-img-badge ${V.badgeClass}`;
  }

  /* ── Gallery ── */
  const mainImg = document.getElementById('vmMainImg');
  if (mainImg) {
    mainImg.src = V.images[0];
    mainImg.alt = V.name;
  }

  const thumbs = document.getElementById('vmThumbs');
  if (thumbs) {
    thumbs.innerHTML = '';
    V.images.forEach((src, i) => {
      const t = document.createElement('button');
      t.className = `vm-thumb${i === 0 ? ' active' : ''}`;
      t.innerHTML = `<img src="${src}" alt="${V.name} view ${i + 1}" loading="lazy"/>`;
      t.addEventListener('click', () => {
        if (mainImg) {
          mainImg.classList.add('vm-img-fade');
          setTimeout(() => {
            mainImg.src = src;
            mainImg.classList.remove('vm-img-fade');
          }, 200);
        }
        thumbs.querySelectorAll('.vm-thumb').forEach(el => el.classList.remove('active'));
        t.classList.add('active');
      });
      thumbs.appendChild(t);
    });
  }

  /* ── Specs ── */
  const specsEl = document.getElementById('vmSpecs');
  if (specsEl) {
    specsEl.innerHTML = '';
    V.specs.forEach(s => {
      specsEl.insertAdjacentHTML('beforeend', `
        <div class="vm-spec-card">
          <div class="vm-spec-icon">${SPEC_ICONS[s.icon] || SPEC_ICONS.fuel}</div>
          <span class="vm-spec-label">${s.label}</span>
          <span class="vm-spec-val">${s.val}</span>
        </div>`);
    });
  }

  /* ── Features ── */
  const featEl = document.getElementById('vmFeatures');
  if (featEl) {
    featEl.innerHTML = '';
    V.features.forEach(f => {
      featEl.insertAdjacentHTML('beforeend', `
        <div class="vm-feat-item"><span class="vm-feat-icon">${FEAT_ICON}</span><span>${f}</span></div>`);
    });
  }

  /* ── Pricing ── */
  if (document.getElementById('vmPriceKm')) {
    document.getElementById('vmPriceKm').textContent = V.priceKm;
  }
  if (document.getElementById('vmPriceDay')) {
    document.getElementById('vmPriceDay').innerHTML = `or <strong>₹${V.priceDay.toLocaleString()}</strong> / day`;
  }

  const pbody = document.getElementById('vmPricingBody');
  if (pbody) {
    pbody.innerHTML = `
      <div class="vm-price-row"><span>Per Kilometre</span><strong class="hl">₹${V.priceKm}</strong></div>
      <div class="vm-price-row"><span>Per Day</span><strong>₹${V.priceDay.toLocaleString()}</strong></div>
      <div class="vm-price-row"><span>Minimum Fare</span><strong>₹${V.minFare}</strong></div>
      <div class="vm-price-row"><span>Driver Charges</span><strong>Included</strong></div>
      <div class="vm-price-row"><span>Toll / Parking</span><strong>Extra (stated upfront)</strong></div>`;
  }

  /* ── Advance Payment (Tier-Based) ── */
  const ADVANCE_RATES = { sedan: 0.10, suv: 0.15, muv: 0.15, tempo: 0.20, bus: 0.20 };
  const advRate = ADVANCE_RATES[V.bookType] || 0.10;
  const advanceAmt = Math.round(V.priceDay * advRate);
  const el_advAmt = document.getElementById('vmAdvanceAmt');
  const el_advPct = document.getElementById('vmAdvancePctBadge');
  if (el_advAmt) el_advAmt.textContent = `₹${advanceAmt.toLocaleString()}`;
  if (el_advPct) el_advPct.textContent = `${Math.round(advRate * 100)}%`;

  /* ── Book buttons ── */
  const bookingURL = `booking.html?type=${V.bookType}&vehicle=${encodeURIComponent(V.name)}`;
  if (document.getElementById('vmBookBtn')) {
    document.getElementById('vmBookBtn').href = bookingURL;
  }
  if (document.getElementById('vmMobileStickyBookBtn')) {
    document.getElementById('vmMobileStickyBookBtn').href = bookingURL;
  }

  /* ── Show modal ── */
  const modal = document.getElementById('vehicleModal');
  if (modal) {
    modal.classList.add('vm-active');
    document.body.style.overflow = 'hidden';
  }

  /* scroll modal inner to top */
  const inner = document.getElementById('vmInner');
  if (inner) inner.scrollTop = 0;

  /* reset gallery to first image */
  if (mainImg) mainImg.src = V.images[0];

  /* attach close handlers (idempotent) */
  if (modal && !modal._listenersAttached) {
    modal._listenersAttached = true;
    document.getElementById('vmClose').addEventListener('click', closeVehicleModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeVehicleModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVehicleModal(); });
  }
}

async function openVehicleModal(key) {
  injectModalHTML();

  // Show loading indicator in modal
  const inner = document.getElementById('vmInner');
  if (inner) {
    inner.innerHTML = '<div style="text-align:center;padding:60px;color:#666;">Loading vehicle details...</div>';
  }
  const modal = document.getElementById('vehicleModal');
  if (modal) {
    modal.classList.add('vm-active');
    document.body.style.overflow = 'hidden';
  }

  let V;
  // Try to use window.API if loaded
  if (window.API && window.API.public && typeof window.API.public.getVehicle === 'function') {
    try {
      const res = await window.API.public.getVehicle(key);
      if (res && res.success && res.data) {
        V = transformVehicleForModal(res.data);
      }
    } catch (e) {
      console.warn('API fetch failed, falling back to local data:', e);
    }
  }

  // Fallback to direct fetch
  if (!V) {
    const API_BASE = window.location.port === '5500' || window.location.port === '3000'
      ? 'http://localhost:5000/api/public'
      : '/api/public';
    try {
      const res = await fetch(`${API_BASE}/vehicles/${key}`);
      const result = await res.json();
      if (result && result.success && result.data) {
        V = transformVehicleForModal(result.data);
      }
    } catch (e) {
      console.warn('Direct fetch failed, falling back to local data:', e);
    }
  }

  // Fallback to local hardcoded data
  if (!V) {
    V = VEHICLE_DATA[key];
  }

  if (!V) {
    console.error('Vehicle not found:', key);
    if (inner) {
      inner.innerHTML = `<div style="text-align:center;padding:60px;color:#b8552e;"><h3>Failed to load details</h3><p style="margin:10px 0;">Vehicle not found: ${key}</p><button onclick="closeVehicleModal()" style="margin-top:10px;padding:8px 16px;cursor:pointer;border:1px solid #b8552e;background:none;border-radius:4px;color:#b8552e;">Close</button></div>`;
    }
    return;
  }

  // Re-inject layout so populateModal can bind elements correctly
  const oldModal = document.getElementById('vehicleModal');
  if (oldModal) oldModal.remove();
  injectModalHTML();

  populateModal(V);
}

function closeVehicleModal() {
  const modal = document.getElementById('vehicleModal');
  if (!modal) return;
  modal.classList.remove('vm-active');
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-vehicle]');
  if (trigger) {
    e.preventDefault();
    openVehicleModal(trigger.dataset.vehicle);
  }
});
