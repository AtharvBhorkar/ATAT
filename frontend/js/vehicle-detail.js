/* ═══════════════════════════════════════════════════════════════
   VOYAGO — vehicle-detail.js
   Handles: URL param parsing, DOM population, gallery, scroll
   effects, sticky CTA, count-up animation, similar vehicles.
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   VEHICLE DATA MAP
───────────────────────────────────────── */
const VEHICLES = {

  /* ── SEDANS ── */
  'sedan-dzire': {
    name:        'Swift Dzire',
    type:        'Sedan',
    badge:       'Best Value',
    badgeClass:  'badge--rust',
    rating:      4.8,
    trips:       1840,
    kmLakh:      28,
    ratingAvg:   '4.8',
    heroImg:     'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1920&q=85',
    description: 'India\'s most trusted compact sedan — perfect for solo travellers and couples. Fuel-efficient, nippy in city traffic, and surprisingly comfortable on long highways.',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=900&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80',
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=900&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=900&q=80',
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&q=80'
    ],
    specs: [
      { icon: 'seat',        label: 'Seating',      value: '4 Passengers' },
      { icon: 'fuel',        label: 'Fuel Type',    value: 'Petrol / CNG' },
      { icon: 'ac',          label: 'AC',           value: 'Fully AC' },
      { icon: 'luggage',     label: 'Luggage',      value: '2 Large Bags' },
      { icon: 'gearbox',     label: 'Transmission', value: 'Manual / Auto' },
      { icon: 'efficiency',  label: 'Mileage',      value: '22–26 km/L' }
    ],
    pricing: {
      perKm:   12,
      perDay:  2800,
      minFare: 350,
      toll:    'Extra, stated upfront',
      driver:  'Included'
    },
    features: [
      'Air Conditioning', 'USB Charging Port', 'GPS Navigation',
      'Music System', 'Reclining Seats', 'Sanitised After Each Trip',
      'Emergency Assistance', 'Verified Driver'
    ],
    routes: [
      { icon: '🏙️', label: 'City Transfer' },
      { icon: '✈️', label: 'Airport Pickup' },
      { icon: '🏞️', label: 'Day Outing' },
      { icon: '💼', label: 'Corporate Rides' },
      { icon: '🏔️', label: 'Hill Drives' },
      { icon: '🛤️', label: 'Highway Trips' }
    ]
  },

  'sedan-city': {
    name:        'Honda City',
    type:        'Sedan',
    badge:       'Premium',
    badgeClass:  'badge--gold',
    rating:      4.9,
    trips:       2210,
    kmLakh:      34,
    ratingAvg:   '4.9',
    heroImg:     'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&q=85',
    description: 'Step up the comfort with Honda City — spacious cabin, premium interiors and a whisper-quiet ride. Ideal for business trips and milestone occasions.',
    images: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&q=80',
      'https://images.unsplash.com/photo-1617469165786-8007eda3caa7?w=900&q=80',
      'https://images.unsplash.com/photo-1536700503339-1e771d4c635d?w=900&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80',
      'https://images.unsplash.com/photo-1493238792000-8113da705763?w=900&q=80'
    ],
    specs: [
      { icon: 'seat',        label: 'Seating',      value: '4 Passengers' },
      { icon: 'fuel',        label: 'Fuel Type',    value: 'Petrol' },
      { icon: 'ac',          label: 'AC',           value: 'Dual Zone AC' },
      { icon: 'luggage',     label: 'Luggage',      value: '2 Large Bags' },
      { icon: 'gearbox',     label: 'Transmission', value: 'CVT Automatic' },
      { icon: 'efficiency',  label: 'Mileage',      value: '18–21 km/L' }
    ],
    pricing: {
      perKm:   15,
      perDay:  3500,
      minFare: 450,
      toll:    'Extra, stated upfront',
      driver:  'Included'
    },
    features: [
      'Dual Zone AC', 'USB & Type-C Charging', 'GPS Navigation',
      'Premium Sound System', 'Leather Seats', 'Sanitised After Each Trip',
      'Sunroof', 'Verified Driver'
    ],
    routes: [
      { icon: '💼', label: 'Business Travel' },
      { icon: '✈️', label: 'Airport Pickup' },
      { icon: '🎉', label: 'Special Occasions' },
      { icon: '🏙️', label: 'City Commute' },
      { icon: '🏞️', label: 'Weekend Getaway' },
      { icon: '🛤️', label: 'Interstate Trips' }
    ]
  },

  /* ── SUVs ── */
  'suv-innova': {
    name:        'Innova Crysta',
    type:        'SUV',
    badge:       'Popular',
    badgeClass:  'badge--maroon',
    rating:      4.9,
    trips:       3120,
    kmLakh:      52,
    ratingAvg:   '4.9',
    heroImg:     'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1920&q=85',
    description: 'India\'s favourite family mover — powerful diesel engine, roomy 7-seater cabin and smooth commanding ride on any terrain. Perfect for family tours and group travel.',
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=80',
      'https://images.unsplash.com/photo-1551830820-330a71b99659?w=900&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80',
      'https://images.unsplash.com/photo-1506015391300-4802dc74ee37?w=900&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80'
    ],
    specs: [
      { icon: 'seat',        label: 'Seating',      value: '7 Passengers' },
      { icon: 'fuel',        label: 'Fuel Type',    value: 'Diesel' },
      { icon: 'ac',          label: 'AC',           value: 'Dual Roof AC' },
      { icon: 'luggage',     label: 'Luggage',      value: '4 Large Bags' },
      { icon: 'gearbox',     label: 'Transmission', value: 'Manual / Auto' },
      { icon: 'efficiency',  label: 'Mileage',      value: '14–17 km/L' }
    ],
    pricing: {
      perKm:   18,
      perDay:  4500,
      minFare: 600,
      toll:    'Extra, stated upfront',
      driver:  'Included'
    },
    features: [
      'Dual Roof AC', 'USB Charging (All Rows)', 'GPS Navigation',
      'Premium Music System', 'Captain Seats (Row 2)', 'Sanitised After Each Trip',
      '4WD Capability', 'Verified Driver'
    ],
    routes: [
      { icon: '👨‍👩‍👧‍👦', label: 'Family Tours' },
      { icon: '🏔️', label: 'Hill Stations' },
      { icon: '🛕', label: 'Pilgrimages' },
      { icon: '✈️', label: 'Group Transfers' },
      { icon: '🏕️', label: 'Adventure Trips' },
      { icon: '🎊', label: 'Group Events' }
    ]
  },

  'suv-ertiga': {
    name:        'Maruti Ertiga',
    type:        'SUV',
    badge:       'Family Fav',
    badgeClass:  'badge--rust',
    rating:      4.7,
    trips:       1560,
    kmLakh:      23,
    ratingAvg:   '4.7',
    heroImg:     'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1920&q=85',
    description: 'The Ertiga strikes a perfect balance between a compact car and a full-sized SUV. Fuel-efficient, comfortable 7-seater that handles narrow lanes and mountain roads with ease.',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
      'https://images.unsplash.com/photo-1551830820-330a71b99659?w=900&q=80'
    ],
    specs: [
      { icon: 'seat',        label: 'Seating',      value: '7 Passengers' },
      { icon: 'fuel',        label: 'Fuel Type',    value: 'Petrol / CNG' },
      { icon: 'ac',          label: 'AC',           value: 'Fully AC' },
      { icon: 'luggage',     label: 'Luggage',      value: '3 Large Bags' },
      { icon: 'gearbox',     label: 'Transmission', value: 'Manual' },
      { icon: 'efficiency',  label: 'Mileage',      value: '17–20 km/L' }
    ],
    pricing: {
      perKm:   16,
      perDay:  3800,
      minFare: 500,
      toll:    'Extra, stated upfront',
      driver:  'Included'
    },
    features: [
      'Air Conditioning', 'USB Charging Ports', 'GPS Navigation',
      'Touchscreen Infotainment', 'Foldable 3rd Row', 'Sanitised After Each Trip',
      'Roof Rails', 'Verified Driver'
    ],
    routes: [
      { icon: '👨‍👩‍👧‍👦', label: 'Family Outings' },
      { icon: '🏔️', label: 'Hill Drives' },
      { icon: '🛕', label: 'Pilgrimages' },
      { icon: '🏙️', label: 'City Transfers' },
      { icon: '🏞️', label: 'Weekend Trips' },
      { icon: '✈️', label: 'Airport Drops' }
    ]
  },

  /* ── TEMPO ── */
  'tempo': {
    name:        'Tempo Traveller',
    type:        'Tempo',
    badge:       'Group Pick',
    badgeClass:  'badge--maroon',
    rating:      4.8,
    trips:       890,
    kmLakh:      18,
    ratingAvg:   '4.8',
    heroImg:     'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=85',
    description: 'The ultimate group travel solution — our 12-seater Tempo Travellers are fully air-conditioned with push-back seats, making long pilgrimages and group tours genuinely comfortable.',
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=900&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
      'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=900&q=80'
    ],
    specs: [
      { icon: 'seat',        label: 'Seating',      value: '12 Passengers' },
      { icon: 'fuel',        label: 'Fuel Type',    value: 'Diesel' },
      { icon: 'ac',          label: 'AC',           value: 'Roof-Mounted AC' },
      { icon: 'luggage',     label: 'Luggage',      value: '8 Large Bags' },
      { icon: 'gearbox',     label: 'Transmission', value: 'Manual' },
      { icon: 'efficiency',  label: 'Mileage',      value: '10–13 km/L' }
    ],
    pricing: {
      perKm:   22,
      perDay:  6500,
      minFare: 1200,
      toll:    'Extra, stated upfront',
      driver:  'Included'
    },
    features: [
      'Roof-Mounted AC', 'Push-Back Seats', 'GPS Navigation',
      'Premium Music System', 'Reading Lights', 'Sanitised After Each Trip',
      'Luggage Boot', 'Verified Driver'
    ],
    routes: [
      { icon: '🛕', label: 'Pilgrimages' },
      { icon: '🎊', label: 'Group Events' },
      { icon: '🏔️', label: 'Hill Packages' },
      { icon: '🏕️', label: 'Adventure Tours' },
      { icon: '🏫', label: 'School Trips' },
      { icon: '💼', label: 'Corporate Groups' }
    ]
  },

  /* ── BUS ── */
  'bus': {
    name:        'Luxury Coach',
    type:        'Bus',
    badge:       'Large Groups',
    badgeClass:  'badge--maroon',
    rating:      4.7,
    trips:       420,
    kmLakh:      11,
    ratingAvg:   '4.7',
    heroImg:     'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1920&q=85',
    description: 'Our luxury coaches seat 35+ passengers in airline-style reclining seats with personal AC vents. Equipped with entertainment screens and a pantry — perfect for long-haul group journeys.',
    images: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=900&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&q=80',
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
      'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=900&q=80'
    ],
    specs: [
      { icon: 'seat',        label: 'Seating',      value: '35+ Passengers' },
      { icon: 'fuel',        label: 'Fuel Type',    value: 'Diesel' },
      { icon: 'ac',          label: 'AC',           value: 'Individual Vents' },
      { icon: 'luggage',     label: 'Luggage',      value: 'Under-Bus Storage' },
      { icon: 'gearbox',     label: 'Transmission', value: 'Manual / Automatic' },
      { icon: 'efficiency',  label: 'Mileage',      value: '6–9 km/L' }
    ],
    pricing: {
      perKm:   38,
      perDay:  14000,
      minFare: 3500,
      toll:    'Extra, stated upfront',
      driver:  'Included + Co-Driver'
    },
    features: [
      'Individual AC Vents', 'Reclining Seats', 'GPS Tracking',
      'Entertainment Screens', 'Onboard Pantry', 'Sanitised After Each Trip',
      'Emergency Exit', 'Verified Driver + Co-Driver'
    ],
    routes: [
      { icon: '🏭', label: 'Corporate Events' },
      { icon: '🛕', label: 'Group Pilgrimages' },
      { icon: '🎓', label: 'College Trips' },
      { icon: '🎊', label: 'Weddings' },
      { icon: '🏔️', label: 'Long Haul Tours' },
      { icon: '⚽', label: 'Sports Teams' }
    ]
  }
};

/* ─────────────────────────────────────────
   HELPERS
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

function getFeatureSVG(name) {
  const map = {
    'Air Conditioning':         `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12M4 4l8 8M12 4L4 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Dual Zone AC':             `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12M4 4l8 8M12 4L4 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Roof-Mounted AC':          `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12M4 4l8 8M12 4L4 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Individual AC Vents':      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12M4 4l8 8M12 4L4 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'USB Charging Port':        `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 10h6v2a3 3 0 01-6 0v-2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M6 4h4M6 6.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    'USB & Type-C Charging':    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 10h6v2a3 3 0 01-6 0v-2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'USB Charging Ports':       `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 10h6v2a3 3 0 01-6 0v-2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'USB Charging (All Rows)':  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 10h6v2a3 3 0 01-6 0v-2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'GPS Navigation':           `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C5.8 2 4 3.8 4 6c0 4 4 9 4 9s4-5 4-9c0-2.2-1.8-4-4-4z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6" r="1.5" fill="currentColor"/></svg>`,
    'GPS Tracking':             `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C5.8 2 4 3.8 4 6c0 4 4 9 4 9s4-5 4-9c0-2.2-1.8-4-4-4z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6" r="1.5" fill="currentColor"/></svg>`,
    'Music System':             `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="12" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2" stroke="currentColor" stroke-width="1.4"/><path d="M7 12V4l7-2v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'Premium Music System':     `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="12" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2" stroke="currentColor" stroke-width="1.4"/><path d="M7 12V4l7-2v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'Premium Sound System':     `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="12" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2" stroke="currentColor" stroke-width="1.4"/><path d="M7 12V4l7-2v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'Reclining Seats':          `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h4v7l5 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="2" r="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 10h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Push-Back Seats':          `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h4v7l5 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="2" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>`,
    'Captain Seats (Row 2)':    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="5" width="4" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="5" width="4" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/></svg>`,
    'Leather Seats':            `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h4v7l5 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="2" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>`,
    'Sanitised After Each Trip':`<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L4 3v3.5c0 3.5 2 6 4 7 2-1 4-3.5 4-7V3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.5 8l2 2 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'Verified Driver':          `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M3 15c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Verified Driver + Co-Driver': `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.2" stroke="currentColor" stroke-width="1.4"/><circle cx="11" cy="5" r="2.2" stroke="currentColor" stroke-width="1.4"/><path d="M2 15c0-2.5 1.8-4.5 4-4.5M9 15c0-2.5 1.8-4.5 4-4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    'Emergency Assistance':     `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v6M5 8h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    'Emergency Exit':           `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v6M5 8h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    'Sunroof':                  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="8" width="12" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 8V5l3-3 3 3v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    '4WD Capability':           `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 10V6l3-4h8l3 4v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="10" r="2" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="10" r="2" stroke="currentColor" stroke-width="1.3"/></svg>`,
    'Foldable 3rd Row':         `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M3 9h10M7 5v9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Roof Rails':               `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="6" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M3 6V4M8 6V3M13 6V4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Touchscreen Infotainment': `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M6 14h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="7.5" r="1" fill="currentColor"/></svg>`,
    'Luggage Boot':             `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Under-Bus Storage':        `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Reading Lights':           `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M8 2v1M8 13v1M2 8h1M13 8h1M3.8 3.8l.7.7M11.5 11.5l.7.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    'Onboard Pantry':           `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 2v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M3 14h10M8 8v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    'Entertainment Screens':    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M6 13h4M8 11v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
  };
  return map[name] || `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 8l2.5 2.5L11 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4"/></svg>`;
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
   MAIN INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── URL PARAM PARSING ── */
  const params  = new URLSearchParams(window.location.search);
  const type    = (params.get('type') || 'suv').toLowerCase().replace(/\s+/g, '');
  const model   = (params.get('model') || '').toLowerCase().replace(/\s+/g, '-');

  // Build key
  let key = `${type}-${model}`;
  if (!VEHICLES[key]) {
    // Try just type
    key = Object.keys(VEHICLES).find(k => k.startsWith(type)) || 'suv-innova';
  }

  const V = VEHICLES[key];

  // Update page title & meta
  document.getElementById('pageTitle').textContent = `${V.name} - Voyago Vehicle Details`;
  document.getElementById('pageDesc').setAttribute('content',
    `Book the ${V.name} with Voyago. Starting from ₹${V.pricing.perKm}/km. ${V.description}`);

  /* ── HERO ── */
  const heroBg = document.getElementById('pageHeroBg');
  if (heroBg) heroBg.style.backgroundImage = `url('${V.heroImg}')`;
  $('heroVehicleName').textContent = V.name;
  $('heroTypeBadge').textContent   = V.type + ' · Vehicle Details';
  $('heroTitle').innerHTML         = `Meet the<br><em>${V.name}</em>`;
  $('heroTitleVehicle').textContent = '';
  $('heroSub').textContent         = V.description;

  /* ── BREADCRUMB ── */
  $('heroVehicleName').textContent = V.name;

  /* ── GALLERY ── */
  const mainImg    = $('galleryMain');
  const thumbsWrap = $('galleryThumbs');
  const badge      = $('galleryBadge');

  badge.textContent  = V.badge;
  badge.className    = `gallery-badge ${V.badgeClass}`;
  mainImg.src        = V.images[0];
  mainImg.alt        = `${V.name} - main view`;

  V.images.forEach((src, i) => {
    const thumb = document.createElement('div');
    thumb.className = `gallery-thumb${i === 0 ? ' active' : ''}`;
    thumb.innerHTML = `<img src="${src}" alt="${V.name} angle ${i + 1}" loading="lazy"/><div class="gallery-thumb-overlay"></div>`;
    thumb.addEventListener('click', () => switchGalleryImage(src, thumb));
    thumbsWrap.appendChild(thumb);
  });

  function switchGalleryImage(src, clickedThumb) {
    mainImg.classList.add('switching');
    setTimeout(() => {
      mainImg.src = src;
      mainImg.classList.remove('switching');
    }, 220);
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    clickedThumb.classList.add('active');
  }

  /* ── VEHICLE INFO ── */
  $('vdTypeLabel').textContent   = V.type;
  $('vdStars').innerHTML         = buildStars(V.rating);
  $('vdRatingNum').textContent   = V.rating;
  $('vdRatingCount').textContent = `(${V.trips.toLocaleString()} trips)`;
  $('vdVehicleName').textContent = V.name;
  $('vdDesc').textContent        = V.description;

  /* ── STATS (count-up on reveal) ── */
  const statTripsEl  = $('statTrips');
  const statKmEl     = $('statKm');
  const statRatingEl = $('statRating');

  function countUp(el, target, suffix = '', decimals = 0) {
    const duration = 1200;
    const start    = performance.now();
    const isFloat  = decimals > 0;

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = target * ease;
      el.textContent = isFloat
        ? current.toFixed(decimals) + suffix
        : Math.round(current).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Observe stats section for count-up
  const statsObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    countUp(statTripsEl,  V.trips,    '+');
    countUp(statKmEl,     V.kmLakh,   '+');
    countUp(statRatingEl, parseFloat(V.ratingAvg), '', 1);
    statsObserver.disconnect();
  }, { threshold: 0.3 });

  const statsRow = qs('.vd-stats-row');
  if (statsRow) statsObserver.observe(statsRow);

  /* ── SPECS GRID ── */
  const specsGrid = $('vdSpecsGrid');
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

  /* ── FEATURES ── */
  const featuresGrid = $('vdFeaturesGrid');
  V.features.forEach(feat => {
    const item = document.createElement('div');
    item.className = 'vd-feature-item';
    item.innerHTML = `
      <span class="vd-feature-icon">${getFeatureSVG(feat)}</span>
      <span>${feat}</span>
    `;
    featuresGrid.appendChild(item);
  });

  /* ── PRICING SIDEBAR ── */
  $('sidebarPriceKm').textContent = V.pricing.perKm;
  $('sidebarDayRate').textContent = `₹${V.pricing.perDay.toLocaleString()}`;

  const breakdown = $('sidebarBreakdown');
  const pricingRows = [
    { label: 'Per Kilometre',  value: `₹${V.pricing.perKm}`,               icon: 'km',     highlight: true  },
    { label: 'Per Day',        value: `₹${V.pricing.perDay.toLocaleString()}`, icon: 'day', highlight: false },
    { label: 'Min. Fare',      value: `₹${V.pricing.minFare}`,             icon: 'min',    highlight: false },
    { label: 'Driver Charges', value: V.pricing.driver,                     icon: 'driver', highlight: false },
    { label: 'Toll / Parking', value: V.pricing.toll,                       icon: 'toll',   highlight: false }
  ];

  const rowIcons = {
    km:     `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5h10M8.5 3.5l3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    day:    `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M4 1v2M9 1v2M1 5.5h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    min:    `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 4v3l2 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    driver: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2" stroke="currentColor" stroke-width="1.4"/><path d="M2 12c0-2.5 2-4.5 4.5-4.5S11 9.5 11 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    toll:   `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 10V5l2-4h5l2 4v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="10" r="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="9" cy="10" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>`
  };

  pricingRows.forEach(row => {
    const div = document.createElement('div');
    div.className = 'pricing-row';
    div.innerHTML = `
      <span class="pricing-row-label">${rowIcons[row.icon]} ${row.label}</span>
      <span class="pricing-row-value${row.highlight ? ' highlight' : ''}">${row.value}</span>
    `;
    breakdown.appendChild(div);
  });

  /* ── ADVANCE PAYMENT BOX (Tier-Based: 10% Sedan / 15% SUV+MUV / 20% Tempo+Bus) ── */
  const ADVANCE_RATE_MAP = { sedan: 0.10, suv: 0.15, muv: 0.15, tempo: 0.20, bus: 0.20 };
  const advRate    = ADVANCE_RATE_MAP[type] || 0.10;
  const advanceAmt = Math.round(V.pricing.perDay * advRate);
  const advPct     = Math.round(advRate * 100);

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

  /* ── PRICING MOBILE ── */
  const pricingMobileWrap = $('vdPricingMobile');
  const mobileCards = [
    { label: 'Per KM', price: `₹${V.pricing.perKm}`, unit: 'per kilometre', featured: true  },
    { label: 'Per Day',price: `₹${V.pricing.perDay.toLocaleString()}`, unit: 'per day', featured: false }
  ];
  mobileCards.forEach(c => {
    const el = document.createElement('div');
    el.className = `vd-pricing-card-item${c.featured ? ' featured' : ''}`;
    el.innerHTML = `<span class="pc-label">${c.label}</span><div class="pc-price">${c.price}</div><span class="pc-unit">${c.unit}</span>`;
    $('vdPricingMobile').insertBefore(el, $('vdBookBtnMobile'));
  });

  /* ── BOOK BUTTON LINKS ── */
  const bookingURL = `booking.html?type=${type}&model=${model}&vehicle=${encodeURIComponent(V.name)}`;
  $('vdBookBtn').href           = bookingURL;
  $('vdBookBtnMobile').href     = bookingURL;
  $('mobileCtaBtn').href        = bookingURL;
  $('mobileCtaPrice').textContent = `₹${V.pricing.perKm}`;

  /* ── ROUTES ── */
  const routesGrid = $('vdRoutesGrid');
  V.routes.forEach(r => {
    const el = document.createElement('div');
    el.className = 'vd-route-tag';
    el.innerHTML = `<div class="vd-route-tag-icon"><span style="font-size:1.2rem;">${r.icon}</span></div><span>${r.label}</span>`;
    routesGrid.appendChild(el);
  });

  /* ── SIMILAR VEHICLES ── */
  buildSimilarVehicles(key, type);

  /* ─── SCROLL EFFECTS ─── */

  // Navbar scroll
  const navbar  = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
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
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    }
  });

  // Parallax hero
  const heroBgEl = document.getElementById('pageHeroBg');
  if (heroBgEl) {
    window.addEventListener('scroll', () => {
      heroBgEl.style.transform = `translateY(${window.scrollY * 0.28}px)`;
    }, { passive: true });
  }

  // Scroll indicator
  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    scrollIndicator.style.transition = 'opacity 0.4s ease';
    window.addEventListener('scroll', () => {
      scrollIndicator.style.opacity = window.scrollY > 80 ? '0' : '1';
    }, { passive: true });
  }

  // [data-reveal] IntersectionObserver
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-reveal]'));
      const idx      = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('revealed'), idx * 90);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // Mobile sticky CTA bar
  const stickyBar = document.getElementById('mobileStickyCtA');
  const hero      = document.getElementById('vdHero');
  if (stickyBar && hero) {
    const heroHeight = hero.offsetHeight;
    window.addEventListener('scroll', () => {
      stickyBar.classList.toggle('visible', window.scrollY > heroHeight * 0.6);
    }, { passive: true });
  }

}); // end DOMContentLoaded


/* ─────────────────────────────────────────
   BUILD SIMILAR VEHICLES
───────────────────────────────────────── */
function buildSimilarVehicles(currentKey, currentType) {
  const grid = document.getElementById('similarVehiclesGrid');
  if (!grid) return;

  const THUMB_FALLBACK = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=700&q=80';

  // Pick 3 other vehicles — prefer same type first
  const keys = Object.keys(VEHICLES).filter(k => k !== currentKey);
  const sameType = keys.filter(k => VEHICLES[k].type.toLowerCase() === currentType);
  const others   = keys.filter(k => VEHICLES[k].type.toLowerCase() !== currentType);
  const picks    = [...sameType, ...others].slice(0, 3);

  picks.forEach((k, i) => {
    const v       = VEHICLES[k];
    const [t, m]  = k.split('-');
    const detailURL  = `vehicle-detail.html?type=${t}&model=${m || ''}`;
    const bookURL    = `booking.html?type=${t}`;
    const img        = (v.images && v.images[0]) || THUMB_FALLBACK;

    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.setAttribute('data-reveal', '');
    card.setAttribute('data-delay', String(i * 120));
    card.innerHTML = `
      <div class="vehicle-img-wrap">
        <img src="${img}" alt="${v.name}" loading="lazy" />
        <span class="vehicle-badge ${v.badgeClass}">${v.badge}</span>
        <div class="vehicle-img-overlay">
          <a href="${detailURL}" class="quick-view-btn">View Details</a>
        </div>
      </div>
      <div class="vehicle-info">
        <div class="vehicle-header">
          <div>
            <p class="vehicle-type-label">${v.type}</p>
            <h3 class="vehicle-name">${v.name}</h3>
          </div>
          <div class="vehicle-rating">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1 3h3l-2.4 1.8.9 3L6 7.2 3.5 8.8l.9-3L2 4h3z" fill="#D9A441"/></svg>
            <span>${v.rating}</span>
          </div>
        </div>
        <p class="vehicle-desc">${v.description.substring(0, 90)}…</p>
        <div class="vehicle-specs">
          <div class="spec-item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.3" stroke="currentColor" stroke-width="1.4"/><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <span>${v.specs[0]?.value || '--'}</span>
          </div>
          <div class="spec-item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v1M7 12v1M1 7h1M12 7h1M2.9 2.9l.7.7M10.4 10.4l.7.7M10.4 3.6l.7-.7M2.9 11.1l.7-.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.4"/></svg>
            <span>${v.specs[2]?.value || 'AC'}</span>
          </div>
          <div class="spec-item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="4.5" width="10" height="7" rx="1.2" stroke="currentColor" stroke-width="1.4"/><path d="M4.5 4.5V3.5a2.5 2.5 0 015 0v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <span>${v.specs[3]?.value || '--'}</span>
          </div>
          <div class="spec-item">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 10V5l2-3h8l2 3v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="10" r="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="10" cy="10" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>
            <span>${v.specs[1]?.value.split(' ')[0] || '--'}</span>
          </div>
        </div>
        <div class="vehicle-footer">
          <div class="vehicle-price">
            <span class="price-from">from</span>
            <strong class="price-num">₹${v.pricing.perKm}</strong>
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

  // Re-observe the new cards
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-reveal]'));
      const idx      = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('revealed'), idx * 100);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.06 });

  grid.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
}
