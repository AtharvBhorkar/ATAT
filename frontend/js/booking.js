/* ═══════════════════════════════════════════════════
   VOYAGO — booking.js
   Dynamic form transitions, autocomplete, and pricing calculator
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  
  // ─── STATE MANAGEMENT ───
  let currentStep = 1;
  let selectedVehicleId = 'sedan'; // default selection
  let tripType = 'One Way'; // 'One Way' or 'Round Trip'
  let calculatedDistance = 150; // default for Mumbai -> Pune
  let calculatedDuration = '2h 45m';
  let isPackageMode = false;
  let selectedPackageId = null;

  // Pre-configured Maharashtra/India travel packages database
  const packagesData = {
    'shimla-manali': {
      id: 'shimla-manali',
      name: 'Shimla–Manali Grand Tour',
      category: 'Hill Station',
      categoryClass: 'hill',
      duration: '6 Days / 5 Nights',
      rating: '4.8 (2.4k reviews)',
      stars: '★★★★★',
      price: 18500,
      img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
      desc: 'Explore the majestic hills of Shimla and Manali. This package takes you through snow-capped Himalayan peaks, charming colonial architecture, lush pine forests, and thrilling mountain passes.',
      highlights: [
        'Explore Shimla Ridge & Mall Road shopping',
        'Solang Valley adventure sports and activities',
        'Kullu Valley river rafting views',
        'Scenic drive through Atal Tunnel'
      ],
      itinerary: [
        { title: "Delhi to Shimla", desc: "Scenic drive from Delhi to Shimla. Check-in at hotel, evening walk on Shimla Mall Road." },
        { title: "Shimla & Kufri Tour", desc: "Explore Kufri snow viewpoint, Jakhoo Temple, and colonial churches." },
        { title: "Shimla to Manali", desc: "Travel to Manali via Kullu Valley. Visit Pandoh Dam enroute." },
        { title: "Manali Local Sightseeing", desc: "Hadimba Temple, Vashisht Hot Springs, and local markets." },
        { title: "Solang Valley Excursion", desc: "Adventure sports, paragliding, and snow play at Solang Valley." },
        { title: "Manali to Delhi Return", desc: "Morning drive back to Delhi and departure." }
      ],
      inclusions: ['AC Sedan transport', '3★ Hotel accommodations', 'Daily breakfast & dinner', 'All tolls, permits & driver allowance'],
      exclusions: ['Flight/train tickets', 'Lunch & snacks', 'Adventure sport charges', 'Local guide tips'],
      stays: 'Standard 3-Star Hotels (Alpine Heritage / Orchard Greens)',
      route: 'Delhi - Shimla - Manali - Delhi',
      defaultVehicle: 'sedan'
    },
    'char-dham': {
      id: 'char-dham',
      name: 'Char Dham Yatra',
      category: 'Pilgrimage',
      categoryClass: 'pilgrimage',
      duration: '12 Days / 11 Nights',
      rating: '4.9 (4.1k reviews)',
      stars: '★★★★★',
      price: 32000,
      img: 'https://dreamgohimalayas.in/wp-content/uploads/2026/01/Char-Dham-Yatra-2026.jpg',
      desc: 'Sacred circuit of Yamunotri, Gangotri, Kedarnath & Badrinath — travel in ultimate devotion.',
      highlights: [
        'Worship at Yamunotri & Gangotri source temples',
        'Kedarnath holy trek & evening Aarti',
        'Badrinath darshan & thermal hot springs',
        'Last Indian village (Mana Village) excursion'
      ],
      itinerary: [
        { title: "Haridwar to Barkot", desc: "Drive to Barkot via Mussoorie and Kempty Falls." },
        { title: "Yamunotri Darshan", desc: "Trek to Yamunotri Temple, take holy bath in hot spring, return to Barkot." },
        { title: "Barkot to Uttarkashi", desc: "Scenic drive to Uttarkashi along Ganga River." },
        { title: "Gangotri Excursion", desc: "Holy dip at Gangotri temple and return to Uttarkashi." },
        { title: "Uttarkashi to Guptkashi", desc: "Travel to Guptkashi along Mandakini River." },
        { title: "Kedarnath Trek Up", desc: "16km trek to Kedarnath Temple. Attend holy evening Aarti." },
        { title: "Kedarnath Trek Down", desc: "Morning prayers, trek back down to Guptkashi." },
        { title: "Guptkashi to Badrinath", desc: "Drive to Badrinath, check-in, attend evening darshan." },
        { title: "Badrinath to Rudraprayag", desc: "Visit Mana Village. Drive down to Rudraprayag confluence." },
        { title: "Rudraprayag to Rishikesh", desc: "Drive to Rishikesh, visit Laxman Jhula." },
        { title: "Haridwar Ganga Aarti", desc: "Attend final Ganga Aarti at Har Ki Pauri." },
        { title: "Haridwar Departure", desc: "Checkout and transfer for return transit." }
      ],
      inclusions: ['Private SUV / Tempo Traveller', 'Premium Yatra stays', 'Pure vegetarian meals', 'State permits & driver fees'],
      exclusions: ['Helicopter tickets to Kedarnath', 'Lunch meals', 'Pony / Doli transport fees'],
      stays: 'Deluxe Yatra Hotels & Dharamshalas',
      route: 'Haridwar - Kedarnath - Badrinath - Haridwar',
      defaultVehicle: 'suv'
    },
    'goa-retreat': {
      id: 'goa-retreat',
      name: 'Goa Coastal Retreat',
      category: 'Weekend Escape',
      categoryClass: 'weekend',
      duration: '3 Days / 2 Nights',
      rating: '4.7 (1.8k reviews)',
      stars: '★★★★★',
      price: 9800,
      img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80',
      desc: 'Sun, sand, and seafood — a breezy weekend on India\'s favourite coastline with luxury transfers.',
      highlights: [
        'North Goa beach walks & shacks visit',
        'Panjim Portuguese Latin quarter walk',
        'Fort Aguada & lighthouse exploration',
        'Sunset boat cruise'
      ],
      itinerary: [
        { title: "Arrival & North Goa beaches", desc: "Transfer to resort. Visit Baga & Calangute beaches." },
        { title: "South Goa & Spice Plantation", desc: "Basilica of Bom Jesus, Old Goa churches, and spice farm tour." },
        { title: "Fort Aguada & Departure", desc: "Explore Fort Aguada and shopping. Drop at airport/station." }
      ],
      inclusions: ['Airport AC Cab transfers', 'Beach Resort hotel stay', 'Daily buffet breakfast', 'Fort Aguada entrance'],
      exclusions: ['Scuba/Water sports activities', 'Lunch & dinner', 'Sunset cruise tickets'],
      stays: '3★ Beachfront Resort (Lemon Tree or equivalent)',
      route: 'Goa Airport - North/South Goa - Airport',
      defaultVehicle: 'sedan'
    },
    'coorg-coffee': {
      id: 'coorg-coffee',
      name: 'Coorg Coffee & Mist',
      category: 'Hill Station',
      categoryClass: 'hill',
      duration: '4 Days / 3 Nights',
      rating: '4.7 (950 reviews)',
      stars: '★★★★★',
      price: 13200,
      img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      desc: 'Rolling coffee estates, misty waterfalls, and fresh aromatic mountain breezes in Karnataka\'s Scotland.',
      highlights: [
        'Bylakuppe Golden Temple monastery tour',
        'Abbey Falls nature trail walk',
        'Live coffee plantation sensory walk',
        'Raja\'s Seat panoramic sunset overlook'
      ],
      itinerary: [
        { title: "Bangalore to Coorg", desc: "Drive from Bangalore. Visit Bylakuppe Golden Temple." },
        { title: "Talacauvery Pilgrimage", desc: "Visit source of Cauvery River, Bhagamandala temple." },
        { title: "Estates & Waterfalls", desc: "Coffee plantation tour, Abbey Falls, Raja's Seat sunset." },
        { title: "Dubare Camp & Return", desc: "Interact with elephants at Dubare. Drive back to Bangalore." }
      ],
      inclusions: ['Bangalore-Coorg roundtrip cab', 'Estate Luxury Villa stay', 'Daily buffet breakfast', 'Driver charges'],
      exclusions: ['Elephant camp entry', 'Lunch & Dinner meals', 'Personal activities charges'],
      stays: 'Coorg Premium Estate Villas',
      route: 'Bangalore - Coorg - Bangalore',
      defaultVehicle: 'sedan'
    },
    'varanasi': {
      id: 'varanasi',
      name: 'Varanasi & Prayagraj',
      category: 'Pilgrimage',
      categoryClass: 'pilgrimage',
      duration: '5 Days / 4 Nights',
      rating: '4.9 (1.5k reviews)',
      stars: '★★★★★',
      price: 14500,
      img: 'https://travel4memory.com/wp-content/uploads/2024/10/varanasi-city-ancient-architecture-view-holy-manikarnika-ghat-varanasi-india-generative.webp',
      desc: 'Ganga Aarti at Dashashwamedh Ghat, ancient temples, and the sacred Triveni Sangam confluence.',
      highlights: [
        'Dashashwamedh Ghat evening Ganga Aarti',
        'Early morning Subah-e-Banaras boat ride',
        'Kashi Vishwanath Corridor temple darshan',
        'Triveni Sangam holy bath in Prayagraj'
      ],
      itinerary: [
        { title: "Arrival in Kashi", desc: "Check-in at hotel. Attend Ganga Aarti in the evening." },
        { title: "Varanasi Temples & Sarnath", desc: "Kashi Vishwanath, Sarnath Buddhist Stupa visit." },
        { title: "Prayagraj Excursion", desc: "Drive to Prayagraj, boat ride at Triveni Sangam." },
        { title: "Varanasi Heritage Walk", desc: "Walking tour of ancient ghats and Banarasi weavers lane." },
        { title: "Ganga Sunrise Boat & Departure", desc: "Morning boat ride, check out and drop at airport." }
      ],
      inclusions: ['AC Cab for airport & city tours', 'Heritage hotel stay', 'Daily vegetarian breakfast', 'Sangam boat ride tickets'],
      exclusions: ['Ganga boat private hire', 'Lunch & Dinner meals', 'Personal offerings/pujas'],
      stays: 'Heritage Haveli Hotel in Varanasi',
      route: 'Varanasi - Prayagraj - Varanasi',
      defaultVehicle: 'suv'
    },
    'lonavala': {
      id: 'lonavala',
      name: 'Lonavala & Khandala',
      category: 'Weekend Escape',
      categoryClass: 'weekend',
      duration: '2 Days / 1 Night',
      rating: '4.5 (820 reviews)',
      stars: '★★★★☆',
      price: 5500,
      img: 'https://ikshanaandspa.familyresort.net/data/Photos/500x500w/15831/1583118/1583118195/Zaras-Resort-Khandala-Lonavala-Exterior.JPEG',
      desc: 'Monsoon valley viewpoints, waterfalls, and scenic drives - the perfect quick getaway near Pune.',
      highlights: [
        'Lonavala Tiger Point & Rajmachi viewpoints',
        'Karla & Bhaja ancient caves exploration',
        'Bhushi Dam waterfall splashing',
        'Local market fudge tasting tour'
      ],
      itinerary: [
        { title: "Mumbai/Pune to Lonavala", desc: "Pickup and drive to Lonavala. Visit Karla Caves, wax museum & lake." },
        { title: "Khandala Views & Return", desc: "Tiger Point, Bhushi Dam, Khandala sunset, return drive." }
      ],
      inclusions: ['AC Sedan roundtrip cab', 'Resort night stay', 'Buffet Breakfast', 'Tolls & driver allowance'],
      exclusions: ['Caves entry ticket fees', 'Lunch & Dinner meals', 'Adventure activity charges'],
      stays: 'Zara Resort or equivalent Khandala',
      route: 'Mumbai/Pune - Lonavala - Return',
      defaultVehicle: 'sedan'
    },
    'corp-lonavala': {
      id: 'corp-lonavala',
      name: 'Corporate Offsite Lonavala',
      category: 'Corporate Tour',
      categoryClass: 'corporate',
      duration: '2 Days / 1 Night',
      rating: '4.9 (420 reviews)',
      stars: '★★★★★',
      price: 6500,
      img: 'https://i.pinimg.com/736x/0a/21/d8/0a21d8b146e9faaff00c1cc87c2d6569.jpg',
      desc: 'Boost team bonding with custom team-building activities, premium villas, and dedicated conference spaces.',
      highlights: [
        'Modern high-tech conference spaces',
        'Organized corporate team-building events',
        'Gala live barbecue night with music/DJ',
        'Outdoor valley trekking adventure'
      ],
      itinerary: [
        { title: "Arrival & Conference sessions", desc: "Check-in. Morning strategy sessions in boardroom. Afternoon outdoor team bonding activities. Night BBQ." },
        { title: "Trek & City return", desc: "Morning nature trail walk. Team games, lunch, check out and return drive." }
      ],
      inclusions: ['AC Tempo Traveller / Coach', 'Luxury corporate resort stays', 'All meals (BF, L, D & hi-tea)', 'Boardroom usage with AV equipment'],
      exclusions: ['Hard beverages / alcohol', 'Spa services', 'Custom activity materials'],
      stays: 'Fariyas Resort / Duke\'s Retreat Lonavala',
      route: 'Mumbai/Pune - Corporate Resort - Return',
      defaultVehicle: 'tempo'
    },
    'goa-leadership': {
      id: 'goa-leadership',
      name: 'Goa Leadership Summit',
      category: 'Corporate Tour',
      categoryClass: 'corporate',
      duration: '4 Days / 3 Nights',
      rating: '5.0 (210 reviews)',
      stars: '★★★★★',
      price: 19500,
      img: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1200&q=80',
      desc: 'Inspire strategy in 5★ comfort. High-level boardrooms, luxury beachside stays, and private yacht networking.',
      highlights: [
        'Luxury 5★ beachside resort stay',
        'Premium high-level boardrooms & AV',
        'Private Sunset Yacht cocktail networking',
        'Beach team sports and activities'
      ],
      itinerary: [
        { title: "Arrival in Goa & Welcome", desc: "Airport pickup in executive cars. Welcome cocktails and orientation dinner." },
        { title: "Leadership Summit & Yacht", desc: "Strategic boardroom workshops. Afternoon sunset networking dinner on private yacht." },
        { title: "Team Building & Gala", desc: "Beach team games. Outdoor sports. Strategy awards dinner and DJ night." },
        { title: "Strategy wrap & Departure", desc: "Final review briefing. Checkout and airport transfers." }
      ],
      inclusions: ['Premium SUV transfers', '5★ Resort executive rooms', 'All premium meals & socials', 'Private Yacht charter package'],
      exclusions: ['Spa treatments charges', 'Premium top-shelf alcohol', 'Airfares'],
      stays: 'Taj Exotica Resort & Spa Goa',
      route: 'Goa Airport - Taj Exotica - Goa Airport',
      defaultVehicle: 'premium-suv'
    },
    'ooty': {
      id: 'ooty',
      name: 'Ooty & Kodaikanal Escapade',
      category: 'Hill Station',
      categoryClass: 'hill',
      duration: '5 Days / 4 Nights',
      rating: '4.6 (640 reviews)',
      stars: '★★★★★',
      price: 14900,
      img: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=600&q=80',
      desc: 'Experience the tea gardens of Ooty and the misty pine forests of beautiful Kodaikanal.',
      highlights: [
        'Boating at scenic Ooty Lake',
        'Explore Doddabetta Peak tea factory',
        'Walk through Kodaikanal Pine Forests',
        'Views along Coaker\'s Walk valley edge'
      ],
      itinerary: [
        { title: "Coimbatore to Ooty", desc: "Pickup in Coimbatore, drive up to Ooty. Check-in and leisure evening." },
        { title: "Ooty Sightseeing", desc: "Botanical Gardens, Doddabetta tea factory, lake boating." },
        { title: "Ooty to Kodaikanal", desc: "Drive to Kodaikanal via scenic roads. Evening boat ride at Kodai Lake." },
        { title: "Kodaikanal Sightseeing", desc: "Visit Pillar Rocks, Pine Forests, and Coaker's Walk." },
        { title: "Kodaikanal to Coimbatore", desc: "Check out and drive back to Coimbatore for departure." }
      ],
      inclusions: ['AC Sedan / SUV cab', 'Heritage Hotel accommodations', 'Daily breakfast & dinner', 'All tolls & permits'],
      exclusions: ['Lake boating ticket fees', 'Lunch meals', 'Entrance & camera charges'],
      stays: 'Savoy IHCL Ooty & Lakeview Kodai',
      route: 'Coimbatore - Ooty - Kodaikanal - Coimbatore',
      defaultVehicle: 'sedan'
    },
    'tirupati': {
      id: 'tirupati',
      name: 'Tirupati Balaji Darshan',
      category: 'Pilgrimage',
      categoryClass: 'pilgrimage',
      duration: '3 Days / 2 Nights',
      rating: '4.9 (2.8k reviews)',
      stars: '★★★★★',
      price: 8900,
      img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80',
      desc: 'Hassle-free holy pilgrimage with VIP darshan passes and comfortable round-trip transfers.',
      highlights: [
        'Special Entry VIP Tirumala Darshan Pass',
        'Sri Venkateswara Temple prayers',
        'Padmavathi Ammavari Temple visit',
        'Sreevari Padaalu hilltop view tour'
      ],
      itinerary: [
        { title: "Chennai to Tirupati", desc: "Pickup from Chennai. Drive to Tirupati, visit Padmavathi Temple." },
        { title: "VIP Tirumala Darshan", desc: "Drive up Tirumala Hills, special VIP entry darshan. Visit viewpoints." },
        { title: "Tirupati to Chennai Return", desc: "Visit Sri Kalyana Venkateswara Temple. Drive back to Chennai." }
      ],
      inclusions: ['Private AC Sedan cab', 'Star Hotel accommodations', 'Daily vegetarian breakfast', 'Special entry VIP darshan passes'],
      exclusions: ['Lunch & Dinner meals', 'Tonsuring offerings fee', 'Personal pujas charges'],
      stays: 'Fortune Select Grand Ridge Tirupati',
      route: 'Chennai - Tirupati - Chennai',
      defaultVehicle: 'sedan'
    },
    'mahabaleshwar': {
      id: 'mahabaleshwar',
      name: 'Mahabaleshwar Strawberry Escape',
      category: 'Weekend Escape',
      categoryClass: 'weekend',
      duration: '3 Days / 2 Nights',
      rating: '4.6 (1.1k reviews)',
      stars: '★★★★★',
      price: 8200,
      img: 'https://i.pinimg.com/1200x/3d/37/4a/3d374a5a8c0b0a7be1391bd705c17d8f.jpg',
      desc: 'Enjoy fresh strawberry farm visits, spectacular viewpoints, and boat rides on Venna Lake.',
      highlights: [
        'Mapro strawberry farm visits',
        'Arthur\'s Seat breathtaking valley views',
        'Rowboat rides on Venna Lake',
        'Table Land walk in Panchgani'
      ],
      itinerary: [
        { title: "Pune to Mahabaleshwar", desc: "Pickup in Pune, drive to Mahabaleshwar. Check in, evening lake boating." },
        { title: "Mahabaleshwar Sightseeing", desc: "Arthur's Seat, strawberry garden farm visit & Mapro garden." },
        { title: "Panchgani & Return", desc: "Visit Table Land plateau. Drive back to Pune." }
      ],
      inclusions: ['AC Sedan / SUV cab', 'Valley View Resort rooms', 'Daily breakfast & dinner', 'Tolls & driver allowance'],
      exclusions: ['Boat rental tickets', 'Lunch meals', 'Horse riding charges'],
      stays: 'Evershine Resort Mahabaleshwar',
      route: 'Pune - Mahabaleshwar - Pune',
      defaultVehicle: 'suv'
    },
    'tech-summit': {
      id: 'tech-summit',
      name: 'Tech Team Summit & Hack',
      category: 'Corporate Tour',
      categoryClass: 'corporate',
      duration: '3 Days / 2 Nights',
      rating: '4.8 (150 reviews)',
      stars: '★★★★★',
      price: 9000,
      img: 'https://i.pinimg.com/236x/75/ff/e9/75ffe984c8c772bb418ca17e56c0b133.jpg',
      desc: 'Combine work and wellness. Team brainstorming sessions, forest villas, campfire grills and music.',
      highlights: [
        'Luxury coding/brainstorming villas in forest',
        'High-speed business class Wi-Fi & AV',
        'Team bonding campfire BBQ night',
        'Guided nature reserve trail trek'
      ],
      itinerary: [
        { title: "Arrival & Workspace Setup", desc: "Check-in. Setup tech hub. Afternoon strategy coding session. Evening barbecue campfire." },
        { title: "Hackathon & Nature trail", desc: "Brainstorming and code hackathon. Afternoon forest walk. Night success banquet." },
        { title: "Pitch wrap & Departure", desc: "Demos & awards check. Check out and drive return." }
      ],
      inclusions: ['AC Tempo Traveller pickup', 'Premium Forest villa stays', 'All meals & refreshments', 'Co-working setup & high-speed Wi-Fi'],
      exclusions: ['Custom gadgets rental', 'Alcoholic beverages', 'Personal laundry'],
      stays: 'Forest Hills Luxury Resort Tala',
      route: 'Mumbai/Pune - Tala Forest Resort - Return',
      defaultVehicle: 'tempo'
    }
  };

  // Popular routes distance database (in km) & duration
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
    'shirdi-nashik': { distance: 90, duration: '1h 45m' }
  };

  // Popular Maharashtra travel locations for autocomplete
  const popularLocations = [
    'Mumbai, Maharashtra',
    'Pune, Maharashtra',
    'Lonavala, Maharashtra',
    'Shirdi, Maharashtra',
    'Nashik, Maharashtra',
    'Mahabaleshwar, Maharashtra',
    'Goa',
    'Alibaug, Maharashtra',
    'Panchgani, Maharashtra',
    'Kolhapur, Maharashtra',
    'Aurangabad, Maharashtra'
  ];

  // Vehicles list config
  const vehiclesData = {
    'sedan': {
      id: 'sedan',
      name: 'Sedan',
      model: 'Dezire / Etios or similar',
      rate: 18,
      baseFare: 2850, // Covers up to 100 km
      driverAllowance: 400,
      tollParking: 350,
      capacity: 4,
      luggage: 2,
      img: 'assets/sedan.png'
    },
    'suv': {
      id: 'suv',
      name: 'SUV',
      model: 'Ertiga / Marazzo or similar',
      rate: 24,
      baseFare: 3600,
      driverAllowance: 500,
      tollParking: 450,
      capacity: 6,
      luggage: 4,
      img: 'assets/suv.png'
    },
    'premium-suv': {
      id: 'premium-suv',
      name: 'Premium SUV',
      model: 'Innova Crysta or similar',
      rate: 28,
      baseFare: 4200,
      driverAllowance: 600,
      tollParking: 500,
      capacity: 7,
      luggage: 5,
      img: 'assets/premium_suv.png'
    },
    'tempo': {
      id: 'tempo',
      name: 'Tempo Traveller',
      model: '12 / 17 Seater',
      rate: 35,
      baseFare: 5500,
      driverAllowance: 800,
      tollParking: 600,
      capacity: 17,
      luggage: 10,
      img: 'assets/tempo.png'
    }
  };


  // ─── UI ELEMENTS DOM REFERENCE ───
  const stepIndicators = [
    document.getElementById('stepIndicator1'),
    document.getElementById('stepIndicator2'),
    document.getElementById('stepIndicator3'),
    document.getElementById('stepIndicator4'),
    document.getElementById('stepIndicator5')
  ];

  const stepViews = {
    1: document.getElementById('stepView1'),
    2: document.getElementById('stepView2'),
    3: document.getElementById('stepView3'),
    4: document.getElementById('stepView4'),
    5: document.getElementById('stepView5'),
    'loading': document.getElementById('stepViewLoading'),
    'success': document.getElementById('stepViewSuccess')
  };

  const progressFill = document.getElementById('progressFill');

  // Step 1 Controls
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
  const pickupSuggestions = document.getElementById('pickupSuggestions');
  const dropoffSuggestions = document.getElementById('dropoffSuggestions');

  // Step 2 Controls
  const vehiclesContainer = document.getElementById('vehiclesContainer');

  // Step 4 Errors
  const custName = document.getElementById('custName');
  const custEmail = document.getElementById('custEmail');
  const custPhone = document.getElementById('custPhone');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');

  // Step 5 Controls
  const paymentMethods = document.getElementsByName('paymentMethod');
  const cardDetailsForm = document.getElementById('cardDetailsForm');
  const upiInfoContainer = document.getElementById('upiInfoContainer');
  const cashInfoContainer = document.getElementById('cashInfoContainer');
  const cashPayableAmt = document.getElementById('cashPayableAmt');
  
  const cardNumber = document.getElementById('cardNumber');
  const cardExpiry = document.getElementById('cardExpiry');
  const cardCvv = document.getElementById('cardCvv');
  const upiId = document.getElementById('upiId');
  const termsCheck = document.getElementById('termsCheck');
  
  const cardNumError = document.getElementById('cardNumError');
  const cardExpiryError = document.getElementById('cardExpiryError');
  const cardCvvError = document.getElementById('cardCvvError');
  const upiError = document.getElementById('upiError');
  const termsError = document.getElementById('termsError');

  // Sidebar Fare Summary Elements
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

  // Navigation Buttons
  const goToStep2Btn = document.getElementById('goToStep2Btn');
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const goToStep3Btn = document.getElementById('goToStep3Btn');
  const backToStep2Btn = document.getElementById('backToStep2Btn');
  const goToStep4Btn = document.getElementById('goToStep4Btn');
  const backToStep3Btn = document.getElementById('backToStep3Btn');
  const goToStep5Btn = document.getElementById('goToStep5Btn');
  const backToStep4Btn = document.getElementById('backToStep4Btn');
  const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
  const sidebarSecureBtn = document.getElementById('sidebarSecureBtn');

  // Confirmation Success Elements
  const successResId = document.getElementById('successResId');
  const successEmail = document.getElementById('successEmail');


  // ─── PACKAGE DOM REFERENCES ───
  const packageDetailsPanel = document.getElementById('packageDetailsPanel');
  const standardLocationsGrid = document.getElementById('standardLocationsGrid');
  const pkgPreviewHero = document.getElementById('pkgPreviewHero');
  const pkgPreviewCategory = document.getElementById('pkgPreviewCategory');
  const pkgPreviewTitle = document.getElementById('pkgPreviewTitle');
  const pkgPreviewDuration = document.getElementById('pkgPreviewDuration');
  const pkgPreviewStars = document.getElementById('pkgPreviewStars');
  const pkgPreviewReviews = document.getElementById('pkgPreviewReviews');
  const pkgPreviewDescription = document.getElementById('pkgPreviewDescription');
  const pkgPreviewHighlights = document.getElementById('pkgPreviewHighlights');
  const pkgPreviewTimeline = document.getElementById('pkgPreviewTimeline');
  const pkgPreviewInclusions = document.getElementById('pkgPreviewInclusions');
  const pkgPreviewExclusions = document.getElementById('pkgPreviewExclusions');
  const pkgPreviewStays = document.getElementById('pkgPreviewStays');

  // ─── PACKAGE CHECKOUT DOM REFERENCES ───
  const pkgDateInput = document.getElementById('pkgDateInput');
  const pkgTravelersCount = document.getElementById('pkgTravelersCount');
  const pkgName = document.getElementById('pkgName');
  const pkgEmail = document.getElementById('pkgEmail');
  const pkgPhone = document.getElementById('pkgPhone');
  const pkgPricePerPerson = document.getElementById('pkgPricePerPerson');
  const pkgTravelersMultiplier = document.getElementById('pkgTravelersMultiplier');
  const pkgTotalPrice = document.getElementById('pkgTotalPrice');
  const bookPackageBtn = document.getElementById('bookPackageBtn');

  // ─── INITIALIZATION ───
  const urlParams = new URLSearchParams(window.location.search);

  // Check if we are booking a package
  const packageParam = urlParams.get('package');
  if (packageParam && packagesData[packageParam.toLowerCase().trim()]) {
    isPackageMode = true;
    selectedPackageId = packageParam.toLowerCase().trim();

    // Enable package booking UI overrides
    document.body.classList.add('package-booking-active');
    if (stepViews[1]) {
      stepViews[1].classList.add('package-mode');
    }
    if (packageDetailsPanel) {
      packageDetailsPanel.classList.add('active');
    }

    // Render package information dynamically
    const pkg = packagesData[selectedPackageId];
    if (pkgPreviewTitle) pkgPreviewTitle.textContent = pkg.name;
    if (pkgPreviewHero) pkgPreviewHero.style.backgroundImage = `url('${pkg.img}')`;
    if (pkgPreviewCategory) {
      pkgPreviewCategory.textContent = pkg.category;
      pkgPreviewCategory.className = `pkg-preview-category ${pkg.categoryClass}`;
    }
    if (pkgPreviewDuration) pkgPreviewDuration.textContent = pkg.duration;
    if (pkgPreviewStars) pkgPreviewStars.textContent = pkg.stars;
    if (pkgPreviewReviews) pkgPreviewReviews.textContent = pkg.rating;
    if (pkgPreviewDescription) pkgPreviewDescription.textContent = pkg.desc;

    // Render Highlights
    if (pkgPreviewHighlights) {
      pkgPreviewHighlights.innerHTML = '';
      pkg.highlights.forEach(h => {
        const li = document.createElement('li');
        li.textContent = h;
        pkgPreviewHighlights.appendChild(li);
      });
    }

    // Render Itinerary Timeline
    if (pkgPreviewTimeline) {
      pkgPreviewTimeline.innerHTML = '';
      pkg.itinerary.forEach((it, idx) => {
        const dayNum = idx + 1;
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
          <div class="timeline-day-badge">${dayNum}</div>
          <h5 class="timeline-title">${it.title}</h5>
          <p class="timeline-desc">${it.desc}</p>
        `;
        pkgPreviewTimeline.appendChild(item);
      });
    }

    // Render Inclusions & Exclusions
    if (pkgPreviewInclusions) {
      pkgPreviewInclusions.innerHTML = '';
      pkg.inclusions.forEach(inc => {
        const li = document.createElement('li');
        li.textContent = inc;
        pkgPreviewInclusions.appendChild(li);
      });
    }

    if (pkgPreviewExclusions) {
      pkgPreviewExclusions.innerHTML = '';
      pkg.exclusions.forEach(exc => {
        const li = document.createElement('li');
        li.textContent = exc;
        pkgPreviewExclusions.appendChild(li);
      });
    }

    // Render Stays
    if (pkgPreviewStays) pkgPreviewStays.textContent = pkg.stays;

    // Handle package detail tabs switching
    document.querySelectorAll('.pkg-preview-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pkg-preview-tab-btn').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.dataset.pkgTab;
        document.querySelectorAll('.pkg-preview-tab-view').forEach(view => view.classList.remove('active'));
        if (targetTab === 'itinerary') {
          document.getElementById('pkgTabItinerary').classList.add('active');
        } else if (targetTab === 'inclusions') {
          document.getElementById('pkgTabInclusions').classList.add('active');
        } else if (targetTab === 'stays') {
          document.getElementById('pkgTabStays').classList.add('active');
        }
      });
    });

    // Populate checkout card details
    if (pkgPricePerPerson) {
      pkgPricePerPerson.textContent = `₹ ${pkg.price.toLocaleString('en-IN')}`;
    }

    // travelers price calculations function
    const updatePkgPrice = () => {
      const travelers = parseInt(pkgTravelersCount.value, 10);
      const sub = pkg.price * travelers;
      const tax = Math.round((sub * 0.05) / 10) * 10;
      const total = sub + tax;

      const pkgSubtotal = document.getElementById('pkgSubtotal');
      const pkgTaxes = document.getElementById('pkgTaxes');

      if (pkgTravelersMultiplier) pkgTravelersMultiplier.textContent = `x ${travelers}`;
      if (pkgSubtotal) pkgSubtotal.textContent = `₹ ${sub.toLocaleString('en-IN')}`;
      if (pkgTaxes) pkgTaxes.textContent = `₹ ${tax.toLocaleString('en-IN')}`;
      if (pkgTotalPrice) pkgTotalPrice.textContent = `₹ ${total.toLocaleString('en-IN')}`;
    };

    if (pkgTravelersCount) {
      pkgTravelersCount.addEventListener('change', updatePkgPrice);
      updatePkgPrice(); // run initial calculation
    }

    // Date picker set default limits
    if (pkgDateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formatTomorrow = tomorrow.toISOString().split('T')[0];
      pkgDateInput.min = formatTomorrow;
      pkgDateInput.value = formatTomorrow;
      journeyDateInput.value = formatTomorrow;

      pkgDateInput.addEventListener('change', () => {
        journeyDateInput.value = pkgDateInput.value;
      });
    }

    // Handle single-page Book Package Checkout click
    if (bookPackageBtn) {
      bookPackageBtn.addEventListener('click', () => {
        let isValid = true;

        if (!pkgDateInput.value) {
          pkgDateInput.classList.add('error');
          document.getElementById('pkgDateError').style.display = 'block';
          isValid = false;
        } else {
          pkgDateInput.classList.remove('error');
          document.getElementById('pkgDateError').style.display = 'none';
        }

        if (!pkgName.value.trim()) {
          pkgName.classList.add('error');
          document.getElementById('pkgNameError').style.display = 'block';
          isValid = false;
        } else {
          pkgName.classList.remove('error');
          document.getElementById('pkgNameError').style.display = 'none';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(pkgEmail.value.trim())) {
          pkgEmail.classList.add('error');
          document.getElementById('pkgEmailError').style.display = 'block';
          isValid = false;
        } else {
          pkgEmail.classList.remove('error');
          document.getElementById('pkgEmailError').style.display = 'none';
        }

        const phoneVal = pkgPhone.value.trim();
        const phoneRegex = /^[6-9][0-9]{9}$/;
        if (!phoneRegex.test(phoneVal)) {
          pkgPhone.classList.add('error');
          document.getElementById('pkgPhoneError').style.display = 'block';
          isValid = false;
        } else {
          pkgPhone.classList.remove('error');
          document.getElementById('pkgPhoneError').style.display = 'none';
        }

        if (isValid) {
          showStep('loading');

          setTimeout(() => {
            showStep('success');

            if (packageDetailsPanel) packageDetailsPanel.style.display = 'none';
            const checkoutCard = document.getElementById('packageCheckoutCard');
            if (checkoutCard) checkoutCard.style.display = 'none';

            document.querySelector('.booking-grid').style.gridTemplateColumns = '1fr';

            const journeyVal = pkgDateInput.value;
            let dateCode = "250525";
            if (journeyVal) {
              const parts = journeyVal.split('-');
              if (parts.length === 3) {
                dateCode = parts[2] + parts[1] + parts[0].substring(2);
              }
            }
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const refId = 'VOY' + dateCode + randomCode;

            successResId.textContent = refId;
            successEmail.textContent = pkgEmail.value;
          }, 2500);
        }
      });
    }

    // preselect default vehicle
    if (pkg.defaultVehicle) {
      selectedVehicleId = pkg.defaultVehicle;
    }

    // Update step 1 header texts
    const mainTitle = document.querySelector('#stepView1 .step-title');
    const mainSubtitle = document.querySelector('#stepView1 .step-subtitle');
    if (mainTitle) mainTitle.textContent = "Review Package Details";
    if (mainSubtitle) mainSubtitle.textContent = "Review the tour itinerary and book using the checkout form";

  } else {
    // Normal ride booking initialization
    const vehicleParam = urlParams.get('vehicle');
    if (vehicleParam && vehiclesData[vehicleParam]) {
      selectedVehicleId = vehicleParam;
    }

    const pickupParam = urlParams.get('pickup');
    if (pickupParam) {
      pickupInput.value = pickupParam;
    }

    const dropoffParam = urlParams.get('dropoff');
    if (dropoffParam) {
      dropoffInput.value = dropoffParam;
    }

    const dateParam = urlParams.get('date');
    if (dateParam) {
      journeyDateInput.value = dateParam;
    }

    const timeParam = urlParams.get('time');
    if (timeParam) {
      journeyTimeInput.value = timeParam;
    }

    const typeParam = urlParams.get('type');
    if (typeParam) {
      if (typeParam.toLowerCase().includes('round')) {
        tripType = 'Round Trip';
        typeRoundTripBtn.classList.add('active');
        typeOneWayBtn.classList.remove('active');
        returnDateInput.disabled = false;
        returnDateWrapper.classList.remove('disabled');
        returnDateWrapper.style.opacity = '1';
        returnDateWrapper.style.pointerEvents = 'auto';
        returnDateLabel.style.opacity = '1';
        
        const returnDateParam = urlParams.get('return_date');
        if (returnDateParam) {
          returnDateInput.value = returnDateParam;
        }
      } else {
        tripType = 'One Way';
        typeOneWayBtn.classList.add('active');
        typeRoundTripBtn.classList.remove('active');
      }
    }
  }

  // Set default dates limit
  const today = new Date();
  const formatToday = today.toISOString().split('T')[0];
  journeyDateInput.min = formatToday;
  if (journeyDateInput.value < formatToday) {
    journeyDateInput.value = formatToday;
  }

  // Populate vehicles list in step 2
  renderVehiclesList();

  // Run initial fare calculations
  calculateDistanceAndFares();


  // ─── NAVIGATION & WIZARD CONTROLLER ───
  function showStep(stepNum) {
    if (stepNum < 1 || stepNum > 5) return;
    
    currentStep = stepNum;

    // Toggle forms display
    Object.keys(stepViews).forEach(key => {
      stepViews[key].classList.remove('active');
    });
    
    stepViews[currentStep].classList.add('active');

    // Update Progress Indicators
    stepIndicators.forEach((ind, index) => {
      const indStep = index + 1;
      ind.classList.remove('active', 'completed');
      if (indStep < currentStep) {
        ind.classList.add('completed');
      } else if (indStep === currentStep) {
        ind.classList.add('active');
      }
    });

    // Update progress bar line fill percent
    const fillPercent = ((currentStep - 1) / 4) * 100;
    progressFill.style.width = fillPercent + '%';

    // Scroll to top of form panel smoothly
    document.querySelector('.booking-page-container').scrollIntoView({ behavior: 'smooth' });

    // Sync sidebar button label and state
    updateSidebarButtonState();
  }

  function updateSidebarButtonState() {
    if (currentStep === 5) {
      sidebarSecureBtn.innerHTML = `
        <span class="btn-lock-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </span>
        <span>Confirm &amp; Pay Now</span>
      `;
    } else {
      sidebarSecureBtn.innerHTML = `
        <span class="btn-lock-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </span>
        <span>Secure &amp; Safe Booking</span>
      `;
    }
  }


  // ─── STEP ACTIONS NAVIGATION TRIGGERS ───
  goToStep2Btn.addEventListener('click', () => {
    if (validateStep1()) {
      showStep(2);
    }
  });

  backToStep1Btn.addEventListener('click', () => {
    showStep(1);
  });

  goToStep3Btn.addEventListener('click', () => {
    if (validateStep2()) {
      showStep(3);
    }
  });

  backToStep2Btn.addEventListener('click', () => {
    showStep(2);
  });

  goToStep4Btn.addEventListener('click', () => {
    showStep(4);
  });

  backToStep3Btn.addEventListener('click', () => {
    showStep(3);
  });

  goToStep5Btn.addEventListener('click', () => {
    if (validateStep4()) {
      showStep(5);
    }
  });

  if (backToStep4Btn) {
    backToStep4Btn.addEventListener('click', () => {
      showStep(4);
    });
  }

  confirmPaymentBtn.addEventListener('click', () => {
    if (validateStep5()) {
      processMockPayment();
    }
  });

  sidebarSecureBtn.addEventListener('click', () => {
    // Triggers navigation based on current step
    if (currentStep === 1) {
      goToStep2Btn.click();
    } else if (currentStep === 2) {
      goToStep3Btn.click();
    } else if (currentStep === 3) {
      goToStep4Btn.click();
    } else if (currentStep === 4) {
      goToStep5Btn.click();
    } else if (currentStep === 5) {
      confirmPaymentBtn.click();
    }
  });


  // ─── AUTOCOMPLETE & TYPING LOGIC ───
  function setupAutocomplete(inputEl, dropdownEl) {
    inputEl.addEventListener('input', () => {
      const val = inputEl.value.trim().toLowerCase();
      dropdownEl.innerHTML = '';
      if (!val) {
        dropdownEl.style.display = 'none';
        return;
      }

      const filtered = popularLocations.filter(loc => 
        loc.toLowerCase().includes(val)
      );

      if (filtered.length === 0) {
        dropdownEl.style.display = 'none';
        return;
      }

      filtered.forEach(loc => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        // Bold the matched prefix parts
        const idx = loc.toLowerCase().indexOf(val);
        const displayHtml = loc.substring(0, idx) + 
                            '<strong>' + loc.substring(idx, idx + val.length) + '</strong>' + 
                            loc.substring(idx + val.length);
        item.innerHTML = displayHtml;
        
        item.addEventListener('click', () => {
          inputEl.value = loc;
          dropdownEl.style.display = 'none';
          calculateDistanceAndFares();
        });
        dropdownEl.appendChild(item);
      });

      dropdownEl.style.display = 'block';
    });

    // Close suggestion boxes on click outside
    document.addEventListener('click', (e) => {
      if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
        dropdownEl.style.display = 'none';
      }
    });

    inputEl.addEventListener('change', () => {
      // Small timeout to allow autocomplete click triggers
      setTimeout(calculateDistanceAndFares, 150);
    });
  }

  setupAutocomplete(pickupInput, pickupSuggestions);
  setupAutocomplete(dropoffInput, dropoffSuggestions);


  // ─── SWAP LOCATIONS LOGIC ───
  swapLocationsBtn.addEventListener('click', () => {
    const temp = pickupInput.value;
    pickupInput.value = dropoffInput.value;
    dropoffInput.value = temp;

    // Small scale click animation
    swapLocationsBtn.style.transform = 'scale(0.9) rotate(180deg)';
    setTimeout(() => {
      swapLocationsBtn.style.transform = '';
    }, 300);

    calculateDistanceAndFares();
  });


  // ─── TRIP TYPE ACTIONS ───
  typeOneWayBtn.addEventListener('click', () => {
    tripType = 'One Way';
    typeOneWayBtn.classList.add('active');
    typeRoundTripBtn.classList.remove('active');
    
    // Disable return date field
    returnDateInput.disabled = true;
    returnDateInput.value = '';
    returnDateWrapper.classList.add('disabled');
    returnDateWrapper.style.opacity = '0.6';
    returnDateWrapper.style.pointerEvents = 'none';
    returnDateLabel.style.opacity = '0.6';

    calculateDistanceAndFares();
  });

  typeRoundTripBtn.addEventListener('click', () => {
    tripType = 'Round Trip';
    typeRoundTripBtn.classList.add('active');
    typeOneWayBtn.classList.remove('active');

    // Enable return date field
    returnDateInput.disabled = false;
    returnDateWrapper.classList.remove('disabled');
    returnDateWrapper.style.opacity = '1';
    returnDateWrapper.style.pointerEvents = 'auto';
    returnDateLabel.style.opacity = '1';

    // Set default return date to tomorrow or +1 day of journey date
    const journeyVal = journeyDateInput.value;
    if (journeyVal) {
      const rDate = new Date(journeyVal);
      rDate.setDate(rDate.getDate() + 1);
      returnDateInput.value = rDate.toISOString().split('T')[0];
      returnDateInput.min = journeyVal;
    }

    calculateDistanceAndFares();
  });

  journeyDateInput.addEventListener('change', () => {
    if (tripType === 'Round Trip') {
      returnDateInput.min = journeyDateInput.value;
      if (returnDateInput.value < journeyDateInput.value) {
        returnDateInput.value = journeyDateInput.value;
      }
    }
  });


  // ─── ROUTE DISTANCE & PRICING CALCULATOR ───
  function getRouteKey(fromCity, toCity) {
    const c1 = fromCity.split(',')[0].trim().toLowerCase();
    const c2 = toCity.split(',')[0].trim().toLowerCase();
    return [c1, c2].sort().join('-');
  }

  // Reproducible stable hash for unmatched routes (returns distance 60km - 450km)
  function getStableHashDistance(fromCity, toCity) {
    const str = (fromCity + toCity).toLowerCase().replace(/[^a-z]/g, '');
    if (!str) return 120;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const offset = Math.abs(hash) % 390; // 0 to 390
    return 60 + offset; // min 60km, max 450km
  }

  function calculateDistanceAndFares() {
    if (isPackageMode) {
      const pkg = packagesData[selectedPackageId];
      if (!pkg) return;

      summaryRoute.textContent = pkg.route;
      summaryDistance.textContent = "Included";
      summaryDuration.textContent = pkg.duration;
      summaryTripType.textContent = pkg.category;

      updateFareSummaryDisplay(0);
      return;
    }

    const fromVal = pickupInput.value.trim();
    const toVal = dropoffInput.value.trim();

    if (!fromVal || !toVal) return;

    const routeKey = getRouteKey(fromVal, toVal);
    
    if (routesDatabase[routeKey]) {
      calculatedDistance = routesDatabase[routeKey].distance;
      calculatedDuration = routesDatabase[routeKey].duration;
    } else {
      // Fallback to stable pseudo-random distance
      calculatedDistance = getStableHashDistance(fromVal, toVal);
      // Average 55 km/h for travel duration estimation
      const hours = Math.floor(calculatedDistance / 55);
      const mins = Math.round(((calculatedDistance / 55) - hours) * 60);
      calculatedDuration = `~ ${hours}h ${mins}m`;
    }

    // Double the distance if round trip!
    let distForFare = calculatedDistance;
    if (tripType === 'Round Trip') {
      distForFare = calculatedDistance * 2;
    }

    // Refresh route tags in sidebar
    const cleanFrom = fromVal.split(',')[0].trim();
    const cleanTo = toVal.split(',')[0].trim();
    summaryRoute.textContent = `${cleanFrom} → ${cleanTo}`;
    summaryDistance.textContent = `~ ${distForFare} km`;
    summaryDuration.textContent = tripType === 'Round Trip' ? `~ ${calculatedDuration} x2` : `~ ${calculatedDuration}`;
    summaryTripType.textContent = tripType;

    // Recalculate billing values
    updateFareSummaryDisplay(distForFare);
  }

  function updateFareSummaryDisplay(distance) {
    // Dynamic label updating based on booking mode
    const rows = document.querySelectorAll('.fare-breakdown-wrapper .summary-row');
    if (rows.length >= 5) {
      rows[0].querySelector('.summary-label').textContent = isPackageMode ? "Package Base Fare" : "Base Fare";
      rows[1].querySelector('.summary-label').textContent = isPackageMode ? "Vehicle Upgrade" : "Distance Charge";
      rows[2].querySelector('.summary-label').textContent = isPackageMode ? "Driver & Stays" : "Driver Allowance";
      rows[3].querySelector('.summary-label').textContent = isPackageMode ? "Tolls & Fees" : "Toll & Parking";
    }

    if (isPackageMode) {
      const pkg = packagesData[selectedPackageId];
      if (!pkg) return;

      const countEl = document.getElementById('passengerCount');
      const passengerQty = countEl ? parseInt(countEl.value, 10) : 4;
      const basePackagePrice = pkg.price * passengerQty;

      let vehicleUpgrade = 0;
      if (selectedVehicleId === 'suv') {
        vehicleUpgrade = 1500 * passengerQty;
      } else if (selectedVehicleId === 'premium-suv') {
        vehicleUpgrade = 3000 * passengerQty;
      } else if (selectedVehicleId === 'tempo') {
        vehicleUpgrade = 4500 * passengerQty;
      }

      const subtotal = basePackagePrice + vehicleUpgrade;
      const taxVal = Math.round((subtotal * 0.05) / 10) * 10; // 5% GST on packages
      const total = subtotal + taxVal;

      summaryBaseFare.textContent = `₹ ${basePackagePrice.toLocaleString('en-IN')}`;
      summaryDistanceCharge.textContent = vehicleUpgrade > 0 ? `₹ ${vehicleUpgrade.toLocaleString('en-IN')}` : "Included";
      summaryDriverAllowance.textContent = "Included";
      summaryTollParking.textContent = "Included";
      summaryTaxes.textContent = `₹ ${taxVal.toLocaleString('en-IN')}`;
      summaryTotal.textContent = `₹ ${total.toLocaleString('en-IN')}`;

      if (cashPayableAmt) {
        cashPayableAmt.textContent = `₹ ${total.toLocaleString('en-IN')}`;
      }

      updateVehicleListPricings(0);
      return;
    }

    const vehicle = vehiclesData[selectedVehicleId];
    if (!vehicle) return;

    const base = vehicle.baseFare;
    
    // Formula: First 100km included in Base Fare. Rest at per-km rate.
    const freeKm = 100;
    const fillableKm = Math.max(0, distance - freeKm);
    const distanceChargeVal = fillableKm * vehicle.rate;

    let allowanceMultiplier = 1;
    let tollMultiplier = 1;

    if (tripType === 'Round Trip') {
      allowanceMultiplier = 1.8;
      tollMultiplier = 2;
    }

    const driverAllow = Math.round(vehicle.driverAllowance * allowanceMultiplier);
    const tollPark = Math.round(vehicle.tollParking * tollMultiplier);
    
    const subtotal = base + distanceChargeVal + driverAllow + tollPark;
    const taxVal = Math.round((subtotal * 0.0667) / 10) * 10;
    const total = subtotal + taxVal;

    summaryBaseFare.textContent = `₹ ${base.toLocaleString('en-IN')}`;
    summaryDistanceCharge.textContent = `₹ ${distanceChargeVal.toLocaleString('en-IN')}`;
    summaryDriverAllowance.textContent = `₹ ${driverAllow.toLocaleString('en-IN')}`;
    summaryTollParking.textContent = `₹ ${tollPark.toLocaleString('en-IN')}`;
    summaryTaxes.textContent = `₹ ${taxVal.toLocaleString('en-IN')}`;
    summaryTotal.textContent = `₹ ${total.toLocaleString('en-IN')}`;

    if (cashPayableAmt) {
      cashPayableAmt.textContent = `₹ ${total.toLocaleString('en-IN')}`;
    }

    updateVehicleListPricings(distance);
  }

  function updateVehicleListPricings(distance) {
    const countEl = document.getElementById('passengerCount');
    const passengerQty = countEl ? parseInt(countEl.value, 10) : 4;

    Object.keys(vehiclesData).forEach(vKey => {
      const v = vehiclesData[vKey];

      if (isPackageMode) {
        const pkg = packagesData[selectedPackageId];
        if (!pkg) return;

        const basePackagePrice = pkg.price * passengerQty;
        let upgrade = 0;
        if (vKey === 'suv') upgrade = 1500 * passengerQty;
        else if (vKey === 'premium-suv') upgrade = 3000 * passengerQty;
        else if (vKey === 'tempo') upgrade = 4500 * passengerQty;

        const sub = basePackagePrice + upgrade;
        const tax = Math.round((sub * 0.05) / 10) * 10;
        const total = sub + tax;

        const priceText = document.getElementById(`vPriceVal-${v.id}`);
        if (priceText) {
          priceText.textContent = `₹ ${total.toLocaleString('en-IN')}`;
        }
      } else {
        const billable = Math.max(0, distance - 100);
        const distChg = billable * v.rate;

        let allowanceMult = 1;
        let tollMult = 1;
        if (tripType === 'Round Trip') {
          allowanceMult = 1.8;
          tollMult = 2;
        }
        
        const sub = v.baseFare + distChg + Math.round(v.driverAllowance * allowanceMult) + Math.round(v.tollParking * tollMult);
        const tax = Math.round((sub * 0.0667) / 10) * 10;
        const total = sub + tax;

        const priceText = document.getElementById(`vPriceVal-${v.id}`);
        if (priceText) {
          priceText.textContent = `₹ ${total.toLocaleString('en-IN')}`;
        }
      }
    });
  }


  // ─── RENDER VEHICLES LIST (STEP 2) ───
  function renderVehiclesList() {
    vehiclesContainer.innerHTML = '';
    
    Object.keys(vehiclesData).forEach(key => {
      const v = vehiclesData[key];
      const isSelected = v.id === selectedVehicleId;
      
      const card = document.createElement('div');
      card.className = `vehicle-card ${isSelected ? 'selected' : ''}`;
      card.dataset.id = v.id;
      
      card.innerHTML = `
        <div class="vehicle-image-wrapper">
          <img src="${v.img}" alt="${v.name}" class="vehicle-image-img" />
        </div>
        <div class="vehicle-card-content">
          <div class="vehicle-selection-indicator">
            <span class="v-radio-indicator"></span>
          </div>
          <div class="vehicle-details-column">
            <div class="vehicle-name-row">
              <span class="vehicle-title">${v.name}</span>
              <span class="vehicle-class">${v.model.split(' ')[0]} Class</span>
            </div>
            <div class="vehicle-specs">
              <span>${v.capacity} Seats</span>
              <span class="spec-dot">•</span>
              <span>${v.luggage} Bags</span>
              <span class="spec-dot">•</span>
              <span>AC Available</span>
            </div>
            <div class="vehicle-rate-note">
              Rate: ₹ ${v.rate}/km (after 100 km) • Inclusive of basic insurance
            </div>
            <div class="vehicle-price-row">
              <span class="v-price" id="vPriceVal-${v.id}">₹ 0</span>
              <span class="v-price-sub">incl. toll &amp; taxes</span>
            </div>
          </div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        // Remove selection from others
        document.querySelectorAll('.vehicle-card').forEach(c => {
          c.classList.remove('selected');
        });
        
        // Add select state
        card.classList.add('selected');
        selectedVehicleId = v.id;
        
        // Re-run fare breakdown based on selected vehicle
        calculateDistanceAndFares();
      });
      
      vehiclesContainer.appendChild(card);
    });
  }


  // ─── PAYMENT METHOD SWITCHES ───
  paymentMethods.forEach(method => {
    method.addEventListener('change', (e) => {
      // Remove active class from all method labels
      document.querySelectorAll('.payment-method-card').forEach(lbl => {
        lbl.classList.remove('active');
      });

      // Add active to parent label
      e.target.closest('.payment-method-card').classList.add('active');

      const mode = e.target.value;
      if (mode === 'card') {
        cardDetailsForm.style.display = 'block';
        upiInfoContainer.style.display = 'none';
        cashInfoContainer.style.display = 'none';
      } else if (mode === 'upi') {
        cardDetailsForm.style.display = 'none';
        upiInfoContainer.style.display = 'block';
        cashInfoContainer.style.display = 'none';
      } else if (mode === 'cash') {
        cardDetailsForm.style.display = 'none';
        upiInfoContainer.style.display = 'none';
        cashInfoContainer.style.display = 'block';
      }
    });
  });

  // Credit Card formatting (gaps after 4 digits)
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formatted = '';
      for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += val[i];
      }
      e.target.value = formatted;
    });
  }

  // Expiry date formatting (MM/YY)
  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
      if (val.length >= 2) {
        e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
      } else {
        e.target.value = val;
      }
    });
  }


  // ─── VALIDATION SCHEMES ───
  function validateStep1() {
    if (isPackageMode) {
      const dateVal = pkgDateInput ? pkgDateInput.value : '';
      if (!dateVal) {
        if (pkgDateInput) pkgDateInput.style.borderColor = '#D32F2F';
        return false;
      }
      if (pkgDateInput) pkgDateInput.style.borderColor = '';
      return true;
    }

    const fromVal = pickupInput.value.trim();
    const toVal = dropoffInput.value.trim();
    
    let isValid = true;
    
    if (!fromVal) {
      pickupInput.style.borderColor = '#D32F2F';
      isValid = false;
    } else {
      pickupInput.style.borderColor = '';
    }

    if (!toVal) {
      dropoffInput.style.borderColor = '#D32F2F';
      isValid = false;
    } else {
      dropoffInput.style.borderColor = '';
    }

    return isValid;
  }

  function validateStep2() {
    if (!selectedVehicleId) {
      alert('Please choose a vehicle to continue.');
      return false;
    }
    return true;
  }

  function validateStep4() {
    let isValid = true;
    
    // Validate Name
    if (!custName.value.trim()) {
      custName.classList.add('error');
      nameError.style.display = 'block';
      isValid = false;
    } else {
      custName.classList.remove('error');
      nameError.style.display = 'none';
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(custEmail.value.trim())) {
      custEmail.classList.add('error');
      emailError.style.display = 'block';
      isValid = false;
    } else {
      custEmail.classList.remove('error');
      emailError.style.display = 'none';
    }

    // Validate Phone (+91 and 10 digit number)
    const phoneVal = custPhone.value.trim();
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(phoneVal)) {
      custPhone.classList.add('error');
      phoneError.style.display = 'block';
      isValid = false;
    } else {
      custPhone.classList.remove('error');
      phoneError.style.display = 'none';
    }

    return isValid;
  }

  function validateStep5() {
    return true; // No payment validation needed
  }


  // ─── PROCESS TRANSACTION & CONFIRM BOOKING ───
  function processMockPayment() {
    // Show mock loading step
    showStep('loading');
    
    // Hide progress bar wrapper during final verification or completed state
    document.querySelector('.steps-progress-wrapper').style.opacity = '0.3';
    sidebarSecureBtn.disabled = true;

    // Simulate bank loading animation for 2.5 seconds
    setTimeout(() => {
      // Transition to success screen
      showStep('success');
      document.querySelector('.steps-progress-wrapper').style.display = 'none';
      document.querySelector('.booking-summary-sidebar').style.display = 'none';
      
      // Make grid span full width for clean invoice display
      document.querySelector('.booking-grid').style.gridTemplateColumns = '1fr';

      // Populate success page with real details
      const journeyVal = journeyDateInput.value; // e.g. "2025-05-25"
      let dateCode = "250525";
      if (journeyVal) {
        const parts = journeyVal.split('-'); // ["2025", "05", "25"]
        if (parts.length === 3) {
          dateCode = parts[2] + parts[1] + parts[0].substring(2); // "25" + "05" + "25" = "250525"
        }
      }
      const randomCode = Math.floor(1000 + Math.random() * 9000); // 4 digits e.g. "4876"
      const refId = 'VOY' + dateCode + randomCode;

      successResId.textContent = refId;
      successEmail.textContent = custEmail.value || 'customer@email.com';

    }, 2500);
  }

  // Recalculate package/ride fares when passenger count changes in Step 3
  const passengerCountSelect = document.getElementById('passengerCount');
  if (passengerCountSelect) {
    passengerCountSelect.addEventListener('change', () => {
      calculateDistanceAndFares();
    });
  }

});
