/* ═══════════════════════════════════════════════════
   AMAN TOUR AND TRAVELS — booking.js
   DB-driven vehicles, itinerary download, full backend integration
   ═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ─── DB DATA (fetched from backend) ─── */
  let dbVehicles = [];
  let dbPackages = [];
  let vehiclesLoaded = false;
  let packagesLoaded = false;

  // Fetch real vehicles from database
  fetch('/api/vehicles')
    .then(r => r.json())
    .then(res => {
      if (res.success && res.data && res.data.length > 0) {
        dbVehicles = res.data;
        vehiclesLoaded = true;
        console.log(`✅ Loaded ${dbVehicles.length} vehicles from DB`);
        renderVehiclesList();
      } else {
        console.warn('⚠ No vehicles from DB, using fallback data');
        loadFallbackVehicles();
      }
    })
    .catch(err => {
      console.error('❌ Vehicle fetch failed:', err);
      loadFallbackVehicles();
    });

  // Fetch real packages from database
  fetch('/api/public/packages')
    .then(r => r.json())
    .then(res => {
      if (res.success && res.data) {
        dbPackages = res.data;
        packagesLoaded = true;
        console.log(`✅ Loaded ${dbPackages.length} packages from DB`);
        // If we were waiting for packages to init package mode, do it now
        if (isPackageMode && !packageModeInitialized) {
          initPackageMode();
        }
      } else {
        console.warn('⚠ No packages from DB, using fallback data');
        loadFallbackPackages();
      }
    })
    .catch(err => {
      console.warn('⚠ Package fetch failed, using fallback data:', err);
      loadFallbackPackages();
    });

  /* ─── FALLBACK VEHICLES (used when API fails) ─── */
  function loadFallbackVehicles() {
    dbVehicles = [
      { _id: 'fb-sedan-1', name: 'Swift Dzire', type: 'sedan', brand: 'Maruti Suzuki', model: 'Swift Dzire VXI', seats: 4, luggage: 2, image: '' },
      { _id: 'fb-sedan-2', name: 'Honda City', type: 'sedan', brand: 'Honda', model: 'City ZX CVT', seats: 4, luggage: 2, image: '' },
      { _id: 'fb-suv-1', name: 'Maruti Ertiga', type: 'suv', brand: 'Maruti Suzuki', model: 'Ertiga ZXI+', seats: 7, luggage: 3, image: '' },
      { _id: 'fb-suv-2', name: 'Toyota Innova Crysta', type: 'suv', brand: 'Toyota', model: 'Innova Crysta GX', seats: 7, luggage: 4, image: '' },
      { _id: 'fb-psuv-1', name: 'Toyota Fortuner', type: 'premium-suv', brand: 'Toyota', model: 'Fortuner Legender', seats: 7, luggage: 4, image: '' },
      { _id: 'fb-tempo-1', name: 'Force Tempo Traveller 12', type: 'tempo', brand: 'Force', model: 'Tempo Traveller 12 Seater', seats: 12, luggage: 6, image: '' },
      { _id: 'fb-tempo-2', name: 'Force Tempo Traveller 17', type: 'tempo', brand: 'Force', model: 'Tempo Traveller 17 Seater', seats: 17, luggage: 8, image: '' },
      { _id: 'fb-bus-1', name: 'Luxury 30-Seater Bus', type: 'bus', brand: 'Ashok Leyland', model: 'Viking 30 Seater AC', seats: 30, luggage: 15, image: '' },
      { _id: 'fb-bus-2', name: 'Luxury 45-Seater Bus', type: 'bus', brand: 'BharatBenz', model: '1017 45 Seater AC', seats: 45, luggage: 20, image: '' }
    ];
    vehiclesLoaded = true;
    renderVehiclesList();
  }

  /* ─── FALLBACK PACKAGES (used when API fails) ─── */
  let packagesData = {};

  function loadFallbackPackages() {
    packagesData = {
      'shimla-manali': {
        id: 'shimla-manali', name: 'Shimla–Manali Grand Tour', category: 'Hill Station',
        categoryClass: 'hill', duration: '6 Days / 5 Nights', rating: '4.8 (2.4k reviews)',
        stars: '★★★★★', price: 18500,
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        desc: 'Explore the majestic hills of Shimla and Manali with snow-capped peaks and lush pine forests.',
        highlights: ['Shimla Ridge & Mall Road', 'Solang Valley adventure sports', 'Kullu Valley views', 'Atal Tunnel drive'],
        itinerary: [
          { title: "Delhi to Shimla", desc: "Scenic drive, check-in, evening Mall Road walk." },
          { title: "Shimla & Kufri", desc: "Kufri snow viewpoint, Jakhoo Temple, colonial churches." },
          { title: "Shimla to Manali", desc: "Travel via Kullu Valley, visit Pandoh Dam." },
          { title: "Manali Sightseeing", desc: "Hadimba Temple, Vashisht Hot Springs, markets." },
          { title: "Solang Valley", desc: "Paragliding, snow play, adventure activities." },
          { title: "Return to Delhi", desc: "Morning drive back." }
        ],
        inclusions: ['AC Sedan transport', '3★ Hotel stays', 'Daily breakfast & dinner', 'Tolls, permits & driver allowance'],
        exclusions: ['Flight/train tickets', 'Lunch & snacks', 'Adventure charges', 'Guide tips'],
        stays: 'Standard 3-Star Hotels', route: 'Delhi - Shimla - Manali - Delhi', defaultVehicle: 'sedan'
      },
      'char-dham': {
        id: 'char-dham', name: 'Char Dham Yatra', category: 'Pilgrimage',
        categoryClass: 'pilgrimage', duration: '12 Days / 11 Nights', rating: '4.9 (4.1k reviews)',
        stars: '★★★★★', price: 32000,
        img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80',
        desc: 'Sacred circuit of Yamunotri, Gangotri, Kedarnath & Badrinath.',
        highlights: ['Yamunotri & Gangotri temples', 'Kedarnath trek & Aarti', 'Badrinath darshan', 'Mana Village'],
        itinerary: [
          { title: "Haridwar to Barkot", desc: "Drive via Mussoorie." },
          { title: "Yamunotri Darshan", desc: "Trek to temple, holy bath." },
          { title: "Barkot to Uttarkashi", desc: "Scenic Ganga River drive." },
          { title: "Gangotri Excursion", desc: "Holy dip, return to Uttarkashi." },
          { title: "Uttarkashi to Guptkashi", desc: "Along Mandakini River." },
          { title: "Kedarnath Trek Up", desc: "16km trek, evening Aarti." },
          { title: "Kedarnath Trek Down", desc: "Morning prayers, trek back." },
          { title: "Guptkashi to Badrinath", desc: "Drive, evening darshan." },
          { title: "Badrinath to Rudraprayag", desc: "Mana Village, confluence." },
          { title: "Rudraprayag to Rishikesh", desc: "Laxman Jhula visit." },
          { title: "Haridwar Ganga Aarti", desc: "Har Ki Pauri Aarti." },
          { title: "Departure", desc: "Checkout and transfer." }
        ],
        inclusions: ['Private SUV / Tempo', 'Yatra stays', 'Vegetarian meals', 'Permits & driver fees'],
        exclusions: ['Helicopter tickets', 'Lunch', 'Pony/Doli fees'],
        stays: 'Deluxe Yatra Hotels', route: 'Haridwar - Kedarnath - Badrinath - Haridwar', defaultVehicle: 'suv'
      },
      'goa-retreat': {
        id: 'goa-retreat', name: 'Goa Coastal Retreat', category: 'Weekend Escape',
        categoryClass: 'weekend', duration: '3 Days / 2 Nights', rating: '4.7 (1.8k reviews)',
        stars: '★★★★★', price: 9800,
        img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80',
        desc: "Sun, sand, and seafood on India's favourite coastline.",
        highlights: ['North Goa beaches', 'Panjim Latin quarter', 'Fort Aguada', 'Sunset cruise'],
        itinerary: [
          { title: "Arrival & Beaches", desc: "Transfer, Baga & Calangute beaches." },
          { title: "South Goa Tour", desc: "Basilica of Bom Jesus, spice farm." },
          { title: "Fort Aguada & Departure", desc: "Explore fort, shopping, drop-off." }
        ],
        inclusions: ['AC Cab transfers', 'Beach Resort stay', 'Daily breakfast', 'Fort entrance'],
        exclusions: ['Water sports', 'Lunch & dinner', 'Cruise tickets'],
        stays: '3★ Beachfront Resort', route: 'Goa Airport - Goa - Airport', defaultVehicle: 'sedan'
      },
      'lonavala': {
        id: 'lonavala', name: 'Lonavala & Khandala', category: 'Weekend Escape',
        categoryClass: 'weekend', duration: '2 Days / 1 Night', rating: '4.5 (820 reviews)',
        stars: '★★★★☆', price: 5500,
        img: 'https://placehold.co/1200x600/6E1F2B/ffffff?text=Lonavala+%26+Khandala',
        desc: 'Monsoon valleys, waterfalls, and scenic drives near Pune.',
        highlights: ['Tiger Point viewpoints', 'Karla & Bhaja caves', 'Bhushi Dam', 'Fudge tasting'],
        itinerary: [
          { title: "To Lonavala", desc: "Karla Caves, wax museum, lake." },
          { title: "Khandala & Return", desc: "Tiger Point, Bhushi Dam, return." }
        ],
        inclusions: ['AC Sedan roundtrip', 'Resort stay', 'Breakfast', 'Tolls & driver'],
        exclusions: ['Cave entries', 'Lunch & dinner', 'Activities'],
        stays: 'Zara Resort or equivalent', route: 'Mumbai/Pune - Lonavala - Return', defaultVehicle: 'sedan'
      },
      'mahabaleshwar': {
        id: 'mahabaleshwar', name: 'Mahabaleshwar Strawberry Escape', category: 'Weekend Escape',
        categoryClass: 'weekend', duration: '3 Days / 2 Nights', rating: '4.6 (1.1k reviews)',
        stars: '★★★★★', price: 8200,
        img: 'https://placehold.co/1200x600/6E1F2B/ffffff?text=Mahabaleshwar',
        desc: 'Strawberry farms, spectacular viewpoints, and Venna Lake boat rides.',
        highlights: ['Mapro farm visits', "Arthur's Seat views", 'Venna Lake boating', 'Table Land walk'],
        itinerary: [
          { title: "Pune to Mahabaleshwar", desc: "Drive, check-in, evening boating." },
          { title: "Sightseeing", desc: "Arthur's Seat, strawberry garden, Mapro." },
          { title: "Panchgani & Return", desc: "Table Land, drive back to Pune." }
        ],
        inclusions: ['AC Sedan/SUV cab', 'Resort stay', 'Breakfast & dinner', 'Tolls & driver'],
        exclusions: ['Boat tickets', 'Lunch', 'Horse riding'],
        stays: 'Evershine Resort', route: 'Pune - Mahabaleshwar - Pune', defaultVehicle: 'suv'
      },
      'varanasi': {
        id: 'varanasi', name: 'Varanasi & Prayagraj', category: 'Pilgrimage',
        categoryClass: 'pilgrimage', duration: '5 Days / 4 Nights', rating: '4.9 (1.5k reviews)',
        stars: '★★★★★', price: 14500,
        img: 'https://placehold.co/1200x600/6E1F2B/ffffff?text=Varanasi',
        desc: 'Ganga Aarti, ancient temples, and Triveni Sangam.',
        highlights: ['Dashashwamedh Ghat Aarti', 'Subah-e-Banaras boat', 'Kashi Vishwanath', 'Triveni Sangam'],
        itinerary: [
          { title: "Arrival", desc: "Check-in, evening Ganga Aarti." },
          { title: "Temples & Sarnath", desc: "Kashi Vishwanath, Sarnath Stupa." },
          { title: "Prayagraj", desc: "Triveni Sangam boat ride." },
          { title: "Heritage Walk", desc: "Ancient ghats, weavers lane." },
          { title: "Sunrise Boat & Departure", desc: "Morning boat, checkout." }
        ],
        inclusions: ['AC Cab tours', 'Heritage hotel', 'Vegetarian breakfast', 'Sangam boat'],
        exclusions: ['Private boat', 'Lunch & dinner', 'Offerings'],
        stays: 'Heritage Haveli Hotel', route: 'Varanasi - Prayagraj - Varanasi', defaultVehicle: 'suv'
      },
      'tirupati': {
        id: 'tirupati', name: 'Tirupati Balaji Darshan', category: 'Pilgrimage',
        categoryClass: 'pilgrimage', duration: '3 Days / 2 Nights', rating: '4.9 (2.8k reviews)',
        stars: '★★★★★', price: 8900,
        img: 'https://placehold.co/1200x600/6E1F2B/ffffff?text=Tirupati',
        desc: 'Hassle-free pilgrimage with VIP darshan passes.',
        highlights: ['VIP Tirumala Darshan', 'Venkateswara Temple', 'Padmavathi Temple', 'Sreevari Padaalu'],
        itinerary: [
          { title: "Chennai to Tirupati", desc: "Drive, Padmavathi Temple." },
          { title: "VIP Darshan", desc: "Tirumala Hills, special entry, viewpoints." },
          { title: "Return", desc: "Kalyana Venkateswara, drive back." }
        ],
        inclusions: ['AC Sedan', 'Hotel stay', 'Vegetarian breakfast', 'VIP passes'],
        exclusions: ['Lunch & dinner', 'Tonsuring fee', 'Personal pujas'],
        stays: 'Fortune Select Grand Ridge', route: 'Chennai - Tirupati - Chennai', defaultVehicle: 'sedan'
      },
      'coorg-coffee': {
        id: 'coorg-coffee', name: 'Coorg Coffee & Mist', category: 'Hill Station',
        categoryClass: 'hill', duration: '4 Days / 3 Nights', rating: '4.7 (950 reviews)',
        stars: '★★★★★', price: 13200,
        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
        desc: 'Coffee estates, misty waterfalls, and mountain breezes.',
        highlights: ['Golden Temple monastery', 'Abbey Falls trail', 'Coffee plantation walk', "Raja's Seat sunset"],
        itinerary: [
          { title: "Bangalore to Coorg", desc: "Drive, Bylakuppe Golden Temple." },
          { title: "Talacauvery", desc: "Cauvery source, Bhagamandala." },
          { title: "Estates & Falls", desc: "Plantation tour, Abbey Falls, sunset." },
          { title: "Dubare & Return", desc: "Elephant camp, drive back." }
        ],
        inclusions: ['Roundtrip cab', 'Estate Villa stay', 'Breakfast', 'Driver charges'],
        exclusions: ['Elephant camp entry', 'Lunch & dinner', 'Activities'],
        stays: 'Coorg Premium Estate Villas', route: 'Bangalore - Coorg - Bangalore', defaultVehicle: 'sedan'
      },
      'ooty': {
        id: 'ooty', name: 'Ooty & Kodaikanal Escapade', category: 'Hill Station',
        categoryClass: 'hill', duration: '5 Days / 4 Nights', rating: '4.6 (640 reviews)',
        stars: '★★★★★', price: 14900,
        img: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=600&q=80',
        desc: 'Tea gardens of Ooty and misty pine forests of Kodaikanal.',
        highlights: ['Ooty Lake boating', 'Doddabetta Peak', 'Pine Forests walk', "Coaker's Walk"],
        itinerary: [
          { title: "Coimbatore to Ooty", desc: "Drive, check-in, leisure evening." },
          { title: "Ooty Tour", desc: "Botanical Gardens, tea factory, lake." },
          { title: "Ooty to Kodaikanal", desc: "Drive, evening Kodai Lake." },
          { title: "Kodaikanal Tour", desc: "Pillar Rocks, Pine Forests, Coaker's Walk." },
          { title: "Return", desc: "Drive back to Coimbatore." }
        ],
        inclusions: ['AC Sedan/SUV', 'Heritage Hotel', 'Breakfast & dinner', 'Tolls & permits'],
        exclusions: ['Boating tickets', 'Lunch', 'Entrance charges'],
        stays: 'Savoy IHCL Ooty & Lakeview Kodai', route: 'Coimbatore - Ooty - Kodaikanal - Coimbatore', defaultVehicle: 'sedan'
      }
    };
    packagesLoaded = true;
    // If we were waiting for packages to init package mode, do it now
    if (isPackageMode && !packageModeInitialized) {
      initPackageMode();
    }
  }

  /* ─── FALLBACK ROUTES DATABASE ─── */
  const routesDatabase = {
    'mumbai-pune': { distance: 150, duration: '2h 45m' },
    'mumbai-lonavala': { distance: 85, duration: '1h 50m' },
    'mumbai-shirdi': { distance: 240, duration: '4h 30m' },
    'mumbai-nashik': { distance: 170, duration: '3h 15m' },
    'mumbai-mahabaleshwar': { distance: 260, duration: '5h 15m' },
    'mumbai-goa': { distance: 600, duration: '11h 00m' },
    'pune-lonavala': { distance: 65, duration: '1h 20m' },
    'pune-shirdi': { distance: 185, duration: '3h 45m' },
    'pune-nashik': { distance: 210, duration: '4h 30m' },
    'pune-mahabaleshwar': { distance: 120, duration: '3h 00m' },
    'pune-goa': { distance: 450, duration: '9h 00m' },
    'lonavala-mahabaleshwar': { distance: 180, duration: '3h 50m' },
    'shirdi-nashik': { distance: 90, duration: '1h 45m' },
    'mumbai-aurangabad': { distance: 330, duration: '6h 00m' },
    'pune-aurangabad': { distance: 260, duration: '5h 00m' },
    'mumbai-nagpur': { distance: 820, duration: '14h 00m' },
    'pune-nagpur': { distance: 720, duration: '12h 30m' },
    'mumbai-surat': { distance: 290, duration: '5h 30m' },
    'mumbai-ahmedabad': { distance: 530, duration: '9h 00m' },
    'pune-bangalore': { distance: 840, duration: '14h 00m' },
    'mumbai-delhi': { distance: 1400, duration: '22h 00m' },
    'pune-hyderabad': { distance: 560, duration: '10h 00m' },
    'mumbai-chennai': { distance: 1330, duration: '21h 00m' },
    'delhi-jaipur': { distance: 270, duration: '5h 00m' },
    'delhi-shimla': { distance: 350, duration: '7h 00m' },
    'delhi-manali': { distance: 540, duration: '11h 00m' },
    'bangalore-coorg': { distance: 250, duration: '5h 00m' },
    'bangalore-ooty': { distance: 280, duration: '6h 00m' },
    'chennai-tirupati': { distance: 130, duration: '3h 00m' },
    'delhi-varanasi': { distance: 820, duration: '13h 00m' }
  };

  /* ─── PRICING CONFIG (maps vehicle type → rates) ─── */
  const vehiclePricingConfig = {
    'sedan':       { rate: 18, baseFare: 2850, driverAllowance: 400, tollParking: 350, icon: '🚗' },
    'suv':         { rate: 24, baseFare: 3600, driverAllowance: 500, tollParking: 450, icon: '🚙' },
    'premium-suv': { rate: 28, baseFare: 4200, driverAllowance: 600, tollParking: 500, icon: '🏆' },
    'tempo':       { rate: 35, baseFare: 5500, driverAllowance: 800, tollParking: 600, icon: '🚌' },
    'bus':         { rate: 45, baseFare: 8000, driverAllowance: 1000, tollParking: 800, icon: '🚍' }
  };

  /* ─── OUTSTATION PLANS CONFIG (From User Image Table) ─── */
  const outstationPlansConfig = {
    'hatchback': {
      name: 'Hatchback',
      rate: 11,
      minKmPerDay: 250,
      driverTaPerDay: 200,
      maxPassengers: 4
    },
    'sedan': {
      name: 'Sedan',
      rate: 13,
      minKmPerDay: 250,
      driverTaPerDay: 200,
      maxPassengers: 4
    },
    'luxury-sedan': {
      name: 'Luxury Sedan',
      rate: 15,
      minKmPerDay: 250,
      driverTaPerDay: 200,
      maxPassengers: 4
    },
    'suv': {
      name: 'SUV (Ertiga/Karens)',
      rate: 16,
      minKmPerDay: 250,
      driverTaPerDay: 200,
      maxPassengers: 6
    },
    'premium-suv': {
      name: 'SUV (Innova Crysta)',
      rate: 21,
      minKmPerDay: 250,
      driverTaPerDay: 200,
      maxPassengers: 6
    },
    'tempo': {
      name: 'Mini Bus (Traveller)',
      rate: 32,
      minKmPerDay: 250,
      driverTaPerDay: 200,
      maxPassengers: 20
    },
    'bus': {
      name: 'Mini Bus (Traveller)',
      rate: 32,
      minKmPerDay: 250,
      driverTaPerDay: 200,
      maxPassengers: 20
    }
  };

  function getOutstationConfigForVehicle(v) {
    if (!v) return outstationPlansConfig['sedan'];
    const type = (v.type || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    if (type === 'hatchback' || name.includes('wagonr') || name.includes('alto') || name.includes('wagnor')) return outstationPlansConfig['hatchback'];
    if (type === 'sedan') {
      if (name.includes('amaze') || name.includes('ciaz') || name.includes('etios')) return outstationPlansConfig['luxury-sedan'];
      return outstationPlansConfig['sedan'];
    }
    if (type === 'suv') {
      if (name.includes('innova') || name.includes('crysta')) return outstationPlansConfig['premium-suv'];
      return outstationPlansConfig['suv'];
    }
    if (type === 'premium-suv') return outstationPlansConfig['premium-suv'];
    if (type === 'tempo' || type === 'bus' || name.includes('traveller') || name.includes('tempo')) return outstationPlansConfig['tempo'];
    if (outstationPlansConfig[type]) return outstationPlansConfig[type];
    return outstationPlansConfig['sedan'];
  }

  /* ─── LOCAL TRAVEL PACKAGES CONFIG (From User Image Table) ─── */
  const localPlansConfig = {
    'hatchback': {
      name: 'Hatchback',
      halfDay: { hrs: 4, km: 40, fare: 700 },
      eightHrs: { hrs: 8, km: 80, fare: 1300 },
      fullDay: { hrs: 12, km: 180, fare: 2200 },
      extraKmRate: 11,
      extraHrRate: 100,
      nightCharge: 200,
      maxPassengers: 4
    },
    'sedan': {
      name: 'Sedan',
      halfDay: { hrs: 4, km: 40, fare: 900 },
      eightHrs: { hrs: 8, km: 80, fare: 1600 },
      fullDay: { hrs: 12, km: 180, fare: 2700 },
      extraKmRate: 13,
      extraHrRate: 100,
      nightCharge: 200,
      maxPassengers: 4
    },
    'luxury-sedan': {
      name: 'Luxury Sedan',
      halfDay: { hrs: 4, km: 40, fare: 1000 },
      eightHrs: { hrs: 8, km: 80, fare: 1800 },
      fullDay: { hrs: 12, km: 180, fare: 3500 },
      extraKmRate: 15,
      extraHrRate: 120,
      nightCharge: 200,
      maxPassengers: 4
    },
    'suv': {
      name: 'SUV (Ertiga/Karens)',
      halfDay: null,
      eightHrs: { hrs: 8, km: 80, fare: 2500 },
      fullDay: { hrs: 12, km: 180, fare: 3800 },
      extraKmRate: 16,
      extraHrRate: 200,
      nightCharge: 250,
      maxPassengers: 6
    },
    'premium-suv': {
      name: 'SUV (Innova Crysta)',
      halfDay: null,
      eightHrs: { hrs: 8, km: 80, fare: 3000 },
      fullDay: { hrs: 12, km: 180, fare: 4800 },
      extraKmRate: 21,
      extraHrRate: 200,
      nightCharge: 250,
      maxPassengers: 6
    }
  };

  function getLocalConfigForVehicle(v) {
    if (!v) return localPlansConfig['sedan'];
    const type = (v.type || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    if (type === 'hatchback' || name.includes('wagonr') || name.includes('alto') || name.includes('wagnor')) return localPlansConfig['hatchback'];
    if (type === 'sedan') {
      if (name.includes('amaze') || name.includes('ciaz') || name.includes('etios')) return localPlansConfig['luxury-sedan'];
      return localPlansConfig['sedan'];
    }
    if (type === 'suv') {
      if (name.includes('innova') || name.includes('crysta')) return localPlansConfig['premium-suv'];
      return localPlansConfig['suv'];
    }
    if (type === 'premium-suv') return localPlansConfig['premium-suv'];
    if (localPlansConfig[type]) return localPlansConfig[type];
    return localPlansConfig['sedan'];
  }

  /* ─── NOMINATIM (GEOCODING) + OSRM (ROUTING) — free, no API key needed ─── */
  async function getRouteFromORS(from, to) {
    try {
      // 1. Pickup ko geocode karo
      const pickupCoords = await geocodeLocation(from);
      if (!pickupCoords) throw new Error('Pickup location not resolved');

      // 2. Dropoff ko geocode karo
      const dropoffCoords = await geocodeLocation(to);
      if (!dropoffCoords) throw new Error('Dropoff location not resolved');

      // 3. OSRM se actual road route mango
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${dropoffCoords.lon},${dropoffCoords.lat}?overview=false`;
      const routeRes = await fetch(osrmUrl);
      const routeData = await routeRes.json();

      if (!routeData.routes || routeData.routes.length === 0) {
        throw new Error('OSRM route calculation failed');
      }

      const distanceInMeters = routeData.routes[0].distance;
      const durationInSeconds = routeData.routes[0].duration;

      const distanceInKm = Math.round(distanceInMeters / 1000);
      const hours = Math.floor(durationInSeconds / 3600);
      const mins = Math.round((durationInSeconds % 3600) / 60);
      const durationStr = `${hours}h ${mins}m`;

      console.log(`✅ Live route calculated: ${distanceInKm} km, duration: ${durationStr}`);
      return { distance: distanceInKm, duration: durationStr };
    } catch (err) {
      console.warn('⚠ Live routing failed, reverting to local routing database:', err);
      return null;
    }
  }

  // Nominatim se city/address ka lat-lng nikalne wala helper function
  async function geocodeLocation(placeName) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1&countrycodes=in`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }

  function parseDurationToHours(durationStr) {
    if (!durationStr) return 0;
    const parts = durationStr.split(' ');
    let hours = 0;
    let mins = 0;
    parts.forEach(p => {
      if (p.endsWith('h')) hours = parseInt(p.replace('h', ''), 10) || 0;
      if (p.endsWith('m')) mins = parseInt(p.replace('m', ''), 10) || 0;
    });
    return hours + (mins / 60);
  }

  function isNightTime(timeStr) {
    if (!timeStr) return false;
    const [h] = timeStr.split(':').map(Number);
    return h >= 22 || h < 6;
  }

  /* ─── VEHICLE IMAGE MAP — local /assets/images/vehicles/ ─── */
  const vehicleImageMap = {
    'sedan':       '/assets/images/vehicles/sedan.png',
    'suv':         '/assets/images/vehicles/suv.png',
    'premium-suv': '/assets/images/vehicles/premium-suv.png',
    'tempo':       '/assets/images/vehicles/tempo-traveller.png',
    'bus':         '/assets/images/vehicles/bus.png',
    'innova':      '/assets/images/vehicles/suv.png',
    'ertiga':      '/assets/images/vehicles/suv.png',
    'swift-dzire': '/assets/images/vehicles/sedan.png',
    'honda-city':  '/assets/images/vehicles/sedan.png',
    'marazzo':     '/assets/images/vehicles/tempo-traveller.png',
    'traveller':   '/assets/images/vehicles/tempo-traveller.png',
    'force-tempo': '/assets/images/vehicles/tempo-traveller.png'
  };

  function getVehicleImage(vehicle) {
    if (vehicle.image) {
      if (vehicle.image.startsWith('http://') || vehicle.image.startsWith('https://')) return vehicle.image;
      if (vehicle.image.startsWith('/')) return vehicle.image;
      return '/assets/images/vehicles/' + vehicle.image;
    }
    const vType = (vehicle.type || '').toLowerCase().trim();
    if (vehicleImageMap[vType]) return vehicleImageMap[vType];
    const vName = (vehicle.name || vehicle.slug || '').toLowerCase().trim().replace(/\s+/g, '-');
    if (vehicleImageMap[vName]) return vehicleImageMap[vName];
    for (const [key, img] of Object.entries(vehicleImageMap)) {
      if (vName.includes(key) || vType.includes(key)) return img;
    }
    const label = encodeURIComponent((vehicle.name || vehicle.type || 'Vehicle').substring(0, 15));
    return `https://placehold.co/400x220/6E1F2B/ffffff?text=${label}`;
  }

  /* ─── STATE ─── */
  /* ─── STATE ─── */
  let currentStep = 1;
  let selectedVehicleId = null;
  let selectedVehicleType = 'sedan';
  let tripType = 'One Way';
  let calculatedDistance = 150;
  let calculatedDuration = '2h 45m';
  let isPackageMode = false;
  let selectedPackageId = null;
  let packageModeInitialized = false;
  let lastBookingResponse = null;
  let lastBookingPayload = null;
  let lastFareBreakdown = { baseFare: 0, distanceCharge: 0, driverAllowance: 0, tollParking: 0, taxes: 0, total: 0 };
  let lastFetchedFrom = '';
  let lastFetchedTo = '';
  

  const popularLocations = [
    'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Lonavala, Maharashtra',
    'Shirdi, Maharashtra', 'Nashik, Maharashtra', 'Mahabaleshwar, Maharashtra',
    'Goa', 'Alibaug, Maharashtra', 'Panchgani, Maharashtra',
    'Kolhapur, Maharashtra', 'Aurangabad, Maharashtra', 'Nagpur, Maharashtra',
    'Thane, Maharashtra', 'Navi Mumbai, Maharashtra', 'Surat, Gujarat',
    'Ahmedabad, Gujarat', 'Bangalore, Karnataka', 'Hyderabad, Telangana',
    'Delhi', 'Chennai, Tamil Nadu', 'Jaipur, Rajasthan'
  ];

  /* ─── DOM REFERENCES ─── */
  const stepIndicators = [
    document.getElementById('stepIndicator1'), document.getElementById('stepIndicator2'),
    document.getElementById('stepIndicator3'), document.getElementById('stepIndicator4'),
    document.getElementById('stepIndicator5')
  ];
  const stepViews = {
    1: document.getElementById('stepView1'), 2: document.getElementById('stepView2'),
    3: document.getElementById('stepView3'), 4: document.getElementById('stepView4'),
    5: document.getElementById('stepView5'), 'loading': document.getElementById('stepViewLoading'),
    'success': document.getElementById('stepViewSuccess')
  };
  const progressFill = document.getElementById('progressFill');
  const pickupInput = document.getElementById('pickupInput');
  const dropoffInput = document.getElementById('dropoffInput');
  const journeyDateInput = document.getElementById('journeyDateInput');
  const journeyTimeInput = document.getElementById('journeyTimeInput');
  const swapLocationsBtn = document.getElementById('swapLocationsBtn');
  const typeOneWayBtn = document.getElementById('typeOneWayBtn');
  const typeRoundTripBtn = document.getElementById('typeRoundTripBtn');
  const returnDateInput = document.getElementById('returnDateInput');
  const returnDateGroup = document.getElementById('returnDateGroup');
  const returnDateLabel = document.getElementById('returnDateLabel');
  const returnDateWrapper = document.getElementById('returnDateWrapper');
  const localToggle = document.getElementById('localToggle');
  const localPlanGroup = document.getElementById('localPlanGroup');
  const localPlanSelect = document.getElementById('localPlanSelect');
  const outstationToggle = document.getElementById('outstationToggle');
  const pickupSuggestions = document.getElementById('pickupSuggestions');
  const dropoffSuggestions = document.getElementById('dropoffSuggestions');
  const vehiclesContainer = document.getElementById('vehiclesContainer');
  const custName = document.getElementById('custName');
  const custEmail = document.getElementById('custEmail');
  const custPhone = document.getElementById('custPhone');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');
  const sidebarSecureBtn = document.getElementById('sidebarSecureBtn');
  const successResId = document.getElementById('successResId');
  const successEmail = document.getElementById('successEmail');
  const downloadItineraryBtn = document.getElementById('downloadItineraryBtn');
  const summaryRoute = document.getElementById('summaryRoute');
  const summaryDistance = document.getElementById('summaryDistance');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryTripType = document.getElementById('summaryTripType');
  const summaryBaseFare = document.getElementById('summaryBaseFare');
  const summaryDistanceCharge = document.getElementById('summaryDistanceCharge');
  const summaryDriverAllowance = document.getElementById('summaryDriverAllowance');
  const summaryTollParking = document.getElementById('summaryTollParking');
  const summaryTaxes = document.getElementById('summaryTaxes');
  const summaryTotal = document.getElementById('summaryTotal');
  const goToStep2Btn = document.getElementById('goToStep2Btn');
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const goToStep3Btn = document.getElementById('goToStep3Btn');
  const backToStep2Btn = document.getElementById('backToStep2Btn');
  const goToStep4Btn = document.getElementById('goToStep4Btn');
  const backToStep3Btn = document.getElementById('backToStep3Btn');
  const goToStep5Btn = document.getElementById('goToStep5Btn');
  const backToStep4Btn = document.getElementById('backToStep4Btn');
  const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
  const step5ReviewContent = document.getElementById('step5ReviewContent');

  /* ═══════════════════════════════════════
     INITIALIZATION
     ═══════════════════════════════════════ */
  const urlParams = new URLSearchParams(window.location.search);
  const packageParam = urlParams.get('package');

  // Check if this is a package booking
  if (packageParam) {
    const pkgSlug = packageParam.toLowerCase().trim();
    // Try to find in fallback data first (synchronous)
    if (packagesData[pkgSlug]) {
      isPackageMode = true;
      selectedPackageId = pkgSlug;
      initPackageMode();
    } else {
      // Will be initialized after DB/fallback packages load
      isPackageMode = true;
      selectedPackageId = pkgSlug;
      // If fallback data loads first, it will call initPackageMode
      // If DB data loads first, we need to check there too
    }
  } else {
    // Normal booking mode — apply URL params
    if (urlParams.get('pickup')) pickupInput.value = urlParams.get('pickup');
    if (urlParams.get('dropoff')) dropoffInput.value = urlParams.get('dropoff');
    if (urlParams.get('date')) journeyDateInput.value = urlParams.get('date');
    if (urlParams.get('time')) journeyTimeInput.value = urlParams.get('time');

    const typeParam = urlParams.get('type');
    if (typeParam && typeParam.toLowerCase().includes('round')) {
      tripType = 'Round Trip';
      if (typeRoundTripBtn) typeRoundTripBtn.classList.add('active');
      if (typeOneWayBtn) typeOneWayBtn.classList.remove('active');
      returnDateInput.disabled = false;
      returnDateWrapper.classList.remove('disabled');
      returnDateWrapper.style.opacity = '1';
      returnDateWrapper.style.pointerEvents = 'auto';
      returnDateLabel.style.opacity = '1';
      if (urlParams.get('return_date')) returnDateInput.value = urlParams.get('return_date');
    }
  }

  const today = new Date();
  const formatToday = today.toISOString().split('T')[0];
  journeyDateInput.min = formatToday;
  if (journeyDateInput.value < formatToday) journeyDateInput.value = formatToday;

  calculateDistanceAndFares();

  /* ─── PACKAGE MODE INITIALIZATION ─── */
  function initPackageMode() {
    if (packageModeInitialized) return;

    // Try to find package in fallback data or DB data
    let pkg = packagesData[selectedPackageId];
    if (!pkg && dbPackages.length > 0) {
      pkg = dbPackages.find(p => p.slug === selectedPackageId);
      if (pkg) {
        // Convert DB package to expected format
        pkg = {
          id: pkg.slug || pkg._id,
          name: pkg.name,
          category: pkg.category || 'Tour',
          categoryClass: pkg.categoryClass || (pkg.category || '').toLowerCase().replace(/\s+/g, '-') || 'weekend',
          duration: pkg.duration || '',
          rating: pkg.rating || '',
          stars: pkg.stars || '★★★★★',
          price: pkg.price || 0,
          img: pkg.image || pkg.img || '',
          desc: pkg.description || pkg.desc || '',
          highlights: pkg.highlights || [],
          itinerary: (pkg.itinerary || []).map((it, idx) => ({
            title: it.title || it.day || `Day ${idx + 1}`,
            desc: it.description || it.desc || ''
          })),
          inclusions: pkg.inclusions || [],
          exclusions: pkg.exclusions || [],
          stays: pkg.stays || '',
          route: pkg.route || 'Package Tour',
          defaultVehicle: pkg.defaultVehicle || 'sedan'
        };
      }
    }

    if (!pkg) {
      console.error('Package not found:', selectedPackageId);
      alert('Package not found. Redirecting to home...');
      window.location.href = 'home.html';
      return;
    }

    packageModeInitialized = true;

    document.body.classList.add('package-booking-active');
    if (stepViews[1]) stepViews[1].classList.add('package-mode');

    const mainTitle = document.querySelector('#stepView1 .step-title');
    const mainSubtitle = document.querySelector('#stepView1 .step-subtitle');
    if (mainTitle) mainTitle.textContent = "Review Package Details";
    if (mainSubtitle) mainSubtitle.textContent = "Review the tour itinerary and book using the checkout form";

    // Set sidebar summary for package
    if (summaryRoute) summaryRoute.textContent = pkg.route;
    if (summaryDistance) summaryDistance.textContent = "Included";
    if (summaryDuration) summaryDuration.textContent = pkg.duration;
    if (summaryTripType) summaryTripType.textContent = pkg.category;
    updateFareSummaryDisplay(0, 0, 0, 0, 0, pkg.price);

    selectedVehicleType = pkg.defaultVehicle || 'sedan';
    pickupInput.value = pkg.route.split(' - ')[0] || 'Package Start';
    dropoffInput.value = pkg.route.split(' - ').pop() || 'Package End';
  }

  /* ═══════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════ */
  function showStep(stepNum) {
    if (stepNum !== 'loading' && stepNum !== 'success') {
      if (stepNum < 1 || stepNum > 5) return;
      currentStep = stepNum;
    }
    Object.keys(stepViews).forEach(key => {
      if (stepViews[key]) stepViews[key].classList.remove('active');
    });
    if (stepViews[stepNum]) stepViews[stepNum].classList.add('active');

    stepIndicators.forEach((ind, index) => {
      if (!ind) return;
      const s = index + 1;
      ind.classList.remove('active', 'completed');
      if (s < currentStep) ind.classList.add('completed');
      else if (s === currentStep) ind.classList.add('active');
    });

    const fill = stepNum === 'success' ? 100 : ((currentStep - 1) / 4) * 100;
    progressFill.style.width = fill + '%';

    // Show/hide trip summary sidebar based on step (hidden on Step 1)
    const sidebar = document.querySelector('.booking-summary-sidebar');
    const grid = document.querySelector('.booking-grid');
    if (sidebar && grid) {
      if (stepNum === 1 || stepNum === 'loading' || stepNum === 'success') {
        sidebar.style.display = 'none';
        grid.style.gridTemplateColumns = '1fr';
      } else {
        sidebar.style.display = 'block';
        grid.style.gridTemplateColumns = ''; // restores default CSS definition (1fr 380px or responsive 1fr)
      }
    }

    document.querySelector('.booking-page-container')?.scrollIntoView({ behavior: 'smooth' });
    updateSidebarButton();

    // Populate step 5 review summary when reaching step 5
    if (stepNum === 5) populateStep5Review();
  }

  function updateSidebarButton() {
    if (!sidebarSecureBtn) return;
    if (currentStep === 5) {
      sidebarSecureBtn.innerHTML = `<span class="btn-lock-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span><span>Confirm &amp; Pay Now</span>`;
    } else {
      sidebarSecureBtn.innerHTML = `<span class="btn-lock-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span><span>Secure &amp; Safe Booking</span>`;
    }
  }

  /* ─── POPULATE STEP 5 REVIEW ─── */
  function populateStep5Review() {
    if (!step5ReviewContent) return;
    const vehicle = dbVehicles.find(v => v._id === selectedVehicleId);
    const vehicleName = vehicle ? (vehicle.name || vehicle.type) : selectedVehicleType;
    const passengerCount = document.getElementById('passengerCount')?.value || '1';
    const luggageCount = document.getElementById('luggageCount')?.value || '0';
    const specialInstr = document.getElementById('specialInstructions')?.value || 'None';

    step5ReviewContent.innerHTML = `
      <div><strong>Pickup:</strong> ${pickupInput.value.trim()}</div>
      <div><strong>Drop-off:</strong> ${dropoffInput.value.trim()}</div>
      <div><strong>Date:</strong> ${formatDateDisplay(journeyDateInput.value)}</div>
      <div><strong>Time:</strong> ${formatTimeDisplay(journeyTimeInput.value)}</div>
      <div><strong>Trip Type:</strong> ${tripType}</div>
      <div><strong>Vehicle:</strong> ${vehicleName}</div>
      <div><strong>Passengers:</strong> ${passengerCount}</div>
      <div><strong>Luggage:</strong> ${luggageCount} bags</div>
      <div style="grid-column:1/-1;"><strong>Special Instructions:</strong> ${specialInstr || 'None'}</div>
      <div style="grid-column:1/-1;"><strong>Name:</strong> ${custName?.value.trim() || '—'}</div>
      <div style="grid-column:1/-1;"><strong>Phone:</strong> +91 ${custPhone?.value.trim() || '—'}</div>
      <div style="grid-column:1/-1;"><strong>Email:</strong> ${custEmail?.value.trim() || '—'}</div>
      <div style="grid-column:1/-1; margin-top:4px; padding-top:8px; border-top:1px solid #eee;"><strong>Estimated Total:</strong> <span style="color:var(--maroon); font-size:16px;">${summaryTotal?.textContent || '—'}</span></div>
    `;
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatTimeDisplay(timeStr) {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  /* ─── STEP BUTTONS ─── */
  goToStep2Btn?.addEventListener('click', () => { if (validateStep1()) showStep(2); });
  backToStep1Btn?.addEventListener('click', () => showStep(1));
  goToStep3Btn?.addEventListener('click', () => { if (validateStep2()) showStep(3); });
  backToStep2Btn?.addEventListener('click', () => showStep(2));
  goToStep4Btn?.addEventListener('click', () => showStep(4));
  backToStep3Btn?.addEventListener('click', () => showStep(3));
  goToStep5Btn?.addEventListener('click', () => { if (validateStep4()) showStep(5); });
  backToStep4Btn?.addEventListener('click', () => showStep(4));
  confirmPaymentBtn?.addEventListener('click', () => { if (validateStep5()) processRealPayment(); });
  sidebarSecureBtn?.addEventListener('click', () => {
    if (currentStep === 1) goToStep2Btn?.click();
    else if (currentStep === 2) goToStep3Btn?.click();
    else if (currentStep === 3) goToStep4Btn?.click();
    else if (currentStep === 4) goToStep5Btn?.click();
    else if (currentStep === 5) confirmPaymentBtn?.click();
  });

  /* ═══════════════════════════════════════
     AUTOCOMPLETE
     ═══════════════════════════════════════ */
  function setupAutocomplete(inputEl, dropdownEl) {
    if (!inputEl || !dropdownEl) return;
    let debounceTimer;
    inputEl.addEventListener('input', () => {
      const val = inputEl.value.trim();
      clearTimeout(debounceTimer);
      if (!val || val.length < 3) { dropdownEl.style.display = 'none'; return; }
      debounceTimer = setTimeout(async () => {
        try {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=6&countrycodes=in&addressdetails=1`;
          const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
          const data = await res.json();
          dropdownEl.innerHTML = '';
          if (!data || data.length === 0) { dropdownEl.style.display = 'none'; return; }
          data.forEach(place => {
            const displayName = place.display_name.split(',').slice(0, 3).join(',').trim();
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = displayName;
            item.addEventListener('click', () => {
              inputEl.value = displayName;
              dropdownEl.style.display = 'none';
              calculateDistanceAndFares();
            });
            dropdownEl.appendChild(item);
          });
          dropdownEl.style.display = 'block';
        } catch (err) {
          console.warn('⚠ Autocomplete search failed:', err);
          dropdownEl.style.display = 'none';
        }
      }, 300);
    });
    document.addEventListener('click', (e) => {
      if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) dropdownEl.style.display = 'none';
    });
    inputEl.addEventListener('change', () => setTimeout(calculateDistanceAndFares, 150));
  }
  setupAutocomplete(pickupInput, pickupSuggestions);
  setupAutocomplete(dropoffInput, dropoffSuggestions);

  /* ─── SWAP LOCATIONS ─── */
  swapLocationsBtn?.addEventListener('click', () => {
    const temp = pickupInput.value; pickupInput.value = dropoffInput.value; dropoffInput.value = temp;
    swapLocationsBtn.style.transform = 'scale(0.9) rotate(180deg)';
    setTimeout(() => swapLocationsBtn.style.transform = '', 300);
    calculateDistanceAndFares();
  });

  /* ─── TRIP TYPE ─── */
  typeOneWayBtn?.addEventListener('click', () => {
    tripType = 'One Way';
    typeOneWayBtn.classList.add('active'); typeRoundTripBtn.classList.remove('active');
    returnDateInput.disabled = true; returnDateInput.value = '';
    returnDateWrapper.classList.add('disabled'); returnDateWrapper.style.opacity = '0.6';
    returnDateWrapper.style.pointerEvents = 'none'; returnDateLabel.style.opacity = '0.6';
    calculateDistanceAndFares();
  });
  typeRoundTripBtn?.addEventListener('click', () => {
    tripType = 'Round Trip';
    typeRoundTripBtn.classList.add('active'); typeOneWayBtn.classList.remove('active');
    returnDateInput.disabled = false;
    returnDateWrapper.classList.remove('disabled'); returnDateWrapper.style.opacity = '1';
    returnDateWrapper.style.pointerEvents = 'auto'; returnDateLabel.style.opacity = '1';
    if (journeyDateInput.value) {
      const rd = new Date(journeyDateInput.value); rd.setDate(rd.getDate() + 1);
      returnDateInput.value = rd.toISOString().split('T')[0]; returnDateInput.min = journeyDateInput.value;
    }
    calculateDistanceAndFares();
  });
  journeyDateInput?.addEventListener('change', () => {
    if (tripType === 'Round Trip') {
      returnDateInput.min = journeyDateInput.value;
      if (returnDateInput.value < journeyDateInput.value) returnDateInput.value = journeyDateInput.value;
    }
    calculateDistanceAndFares();
  });
  returnDateInput?.addEventListener('change', () => {
    calculateDistanceAndFares();
  });
  localToggle?.addEventListener('change', () => {
    if (localToggle.checked) {
      if (outstationToggle) outstationToggle.checked = false;
      if (localPlanGroup) localPlanGroup.style.display = 'block';
    } else {
      if (localPlanGroup) localPlanGroup.style.display = 'none';
    }
    renderVehiclesList();
    calculateDistanceAndFares();
  });
  outstationToggle?.addEventListener('change', () => {
    if (outstationToggle.checked) {
      if (localToggle) localToggle.checked = false;
      if (localPlanGroup) localPlanGroup.style.display = 'none';
    }
    renderVehiclesList();
    calculateDistanceAndFares();
  });
  localPlanSelect?.addEventListener('change', () => {
    renderVehiclesList();
    calculateDistanceAndFares();
  });
  /* ═══════════════════════════════════════
     DISTANCE & PRICING
     ═══════════════════════════════════════ */
  function getRouteKey(from, to) {
    const c1 = from.split(',')[0].trim().toLowerCase();
    const c2 = to.split(',')[0].trim().toLowerCase();
    const key1 = `${c1}-${c2}`;
    const key2 = `${c2}-${c1}`;
    if (routesDatabase[key1]) return key1;
    if (routesDatabase[key2]) return key2;
    return key1; // dono na mile toh yehi return kar, aage hash fallback chalega
}

function getStableHashDistance(from, to) {
  const str = (from + to).toLowerCase().replace(/[^a-z]/g, '');
  if (!str) return 120;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return 60 + (Math.abs(hash) % 390);
}



async function calculateDistanceAndFares() {
  const fromVal = pickupInput?.value?.trim() || '';
  const toVal = dropoffInput?.value?.trim() || '';
  if (!fromVal || !toVal) return;

  if (fromVal !== lastFetchedFrom || toVal !== lastFetchedTo) {
    lastFetchedFrom = fromVal;
    lastFetchedTo = toVal;

    if (summaryDistance) summaryDistance.textContent = 'Calculating...';
    if (summaryDuration) summaryDuration.textContent = 'Calculating...';

    const route = await getRouteFromORS(fromVal, toVal);

    if (route) {
      calculatedDistance = route.distance;
      calculatedDuration = route.duration;
    } else {
      const routeKey = getRouteKey(fromVal, toVal);

      if (routesDatabase[routeKey]) {
        calculatedDistance = routesDatabase[routeKey].distance;
        calculatedDuration = routesDatabase[routeKey].duration;
      } else {
        calculatedDistance = getStableHashDistance(fromVal, toVal);
        const hours = Math.floor(calculatedDistance / 55);
        const mins = Math.round(((calculatedDistance / 55) - hours) * 60);
        calculatedDuration = `${hours}h ${mins}m`;
      }
    }
  }

  let distForFare = calculatedDistance;
  if (tripType === 'Round Trip') distForFare *= 2;

  const cleanFrom = fromVal.split(',')[0].trim();
  const cleanTo = toVal.split(',')[0].trim();

  if (summaryRoute) summaryRoute.textContent = `${cleanFrom} → ${cleanTo}`;
  if (summaryDistance) summaryDistance.textContent = `~ ${distForFare} km`;
  if (summaryDuration) {
    summaryDuration.textContent =
      tripType === 'Round Trip'
        ? `~ ${calculatedDuration} x2`
        : `~ ${calculatedDuration}`;
  }
  if (summaryTripType) summaryTripType.textContent = tripType;

  const selectedVehicle =
    dbVehicles.find(v => v._id === selectedVehicleId) || { type: selectedVehicleType };

  const pricing =
    vehiclePricingConfig[selectedVehicleType] || vehiclePricingConfig['sedan'];

  const distanceCharge = 0;
  const taxes = 0;

  const isOutstation = outstationToggle?.checked || false;
  const isLocal = localToggle?.checked || false;

  let finalBaseFare = pricing.baseFare;
  let extraKmCharge = 0;
  let outstationDriverCharge = 0;
  let localExtraHrsCharge = 0;
  let localNightCharge = 0;

  const extraKmRow = document.getElementById('extraKmRow');
  const summaryExtraKm = document.getElementById('summaryExtraKm');
  const extraKmLabel = document.getElementById('extraKmLabel');

  const localExtraHrsRow = document.getElementById('localExtraHrsRow');
  const summaryLocalExtraHrs = document.getElementById('summaryLocalExtraHrs');
  const localExtraHrsLabel = document.getElementById('localExtraHrsLabel');

  const localNightRow = document.getElementById('localNightRow');
  const summaryLocalNight = document.getElementById('summaryLocalNight');

  const baseFareLabel = document.getElementById('summaryBaseFareLabel');

  const outstationChargeRow = document.getElementById('outstationChargeRow');
  const summaryOutstationCharge = document.getElementById('summaryOutstationCharge');
  const outstationChargeLabel = document.getElementById('outstationChargeLabel');

  if (isLocal) {
    const localConfig = getLocalConfigForVehicle(selectedVehicle);
    const selectedPlanKey = localPlanSelect?.value || 'eightHrs';

    let plan = localConfig[selectedPlanKey];
    if (!plan) {
      plan = localConfig['eightHrs'];
      if (localPlanSelect) localPlanSelect.value = 'eightHrs';
    }

    finalBaseFare = plan.fare;

    if (baseFareLabel) {
      baseFareLabel.textContent = `Base Fare (${plan.hrs} Hrs / ${plan.km} Km)`;
    }

    const extraKm = Math.max(0, distForFare - plan.km);
    extraKmCharge = extraKm * localConfig.extraKmRate;

    if (extraKmCharge > 0) {
      if (extraKmRow) extraKmRow.style.display = 'flex';
      if (summaryExtraKm) {
        summaryExtraKm.textContent = `₹ ${Number(extraKmCharge).toLocaleString('en-IN')}`;
      }
      if (extraKmLabel) {
        extraKmLabel.textContent = `Extra KM Charge (${extraKm} km)`;
      }
    } else {
      if (extraKmRow) extraKmRow.style.display = 'none';
    }

    const durationInHrs = parseDurationToHours(calculatedDuration);
    const extraHrs = Math.max(0, Math.ceil(durationInHrs - plan.hrs));
    localExtraHrsCharge = extraHrs * localConfig.extraHrRate;

    if (localExtraHrsCharge > 0) {
      if (localExtraHrsRow) localExtraHrsRow.style.display = 'flex';
      if (summaryLocalExtraHrs) {
        summaryLocalExtraHrs.textContent = `₹ ${Number(localExtraHrsCharge).toLocaleString('en-IN')}`;
      }
      if (localExtraHrsLabel) {
        localExtraHrsLabel.textContent = `Extra Hours Charge (${extraHrs} hrs)`;
      }
    } else {
      if (localExtraHrsRow) localExtraHrsRow.style.display = 'none';
    }

    const isNight = isNightTime(journeyTimeInput?.value);
    localNightCharge = isNight ? localConfig.nightCharge : 0;

    if (localNightCharge > 0) {
      if (localNightRow) localNightRow.style.display = 'flex';
      if (summaryLocalNight) {
        summaryLocalNight.textContent = `₹ ${Number(localNightCharge).toLocaleString('en-IN')}`;
      }
    } else {
      if (localNightRow) localNightRow.style.display = 'none';
    }

    if (outstationChargeRow) outstationChargeRow.style.display = 'none';

  } else if (isOutstation) {
    const outstationConfig = getOutstationConfigForVehicle(selectedVehicle);
    let days = 1;

    if (
      tripType === 'Round Trip' &&
      journeyDateInput?.value &&
      returnDateInput?.value
    ) {
      const start = new Date(journeyDateInput.value + 'T00:00:00');
      const end = new Date(returnDateInput.value + 'T00:00:00');
      const diffTime = end - start;

      if (diffTime >= 0) {
        days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    const minDist = days * outstationConfig.minKmPerDay;
    finalBaseFare = minDist * outstationConfig.rate;

    if (baseFareLabel) {
      baseFareLabel.textContent = `Base Fare (Min ${minDist} KM)`;
    }

    const extraKm = Math.max(0, distForFare - minDist);
    extraKmCharge = extraKm * outstationConfig.rate;

    if (extraKmCharge > 0) {
      if (extraKmRow) extraKmRow.style.display = 'flex';
      if (summaryExtraKm) {
        summaryExtraKm.textContent = `₹ ${Number(extraKmCharge).toLocaleString('en-IN')}`;
      }
      if (extraKmLabel) {
        extraKmLabel.textContent = `Extra KM Charge (${extraKm} km)`;
      }
    } else {
      if (extraKmRow) extraKmRow.style.display = 'none';
    }

    outstationDriverCharge = days * outstationConfig.driverTaPerDay;

    if (outstationChargeRow) outstationChargeRow.style.display = 'flex';
    if (summaryOutstationCharge) {
      summaryOutstationCharge.textContent = `₹ ${Number(outstationDriverCharge).toLocaleString('en-IN')}`;
    }
    if (outstationChargeLabel) {
      outstationChargeLabel.textContent =
        `Driver Charge (Outstation - ${days} ${days === 1 ? 'Day' : 'Days'})`;
    }

    if (localExtraHrsRow) localExtraHrsRow.style.display = 'none';
    if (localNightRow) localNightRow.style.display = 'none';

  } else {
    if (baseFareLabel) baseFareLabel.textContent = 'Base Fare';
    if (extraKmRow) extraKmRow.style.display = 'none';
    if (localExtraHrsRow) localExtraHrsRow.style.display = 'none';
    if (localNightRow) localNightRow.style.display = 'none';
    if (outstationChargeRow) outstationChargeRow.style.display = 'none';
  }

  const subtotal =
    finalBaseFare +
    pricing.tollParking +
    outstationDriverCharge +
    extraKmCharge +
    localExtraHrsCharge +
    localNightCharge;

  updateFareSummaryDisplay(
    finalBaseFare,
    distanceCharge,
    0,
    pricing.tollParking,
    taxes,
    subtotal
  );
}

  function updateFareSummaryDisplay(base, dist, driver, toll, tax, total) {
    if (summaryBaseFare) summaryBaseFare.textContent = `₹ ${Number(base).toLocaleString('en-IN')}`;
    if (summaryDistanceCharge) summaryDistanceCharge.textContent = `₹ ${Number(dist).toLocaleString('en-IN')}`;
    if (summaryDriverAllowance) summaryDriverAllowance.textContent = `₹ ${Number(driver).toLocaleString('en-IN')}`;
    if (summaryTollParking) summaryTollParking.textContent = `₹ ${Number(toll).toLocaleString('en-IN')}`;
    if (summaryTaxes) summaryTaxes.textContent = `₹ ${Number(tax).toLocaleString('en-IN')}`;
    if (summaryTotal) summaryTotal.textContent = `₹ ${Number(total).toLocaleString('en-IN')}`;
  }

  /* ═══════════════════════════════════════
     VEHICLE LIST — FROM DATABASE (with local images)
     ═══════════════════════════════════════ */
  function renderVehiclesList() {
    if (!vehiclesLoaded) {
      if (vehiclesContainer) {
        vehiclesContainer.innerHTML = `
          <div style="text-align:center; padding:60px 20px; color:#999;">
            <div class="spinner-ring" style="margin:0 auto 16px;"></div>
            <p style="font-size:15px; font-weight:600; margin-bottom:4px;">Loading vehicles...</p>
            <p style="font-size:13px;">Fetching from database</p>
          </div>`;
      }
      setTimeout(renderVehiclesList, 1500);
      return;
    }

    if (!vehiclesContainer || dbVehicles.length === 0) {
      if (vehiclesContainer) {
        vehiclesContainer.innerHTML = `
          <div style="text-align:center; padding:60px 20px; color:#999;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom:16px;">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style="font-size:15px; font-weight:600; margin-bottom:4px;">No vehicles available</p>
            <p style="font-size:13px;">Please try again later or contact us</p>
          </div>`;
      }
      return;
    }

    vehiclesContainer.innerHTML = '';
    const typeOrder = { 'sedan': 0, 'suv': 1, 'premium-suv': 2, 'tempo': 3, 'bus': 4 };
    const sorted = [...dbVehicles].sort((a, b) => (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9));

    const activeVehicle = dbVehicles.find(v => v._id === selectedVehicleId);
    const isLocalMode = localToggle?.checked || false;
    if (activeVehicle && isLocalMode) {
      const localConfig = getLocalConfigForVehicle(activeVehicle);
      const selectedPlanKey = localPlanSelect?.value || 'eightHrs';
      if (localConfig && !localConfig[selectedPlanKey]) {
        const firstAvailable = sorted.find(v => {
          const cfg = getLocalConfigForVehicle(v);
          return cfg && cfg[selectedPlanKey];
        });
        if (firstAvailable) {
          selectedVehicleId = firstAvailable._id;
          selectedVehicleType = firstAvailable.type || 'sedan';
        }
      }
    }

    sorted.forEach(v => {
      const pricing = vehiclePricingConfig[v.type] || vehiclePricingConfig['sedan'];
      const isSelected = selectedVehicleId === v._id || (!selectedVehicleId && v.type === selectedVehicleType);
      if (!selectedVehicleId && v.type === selectedVehicleType) selectedVehicleId = v._id;

      const vehicleImg = getVehicleImage(v);
      const fallbackImg = `https://placehold.co/400x220/6E1F2B/ffffff?text=${encodeURIComponent(v.name || v.type)}`;
      const displayName = v.name || v.type;
      const seats = v.seats || '?';
      const bags = v.luggage || '?';
      const typeLabel = v.type ? v.type.charAt(0).toUpperCase() + v.type.slice(1).replace('-', ' ') : 'Vehicle';

      const isLocal = localToggle?.checked || false;
      const isOutstation = outstationToggle?.checked || false;
      let displayFare = pricing.baseFare;
      let displayRateNote = `+ ₹${pricing.tollParking} toll & parking`;
      let displayPriceSub = 'base';
      let isPlanNA = false;

      if (isLocal) {
        const localConfig = getLocalConfigForVehicle(v);
        const selectedPlanKey = localPlanSelect?.value || 'eightHrs';
        const plan = localConfig[selectedPlanKey];
        if (plan) {
          displayFare = plan.fare;
          displayPriceSub = 'pkg';
          displayRateNote = `${plan.hrs} Hrs / ${plan.km} Km package`;
        } else {
          isPlanNA = true;
          displayFare = 'N/A';
          displayPriceSub = '';
          displayRateNote = 'Plan not available';
        }
      } else if (isOutstation) {
        const outstationConfig = getOutstationConfigForVehicle(v);
        let days = 1;
        if (tripType === 'Round Trip' && journeyDateInput.value && returnDateInput.value) {
          const start = new Date(journeyDateInput.value + 'T00:00:00');
          const end = new Date(returnDateInput.value + 'T00:00:00');
          const diffTime = end - start;
          if (diffTime >= 0) {
            days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
          }
        }
        const minDist = days * outstationConfig.minKmPerDay;
        displayFare = minDist * outstationConfig.rate;
        displayPriceSub = 'min';
        displayRateNote = `Min ${minDist} KM at ₹${outstationConfig.rate}/km`;
      }

      const card = document.createElement('div');
      card.className = `vehicle-card${isSelected ? ' selected' : ''}${isPlanNA ? ' disabled' : ''}`;
      card.dataset.vehicleId = v._id;
      card.dataset.vehicleType = v.type;

      const priceDisplayStr = typeof displayFare === 'number' ? `₹${displayFare.toLocaleString('en-IN')}` : displayFare;

      card.innerHTML = `
        <div class="vehicle-image-wrapper">
          <img src="${vehicleImg}" alt="${displayName}" class="vehicle-image-img" loading="lazy"
               onerror="this.onerror=null; this.src='${fallbackImg}';" />
        </div>
        <div class="vehicle-card-content">
          <div class="vehicle-selection-indicator">
            <span class="v-radio-indicator"></span>
          </div>
          <div class="vehicle-details-column">
            <div class="vehicle-name-row">
              <span class="vehicle-title">${displayName}</span>
              <span class="vehicle-class">${typeLabel}</span>
            </div>
            <div class="vehicle-specs">
              <span>${seats} Seats</span>
              <span class="spec-dot">•</span>
              <span>${bags} Bags</span>
              <span class="spec-dot">•</span>
              <span>${pricing.icon}</span>
            </div>
            <div class="vehicle-price-row">
              <span class="v-price">${priceDisplayStr}</span>
              <span class="v-price-sub">${displayPriceSub}</span>
            </div>
            <div class="vehicle-rate-note">${displayRateNote}</div>
          </div>
        </div>`;

      card.addEventListener('click', () => {
        if (!card.classList.contains('disabled')) {
          selectVehicle(v._id);
        }
      });
      vehiclesContainer.appendChild(card);
    });

    calculateDistanceAndFares();
  }

  function selectVehicle(vehicleId) {
    selectedVehicleId = vehicleId;
    const vehicle = dbVehicles.find(v => v._id === vehicleId);
    if (vehicle) selectedVehicleType = vehicle.type || 'sedan';

    document.querySelectorAll('.vehicle-card').forEach(card => {
      const isSelected = card.dataset.vehicleId === vehicleId;
      card.classList.toggle('selected', isSelected);
      const indicator = card.querySelector('.vehicle-card-select-indicator');
      if (indicator) indicator.textContent = isSelected ? '✓ Selected' : 'Select';
    });

    calculateDistanceAndFares();
  }

  // Initial render attempt (will retry if not loaded yet)
  setTimeout(renderVehiclesList, 300);

  /* ═══════════════════════════════════════
     VALIDATION
     ═══════════════════════════════════════ */
  function validateStep1() {
    if (!pickupInput.value.trim()) { alert('Please enter a pickup location.'); return false; }
    if (!dropoffInput.value.trim()) { alert('Please enter a drop-off location.'); return false; }
    if (pickupInput.value.trim().toLowerCase() === dropoffInput.value.trim().toLowerCase()) {
      alert('Pickup and drop-off locations cannot be the same.'); return false;
    }
    if (!journeyDateInput.value) { alert('Please select a journey date.'); return false; }
    if (!journeyTimeInput.value) { alert('Please select a journey time.'); return false; }
    if (tripType === 'Round Trip' && !returnDateInput.value) { alert('Please select a return date.'); return false; }
    if (tripType === 'Round Trip' && returnDateInput.value < journeyDateInput.value) {
      alert('Return date must be after journey date.'); return false;
    }
    return true;
  }

  function validateStep2() {
    if (!selectedVehicleId) { alert('Please select a vehicle.'); return false; }
    const vehicle = dbVehicles.find(v => v._id === selectedVehicleId);
    if (!vehicle) { alert('Selected vehicle not found. Please select again.'); return false; }
    const passengerCount = parseInt(document.getElementById('passengerCount')?.value || '1');
    if (vehicle.seats && passengerCount > vehicle.seats) {
      alert(`${vehicle.name} has only ${vehicle.seats} seats. Please reduce passengers or choose a larger vehicle.`);
      return false;
    }
    return true;
  }

  function validateStep4() {
    let valid = true;
    if (nameError) nameError.style.display = 'none';
    if (emailError) emailError.style.display = 'none';
    if (phoneError) phoneError.style.display = 'none';

    if (!custName || !custName.value.trim()) {
      if (nameError) { nameError.textContent = 'Please enter your full name.'; nameError.style.display = 'block'; }
      valid = false;
    } else if (custName.value.trim().length < 2) {
      if (nameError) { nameError.textContent = 'Name must be at least 2 characters.'; nameError.style.display = 'block'; }
      valid = false;
    }

    if (!custEmail || !custEmail.value.trim()) {
      if (emailError) emailError.style.display = 'block';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(custEmail.value.trim())) {
      if (emailError) emailError.style.display = 'block';
      valid = false;
    }

    if (!custPhone || !custPhone.value.trim()) {
      if (phoneError) phoneError.style.display = 'block';
      valid = false;
    } else if (!/^[6-9][0-9]{9}$/.test(custPhone.value.trim())) {
      if (phoneError) phoneError.style.display = 'block';
      valid = false;
    }

    return valid;
  }

  function validateStep5() { return true; }

  /* ═══════════════════════════════════════
     PROCESS REAL BOOKING
     ═══════════════════════════════════════ */
  function processRealPayment() {
    showStep('loading');

    const vehicle = dbVehicles.find(v => v._id === selectedVehicleId);
    const vehicleName = vehicle ? (vehicle.name || vehicle.type) : selectedVehicleType;
    const pricing = vehiclePricingConfig[vehicle?.type] || vehiclePricingConfig['sedan'];

    let distForFare = calculatedDistance;
    if (tripType === 'Round Trip') distForFare *= 2;
    const distanceCharge = 0;

    // Calculate outstation driver charge or local travel plan charges
    const isOutstation = outstationToggle?.checked || false;
    const isLocal = localToggle?.checked || false;
    
    let outstationDriverCharge = 0;
    let finalBaseFare = pricing.baseFare;
    let extraKmCharge = 0;
    let localExtraHrsCharge = 0;
    let localNightCharge = 0;

    if (isOutstation) {
      const outstationConfig = getOutstationConfigForVehicle(vehicle || { type: selectedVehicleType });
      let days = 1;
      if (tripType === 'Round Trip' && journeyDateInput.value && returnDateInput.value) {
        const start = new Date(journeyDateInput.value + 'T00:00:00');
        const end = new Date(returnDateInput.value + 'T00:00:00');
        const diffTime = end - start;
        if (diffTime >= 0) {
          days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
      }
      const minDist = days * outstationConfig.minKmPerDay;
      finalBaseFare = minDist * outstationConfig.rate;
      const extraKm = Math.max(0, distForFare - minDist);
      extraKmCharge = extraKm * outstationConfig.rate;
      outstationDriverCharge = days * outstationConfig.driverTaPerDay;
    } else if (isLocal) {
      const localConfig = getLocalConfigForVehicle(vehicle || { type: selectedVehicleType });
      const selectedPlanKey = localPlanSelect?.value || 'eightHrs';
      let plan = localConfig[selectedPlanKey];
      if (!plan) plan = localConfig['eightHrs'];
      
      finalBaseFare = plan.fare;

      // 1. Extra KM
      const extraKm = Math.max(0, distForFare - plan.km);
      extraKmCharge = extraKm * localConfig.extraKmRate;

      // 2. Extra Hours
      const durationInHrs = parseDurationToHours(calculatedDuration);
      const extraHrs = Math.max(0, Math.ceil(durationInHrs - plan.hrs));
      localExtraHrsCharge = extraHrs * localConfig.extraHrRate;

      // 3. Night charge
      const isNight = isNightTime(journeyTimeInput?.value);
      localNightCharge = isNight ? localConfig.nightCharge : 0;
    }

    const subtotal = finalBaseFare + pricing.tollParking + outstationDriverCharge + extraKmCharge + localExtraHrsCharge + localNightCharge;
    const taxes = 0;
    const total = subtotal;

    const passengerCount = document.getElementById('passengerCount')?.value || '1';
    const luggageCount = document.getElementById('luggageCount')?.value || '0';
    const specialInstr = document.getElementById('specialInstructions')?.value || '';
    const gstNumber = '';

    let tripPrefix = '';
    if (isOutstation) tripPrefix = '[OUTSTATION TRIP] ';
    else if (isLocal) tripPrefix = '[LOCAL TRIP] ';

    const payload = {
      name: custName.value.trim(),
      email: custEmail.value.trim(),
      phone: custPhone.value.trim(),
      bookingType: 'vehicle',
      vehicleId: selectedVehicleId,
      vehicleName: vehicleName,
      vehicleType: selectedVehicleType,
      pickupLocation: pickupInput.value.trim(),
      dropoffLocation: dropoffInput.value.trim(),
      pickupDate: new Date(journeyDateInput.value + 'T' + journeyTimeInput.value).toISOString(),
      returnDate: tripType === 'Round Trip' && returnDateInput.value
        ? new Date(returnDateInput.value + 'T' + journeyTimeInput.value).toISOString()
        : null,
      tripType: tripType,
      numberOfPeople: parseInt(passengerCount),
      numberOfLuggage: parseInt(luggageCount),
      distance: distForFare,
      duration: calculatedDuration,
      fareBreakdown: {
        baseFare: finalBaseFare,
        distanceCharge: extraKmCharge,
        driverAllowance: outstationDriverCharge + localNightCharge,
        tollParking: pricing.tollParking + localExtraHrsCharge,
        taxes: 0
      },
      totalPrice: total,
      advancePaid: 0,
      paymentStatus: 'pending',
      status: 'pending',
      gstNumber: gstNumber,
      notes: tripPrefix + specialInstr
    };

    lastBookingPayload = payload;

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(res => {
      if (res.success && res.data) {
        lastBookingResponse = res.data;
        
        // ✅ Display confirmation details
        if (successResId) successResId.textContent = res.data.bookingId || 'N/A';
        if (successEmail) successEmail.textContent = res.data.email || 'N/A';
        
        console.log('✅ Success:', {
          bookingId: res.data.bookingId,
          email: res.data.email,
          name: res.data.name
        });
        
        showStep('success');
        const sidebar = document.querySelector('.booking-summary-sidebar');
        if (sidebar) sidebar.style.display = 'none';
        const grid = document.querySelector('.booking-grid');
        if (grid) grid.style.gridTemplateColumns = '1fr';
      } else {
        showStep(5);
        alert('Booking failed: ' + (res.message || 'Unknown error'));
      }
    })

      .catch(err => {
        console.error('Booking submission error:', err);
        showStep(5);
        alert('Network error while submitting booking. Please check your connection and try again.');
      });
  }

  /* ═══════════════════════════════════════
     DOWNLOAD ITINERARY
     ═══════════════════════════════════════ */
  downloadItineraryBtn?.addEventListener('click', () => {
    const vehicle = dbVehicles.find(v => v._id === selectedVehicleId);
    const vehicleName = vehicle ? (vehicle.name || vehicle.type) : selectedVehicleType;
    const passengerCount = document.getElementById('passengerCount')?.value || '1';
    const luggageCount = document.getElementById('luggageCount')?.value || '0';

    const itineraryHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Booking Itinerary — Aman Tour and Travels</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333; background:#fff; padding:40px; }
  .header { text-align:center; border-bottom:3px solid #6E1F2B; padding-bottom:20px; margin-bottom:30px; }
  .header h1 { color:#6E1F2B; font-size:24px; margin-bottom:4px; }
  .header p { color:#888; font-size:13px; }
  .booking-id { display:inline-block; background:#6E1F2B; color:#fff; padding:6px 20px; border-radius:4px; font-size:14px; font-weight:600; margin-top:12px; }
  .section { margin-bottom:24px; }
  .section h2 { color:#6E1F2B; font-size:16px; border-bottom:1px solid #eee; padding-bottom:6px; margin-bottom:12px; }
  .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 24px; font-size:14px; }
  .detail-grid .label { font-weight:600; color:#555; }
  .detail-grid .value { color:#222; }
  .fare-table { width:100%; border-collapse:collapse; font-size:14px; }
  .fare-table th, .fare-table td { padding:8px 12px; text-align:left; border-bottom:1px solid #eee; }
  .fare-table th { background:#f9f5f0; color:#6E1F2B; font-weight:600; }
  .fare-table .total-row { font-weight:700; font-size:15px; border-top:2px solid #6E1F2B; }
  .fare-table .total-row td { color:#6E1F2B; }
  .footer { text-align:center; margin-top:40px; padding-top:20px; border-top:1px solid #eee; color:#999; font-size:12px; }
  @media print { body { padding:20px; } }
</style>
</head>
<body>
  <div class="header">
    <h1>AMAN TOUR AND TRAVELS</h1>
    <p>Safe Journey, Happy Journey</p>
    <div class="booking-id">Booking ID: ${lastBookingResponse?.bookingId || lastBookingResponse?._id || 'N/A'}</div>
  </div>

  <div class="section">
    <h2>Trip Details</h2>
    <div class="detail-grid">
      <div><span class="label">Pickup:</span> <span class="value">${pickupInput.value.trim()}</span></div>
      <div><span class="label">Drop-off:</span> <span class="value">${dropoffInput.value.trim()}</span></div>
      <div><span class="label">Date:</span> <span class="value">${formatDateDisplay(journeyDateInput.value)}</span></div>
      <div><span class="label">Time:</span> <span class="value">${formatTimeDisplay(journeyTimeInput.value)}</span></div>
      <div><span class="label">Trip Type:</span> <span class="value">${tripType}</span></div>
      ${tripType === 'Round Trip' && returnDateInput.value ? `<div><span class="label">Return Date:</span> <span class="value">${formatDateDisplay(returnDateInput.value)}</span></div>` : ''}
      <div><span class="label">Distance:</span> <span class="value">${summaryDistance?.textContent || '—'}</span></div>
      <div><span class="label">Duration:</span> <span class="value">${summaryDuration?.textContent || '—'}</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Vehicle & Passengers</h2>
    <div class="detail-grid">
      <div><span class="label">Vehicle:</span> <span class="value">${vehicleName}</span></div>
      <div><span class="label">Type:</span> <span class="value">${selectedVehicleType}</span></div>
      <div><span class="label">Passengers:</span> <span class="value">${passengerCount}</span></div>
      <div><span class="label">Luggage:</span> <span class="value">${luggageCount} bags</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Fare Breakdown</h2>
    <table class="fare-table">
      <tr><th>Item</th><th>Amount</th></tr>
      <tr><td>Base Fare</td><td>${summaryBaseFare?.textContent || '—'}</td></tr>
      ${outstationToggle?.checked ? `
        <tr><td>${document.getElementById('outstationChargeLabel')?.textContent || 'Driver Charge (Outstation)'}</td><td>${document.getElementById('summaryOutstationCharge')?.textContent || '—'}</td></tr>
        ${document.getElementById('extraKmRow')?.style.display !== 'none' ? `<tr><td>${document.getElementById('extraKmLabel')?.textContent || 'Extra KM Charge'}</td><td>${document.getElementById('summaryExtraKm')?.textContent || '—'}</td></tr>` : ''}
      ` : ''}
      ${localToggle?.checked ? `
        <tr><td>Travel Category</td><td>Local Travel (${document.getElementById('localPlanSelect')?.value === 'halfDay' ? '4 Hrs / 40 Km' : document.getElementById('localPlanSelect')?.value === 'eightHrs' ? '8 Hrs / 80 Km' : '12 Hrs / 180 Km'})</td></tr>
        ${document.getElementById('extraKmRow')?.style.display !== 'none' ? `<tr><td>${document.getElementById('extraKmLabel')?.textContent || 'Extra KM Charge'}</td><td>${document.getElementById('summaryExtraKm')?.textContent || '—'}</td></tr>` : ''}
        ${document.getElementById('localExtraHrsRow')?.style.display !== 'none' ? `<tr><td>${document.getElementById('localExtraHrsLabel')?.textContent || 'Extra Hours Charge'}</td><td>${document.getElementById('summaryLocalExtraHrs')?.textContent || '—'}</td></tr>` : ''}
        ${document.getElementById('localNightRow')?.style.display !== 'none' ? `<tr><td>Night Charges</td><td>${document.getElementById('summaryLocalNight')?.textContent || '—'}</td></tr>` : ''}
      ` : ''}
      <tr><td>Toll &amp; Parking</td><td>${summaryTollParking?.textContent || '—'}</td></tr>
      <tr class="total-row"><td>Estimated Total</td><td>${summaryTotal?.textContent || '—'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Customer Information</h2>
    <div class="detail-grid">
      <div><span class="label">Name:</span> <span class="value">${custName?.value.trim() || '—'}</span></div>
      <div><span class="label">Phone:</span> <span class="value">+91 ${custPhone?.value.trim() || '—'}</span></div>
      <div><span class="label">Email:</span> <span class="value">${custEmail?.value.trim() || '—'}</span></div>
    </div>
  </div>

  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} Aman Tour and Travels. All rights reserved.</p>
    <p>This is a computer-generated itinerary. Fare is estimated and may vary slightly.</p>
    <p>For queries: +91 1800-000-0000 | hello@amantourandtravels.in</p>
  </div>
</body>
</html>`;

    const blob = new Blob([itineraryHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aman-Tour-Itinerary-${lastBookingResponse?.bookingId || 'draft'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

});