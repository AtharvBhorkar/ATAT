document.addEventListener('DOMContentLoaded', () => {

  const API_BASE = window.location.origin + '/api';

  /* ══════════════ STATE ══════════════ */
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
  let selectedVehicle = null;
  let tripType = 'One Way';
  let vehiclesList = [];
  let lastBookingFare = null;

  const fallbackVehicles = [
    { _id: 'sedan', name: 'Sedan', type: 'Sedan', model: 'Dezire / Etios or similar', seats: 4, luggage: 2, pricePerKm: 12, image: '', availability: true, note: 'Comfortable for small groups' },
    { _id: 'suv', name: 'SUV', type: 'SUV', model: 'Ertiga / Marazzo or similar', seats: 6, luggage: 4, pricePerKm: 16, image: '', availability: true, note: 'Great for families' },
    { _id: 'premium-suv', name: 'Premium SUV', type: 'Premium SUV', model: 'Innova Crysta or similar', seats: 7, luggage: 5, pricePerKm: 22, image: '', availability: true, note: 'Extra comfort & space' },
    { _id: 'tempo', name: 'Tempo Traveller', type: 'Tempo Traveller', model: '12 / 17 Seater', seats: 17, luggage: 10, pricePerKm: 28, image: '', availability: true, note: 'Best for large groups' }
  ];

  const popularLocations = [
    'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Lonavala, Maharashtra', 'Shirdi, Maharashtra',
    'Nashik, Maharashtra', 'Mahabaleshwar, Maharashtra', 'Goa', 'Alibaug, Maharashtra',
    'Panchgani, Maharashtra', 'Kolhapur, Maharashtra', 'Aurangabad, Maharashtra',
    'Thane, Maharashtra', 'Nagpur, Maharashtra', 'Trimbakeshwar, Maharashtra'
  ];

  const distanceMap = {
    'mumbai-pune': 150, 'pune-mumbai': 150,
    'mumbai-lonavala': 83, 'lonavala-mumbai': 83,
    'mumbai-shirdi': 245, 'shirdi-mumbai': 245,
    'mumbai-nashik': 210, 'nashik-mumbai': 210,
    'mumbai-mahabaleshwar': 265, 'mahabaleshwar-mumbai': 265,
    'mumbai-goa': 560, 'goa-mumbai': 560,
    'mumbai-alibaug': 96, 'alibaug-mumbai': 96,
    'mumbai-panchgani': 250, 'panchgani-mumbai': 250,
    'mumbai-kolhapur': 380, 'kolhapur-mumbai': 380,
    'mumbai-aurangabad': 335, 'aurangabad-mumbai': 335,
    'mumbai-thane': 30, 'thane-mumbai': 30,
    'mumbai-nagpur': 830, 'nagpur-mumbai': 830,
    'pune-lonavala': 65, 'lonavala-pune': 65,
    'pune-shirdi': 190, 'shirdi-pune': 190,
    'pune-nashik': 210, 'nashik-pune': 210,
    'pune-mahabaleshwar': 120, 'mahabaleshwar-pune': 120,
    'pune-goa': 450, 'goa-pune': 450,
    'pune-kolhapur': 240, 'kolhapur-pune': 240,
    'pune-aurangabad': 260, 'aurangabad-pune': 260
  };

  /* ══════════════ DOM REFS ══════════════ */
  const stepIndicators = [1, 2, 3, 4, 5].map(n => document.getElementById('stepIndicator' + n));
  const stepViews = {
    1: document.getElementById('stepView1'),
    2: document.getElementById('stepView2'),
    3: document.getElementById('stepView3'),
    4: document.getElementById('stepView4'),
    5: document.getElementById('stepView5'),
    loading: document.getElementById('stepViewLoading'),
    success: document.getElementById('stepViewSuccess')
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
  const returnDateWrapper = document.getElementById('returnDateWrapper');
  const returnDateLabel = document.getElementById('returnDateLabel');
  const pickupSuggestions = document.getElementById('pickupSuggestions');
  const dropoffSuggestions = document.getElementById('dropoffSuggestions');
  const vehiclesContainer = document.getElementById('vehiclesContainer');

  const custName = document.getElementById('custName');
  const custEmail = document.getElementById('custEmail');
  const custPhone = document.getElementById('custPhone');
  const custGst = document.getElementById('custGst');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');

  const passengerCount = document.getElementById('passengerCount');
  const luggageCount = document.getElementById('luggageCount');
  const specialInstructions = document.getElementById('specialInstructions');

  const termsCheck = document.getElementById('termsCheck');
  const termsError = document.getElementById('termsError');
  const reviewSummary = document.getElementById('reviewSummary');

  const summaryRoute = document.getElementById('summaryRoute');
  const summaryDateTime = document.getElementById('summaryDateTime');
  const summaryDistance = document.getElementById('summaryDistance');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryTripType = document.getElementById('summaryTripType');
  const summaryVehicle = document.getElementById('summaryVehicle');
  const summaryPassengers = document.getElementById('summaryPassengers');
  const summaryLuggage = document.getElementById('summaryLuggage');
  const summaryBaseFare = document.getElementById('summaryBaseFare');
  const summaryDistanceCharge = document.getElementById('summaryDistanceCharge');
  const summaryDriverAllowance = document.getElementById('summaryDriverAllowance');
  const summaryTollParking = document.getElementById('summaryTollParking');
  const summaryTaxes = document.getElementById('summaryTaxes');
  const summaryTotal = document.getElementById('summaryTotal');

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
  /* ══════════════ INIT ══════════════ */
  const today = new Date().toISOString().split('T')[0];
  journeyDateInput.min = today;
  journeyDateInput.value = today;

  loadVehicles();
  updateSidebarSummary();

  /* ══════════════ HELPERS ══════════════ */
  function isValidObjectId(id) {
    if (!id) return false;
    return /^[0-9a-fA-F]{24}$/.test(String(id));
  }

  function fmt(n) { return '₹ ' + n.toLocaleString('en-IN'); }

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ══════════════ LOAD VEHICLES FROM API ══════════════ */
  async function loadVehicles() {
    vehiclesContainer.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      vehiclesContainer.innerHTML += `
        <div class="vehicle-skeleton">
          <div class="skel-img"></div>
          <div style="flex:1"><div class="skel-line w60"></div><div class="skel-line w40"></div><div class="skel-line w80"></div></div>
        </div>`;
    }

    try {
      const res = await fetch(`${API_BASE}/vehicles`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let list = null;
      if (data.success && Array.isArray(data.vehicles) && data.vehicles.length > 0) {
        list = data.vehicles;
      } else if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        list = data.data;
      } else if (Array.isArray(data) && data.length > 0) {
        list = data;
      }

      if (list) {
        const validOnes = list.filter(v => isValidObjectId(v._id));
        if (validOnes.length > 0) {
          vehiclesList = validOnes;
        } else {
          console.warn('API returned vehicles but none have valid ObjectId _id fields, using fallback');
          vehiclesList = fallbackVehicles;
        }
      } else {
        vehiclesList = fallbackVehicles;
      }
    } catch (err) {
      console.warn('Vehicle API unavailable, using fallback:', err.message);
      vehiclesList = fallbackVehicles;
    }

    renderVehicles();
    updateSidebarSummary();
  }

  /* ══════════════ DISTANCE / DURATION / FARE ══════════════ */
  function getDistanceKm() {
    const from = (pickupInput.value || '').trim().toLowerCase().split(',')[0].replace(/\s+/g, '');
    const to = (dropoffInput.value || '').trim().toLowerCase().split(',')[0].replace(/\s+/g, '');
    return distanceMap[`${from}-${to}`] || 100;
  }

  function getDurationStr(km) {
    const totalMin = Math.round((km / 55) * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return `~ ${m}m`;
    if (m === 0) return `~ ${h}h`;
    return `~ ${h}h ${m}m`;
  }

  function calculateFare() {
    if (!selectedVehicle) return { base: 0, distance: 0, driver: 0, toll: 0, tax: 0, total: 0 };
    const dist = getDistanceKm();
    const multiplier = tripType === 'Round Trip' ? 2 : 1;
    const effectiveDist = dist * multiplier;
    const ppkm = selectedVehicle.pricePerKm || 12;
    const baseFare = Math.round(ppkm * effectiveDist * 0.55);
    const distCharge = Math.round(ppkm * effectiveDist * 0.45);
    const driverAllowance = multiplier === 2 ? 500 : 300;
    const tollParking = Math.round(effectiveDist * 2.2);
    const subtotal = baseFare + distCharge + driverAllowance + tollParking;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;
    return { base: baseFare, distance: distCharge, driver: driverAllowance, toll: tollParking, tax, total };
  }

  /* ══════════════ NAVIGATION ══════════════ */
  function showStep(step) {
    currentStep = step;
    Object.keys(stepViews).forEach(k => stepViews[k].classList.remove('active'));
    stepViews[step].classList.add('active');
    if (typeof step === 'number') {
      stepIndicators.forEach((ind, i) => {
        const n = i + 1;
        ind.classList.remove('active', 'completed');
        if (n < step) ind.classList.add('completed');
        else if (n === step) ind.classList.add('active');
      });
      progressFill.style.width = (((step - 1) / 4) * 100) + '%';
    }
    const c = document.querySelector('.booking-page-container');
    if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateSidebarSummary();
  }

  /* ══════════════ BUTTON BINDINGS ══════════════ */
  document.getElementById('goToStep2Btn').onclick = () => { if (validateStep1()) showStep(2); };
  document.getElementById('backToStep1Btn').onclick = () => showStep(1);
  document.getElementById('goToStep3Btn').onclick = () => { if (validateStep2()) showStep(3); };
  document.getElementById('backToStep2Btn').onclick = () => showStep(2);
  document.getElementById('goToStep4Btn').onclick = () => showStep(4);
  document.getElementById('backToStep3Btn').onclick = () => showStep(3);
  document.getElementById('goToStep5Btn').onclick = () => { if (validateStep4()) { renderReview(); showStep(5); } };
  document.getElementById('backToStep4Btn').onclick = () => showStep(4);
  document.getElementById('confirmBookingBtn').onclick = () => { if (validateStep5()) submitBooking(); };

  document.getElementById('sidebarSecureBtn').onclick = () => {
    const map = { 1: 'goToStep2Btn', 2: 'goToStep3Btn', 3: 'goToStep4Btn', 4: 'goToStep5Btn', 5: 'confirmBookingBtn' };
    const btn = document.getElementById(map[currentStep]);
    if (btn) btn.click();
  };

  /* ══════════════ AUTOCOMPLETE ══════════════ */
  function setupAutocomplete(inputEl, dropdownEl) {
    inputEl.addEventListener('input', () => {
      const val = inputEl.value.trim().toLowerCase();
      dropdownEl.innerHTML = '';
      if (!val) { dropdownEl.style.display = 'none'; return; }
      const filtered = popularLocations.filter(l => l.toLowerCase().includes(val));
      if (!filtered.length) { dropdownEl.style.display = 'none'; return; }
      filtered.forEach(loc => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = loc;
        item.onclick = () => { inputEl.value = loc; dropdownEl.style.display = 'none'; updateSidebarSummary(); };
        dropdownEl.appendChild(item);
      });
      dropdownEl.style.display = 'block';
    });
    document.addEventListener('click', e => {
      if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target)) dropdownEl.style.display = 'none';
    });
  }
  setupAutocomplete(pickupInput, pickupSuggestions);
  setupAutocomplete(dropoffInput, dropoffSuggestions);

  /* ══════════════ SWAP / TRIP TYPE ══════════════ */
  swapLocationsBtn.onclick = () => {
    const t = pickupInput.value; pickupInput.value = dropoffInput.value; dropoffInput.value = t;
    updateSidebarSummary();
  };

  typeOneWayBtn.onclick = () => {
    tripType = 'One Way';
    typeOneWayBtn.classList.add('active'); typeRoundTripBtn.classList.remove('active');
    returnDateInput.disabled = true; returnDateInput.value = '';
    returnDateWrapper.style.opacity = '0.6'; returnDateWrapper.style.pointerEvents = 'none';
    returnDateLabel.style.opacity = '0.6';
    updateSidebarSummary();
  };

  typeRoundTripBtn.onclick = () => {
    tripType = 'Round Trip';
    typeRoundTripBtn.classList.add('active'); typeOneWayBtn.classList.remove('active');
    returnDateInput.disabled = false;
    returnDateWrapper.style.opacity = '1'; returnDateWrapper.style.pointerEvents = 'auto';
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
    returnDateInput.min = journeyDateInput.value;
    updateSidebarSummary();
  };

  [pickupInput, dropoffInput, journeyDateInput, journeyTimeInput, passengerCount, luggageCount].forEach(el => {
    el.addEventListener('change', updateSidebarSummary);
  });

  /* ══════════════ RENDER VEHICLES ══════════════ */
  function renderVehicles() {
    vehiclesContainer.innerHTML = '';
    vehiclesList.forEach((v, idx) => {
      const isAvailable = v.availability !== false;
      const card = document.createElement('div');
      card.className = 'vehicle-card' + (!isAvailable ? ' vehicle-unavailable' : '');
      if (idx === 0 && isAvailable) card.classList.add('selected');

      const imgSrc = v.image || `https://picsum.photos/seed/${v._id || v.name}/200/140.jpg`;
      const ppkm = v.pricePerKm || 12;

      card.innerHTML = `
        <span class="v-radio-indicator"></span>
        ${isAvailable ? `<img src="${imgSrc}" alt="${v.name}" class="vehicle-card-image" onerror="this.style.display='none'" />` : ''}
        <div class="vehicle-details-column">
          <div><span class="vehicle-title">${v.name}</span><span class="vehicle-class">${v.model || v.type || ''}</span></div>
          <div class="vehicle-specs">${v.seats || 4} Seats &bull; ${v.luggage || 2} Bags</div>
          <div class="vehicle-rate-note">${v.note || (v.type || '')}</div>
        </div>
        <div class="vehicle-price-tag">
          <span class="price-value">${fmt(ppkm)}</span>
          <span class="price-label">per km</span>
        </div>
        ${!isAvailable ? '<span class="vehicle-unavailable-badge">Unavailable</span>' : ''}`;

      if (isAvailable) {
        card.onclick = () => {
          document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedVehicle = v;
          updateSidebarSummary();
        };
      }
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

    if (!selectedVehicle) {
      const first = vehiclesList.find(v => v.availability !== false);
      if (first) selectedVehicle = first;
    }
  }

  /* ══════════════ SIDEBAR SUMMARY ══════════════ */
  function updateSidebarSummary() {
    const from = (pickupInput.value || '').trim().split(',')[0] || '—';
    const to = (dropoffInput.value || '').trim().split(',')[0] || '—';
    summaryRoute.textContent = (pickupInput.value.trim() && dropoffInput.value.trim()) ? `${from} → ${to}` : '—';
    summaryDateTime.textContent = journeyDateInput.value ? `${fmtDate(journeyDateInput.value)} at ${journeyTimeInput.value || '—'}` : '—';

    const dist = getDistanceKm();
    const multiplier = tripType === 'Round Trip' ? 2 : 1;
    summaryDistance.textContent = `~ ${dist * multiplier} km`;
    summaryDuration.textContent = tripType === 'Round Trip' ? `${getDurationStr(dist)} × 2` : getDurationStr(dist);
    summaryTripType.textContent = tripType;
    summaryVehicle.textContent = selectedVehicle ? selectedVehicle.name : '—';
    summaryPassengers.textContent = passengerCount ? passengerCount.value : '4';
    summaryLuggage.textContent = (luggageCount ? luggageCount.value : '2') + ' Bags';

    const fare = calculateFare();
    summaryBaseFare.textContent = fmt(fare.base);
    summaryDistanceCharge.textContent = fmt(fare.distance);
    summaryDriverAllowance.textContent = fmt(fare.driver);
    summaryTollParking.textContent = fmt(fare.toll);
    summaryTaxes.textContent = fmt(fare.tax);
    summaryTotal.textContent = fmt(fare.total);
  }

  /* ══════════════ VALIDATION ══════════════ */
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
    let ok = true;
    if (!pickupInput.value.trim()) { pickupInput.style.borderColor = '#D32F2F'; ok = false; } else pickupInput.style.borderColor = '';
    if (!dropoffInput.value.trim()) { dropoffInput.style.borderColor = '#D32F2F'; ok = false; } else dropoffInput.style.borderColor = '';
    if (!journeyDateInput.value) ok = false;
    return ok;
  }

  function validateStep2() {
    if (!selectedVehicle) { alert('Please select a vehicle to continue.'); return false; }
    return true;
  }

  function validateStep4() {
    let ok = true;
    if (!custName.value.trim()) { custName.classList.add('error'); nameError.style.display = 'block'; ok = false; }
    else { custName.classList.remove('error'); nameError.style.display = 'none'; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(custEmail.value.trim())) { custEmail.classList.add('error'); emailError.style.display = 'block'; ok = false; }
    else { custEmail.classList.remove('error'); emailError.style.display = 'none'; }
    if (!/^[6-9][0-9]{9}$/.test(custPhone.value.trim())) { custPhone.classList.add('error'); phoneError.style.display = 'block'; ok = false; }
    else { custPhone.classList.remove('error'); phoneError.style.display = 'none'; }
    return ok;
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
    if (!termsCheck.checked) { termsError.style.display = 'block'; return false; }
    termsError.style.display = 'none';
    return true;
  }

  /* Clear errors on typing */
  custName.addEventListener('input', () => { nameError.style.display = 'none'; custName.classList.remove('error'); });
  custEmail.addEventListener('input', () => { emailError.style.display = 'none'; custEmail.classList.remove('error'); });
  custPhone.addEventListener('input', () => { phoneError.style.display = 'none'; custPhone.classList.remove('error'); });

  /* ══════════════ RENDER REVIEW (Step 5) ══════════════ */
  function renderReview() {
    const fare = calculateFare();
    const dist = getDistanceKm();
    const bags = luggageCount ? luggageCount.value : '2';
    reviewSummary.innerHTML = `
      <div class="review-section">
        <h4>Trip Details</h4>
        <div class="review-row"><span>Pickup</span><span>${pickupInput.value.trim()}</span></div>
        <div class="review-row"><span>Drop-off</span><span>${dropoffInput.value.trim()}</span></div>
        <div class="review-row"><span>Date &amp; Time</span><span>${fmtDate(journeyDateInput.value)} at ${journeyTimeInput.value}</span></div>
        <div class="review-row"><span>Trip Type</span><span>${tripType}</span></div>
        ${tripType === 'Round Trip' && returnDateInput.value ? `<div class="review-row"><span>Return Date</span><span>${fmtDate(returnDateInput.value)}</span></div>` : ''}
        <div class="review-row"><span>Estimated Distance</span><span>~ ${dist} km${tripType === 'Round Trip' ? ' (× 2)' : ''}</span></div>
      </div>
      <div class="review-section">
        <h4>Vehicle</h4>
        <div class="review-row"><span>Selected</span><span>${selectedVehicle.name} — ${selectedVehicle.model || selectedVehicle.type || ''}</span></div>
        <div class="review-row"><span>Capacity</span><span>${selectedVehicle.seats} Seats &bull; ${selectedVehicle.luggage} Bags</span></div>
        <div class="review-row"><span>Rate</span><span>${fmt(selectedVehicle.pricePerKm || 0)} per km</span></div>
      </div>
      <div class="review-section">
        <h4>Passengers &amp; Luggage</h4>
        <div class="review-row"><span>Passengers</span><span>${passengerCount.value}</span></div>
        <div class="review-row"><span>Luggage Bags</span><span>${bags}</span></div>
        ${specialInstructions.value.trim() ? `<div class="review-row"><span>Special Instructions</span><span>${specialInstructions.value.trim()}</span></div>` : ''}
      </div>
      <div class="review-section">
        <h4>Customer Details</h4>
        <div class="review-row"><span>Full Name</span><span>${custName.value.trim()}</span></div>
        <div class="review-row"><span>Email</span><span>${custEmail.value.trim()}</span></div>
        <div class="review-row"><span>Mobile</span><span>+91 ${custPhone.value.trim()}</span></div>
        ${custGst.value.trim() ? `<div class="review-row"><span>GST Number</span><span>${custGst.value.trim().toUpperCase()}</span></div>` : ''}
      </div>
      <div class="review-section" style="border-color: var(--maroon-dark, #6E1F2B); background: rgba(110,31,43,0.02);">
        <h4>Fare Breakdown</h4>
        <div class="review-row"><span>Base Fare</span><span>${fmt(fare.base)}</span></div>
        <div class="review-row"><span>Distance Charge</span><span>${fmt(fare.distance)}</span></div>
        <div class="review-row"><span>Driver Allowance</span><span>${fmt(fare.driver)}</span></div>
        <div class="review-row"><span>Toll &amp; Parking (est.)</span><span>${fmt(fare.toll)}</span></div>
        <div class="review-row"><span>Taxes &amp; Fees</span><span>${fmt(fare.tax)}</span></div>
        <div class="review-row" style="border-top: 2px solid var(--maroon-dark, #6E1F2B); margin-top: 6px; padding-top: 12px; border-bottom: none;">
          <span style="font-size: 16px; font-weight: 700; color: #1a1a1a;">Estimated Total</span>
          <span style="font-size: 20px; font-weight: 700; color: var(--maroon-dark, #6E1F2B);">${fmt(fare.total)}</span>
        </div>
      </div>`;
  }

  /* ═══════════════════════════════════════════════════
     SUBMIT BOOKING
     ═══════════════════════════════════════════════════ */
  async function submitBooking() {
    showStep('loading');
    document.querySelector('.steps-progress-wrapper').style.opacity = '0.3';

    const fare = calculateFare();
    lastBookingFare = fare;
    const dist = getDistanceKm();

    const notesParts = [
      `Trip Type: ${tripType}`,
      `Time: ${journeyTimeInput.value}`,
      `Distance: ~${dist} km`,
      `Duration: ${getDurationStr(dist)}`,
      `Luggage: ${luggageCount.value} Bags`,
      `Base Fare: ${fmt(fare.base)}`,
      `Distance Charge: ${fmt(fare.distance)}`,
      `Driver Allowance: ${fmt(fare.driver)}`,
      `Toll & Parking: ${fmt(fare.toll)}`,
      `Taxes & Fees: ${fmt(fare.tax)}`
    ];
    if (specialInstructions.value.trim()) {
      notesParts.push(`Special Instructions: ${specialInstructions.value.trim()}`);
    }

    let vehicleIdToSend = null;
    if (selectedVehicle && isValidObjectId(selectedVehicle._id)) {
      vehicleIdToSend = selectedVehicle._id;
    } else {
      notesParts.push(`Vehicle: ${selectedVehicle.name} — ${selectedVehicle.model || selectedVehicle.type || ''}`);
      notesParts.push(`Vehicle Seats: ${selectedVehicle.seats}`);
      notesParts.push(`Vehicle Rate: ${selectedVehicle.pricePerKm}/km`);
    }

    const notesString = notesParts.join(' | ');

    let numberOfDays = 1;
    if (tripType === 'Round Trip' && returnDateInput.value && journeyDateInput.value) {
      const pickup = new Date(journeyDateInput.value);
      const returnD = new Date(returnDateInput.value);
      const diff = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));
      if (diff > 0) numberOfDays = diff;
    }

    const payload = {
      bookingType: 'vehicle',
      vehicleId: vehicleIdToSend,
      name: custName.value.trim(),
      email: custEmail.value.trim(),
      phone: '+91' + custPhone.value.trim(),
      pickupLocation: pickupInput.value.trim(),
      dropoffLocation: dropoffInput.value.trim(),
      pickupDate: journeyDateInput.value,
      returnDate: (tripType === 'Round Trip' && returnDateInput.value) ? returnDateInput.value : null,
      numberOfPeople: Number(passengerCount.value),
      numberOfDays: numberOfDays,
      totalPrice: fare.total,
      advancePaid: 0,
      paymentStatus: 'pending',
      gstNumber: custGst.value.trim().toUpperCase() || null,
      notes: notesString
    };

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Booking failed. Please try again.');
      }

      const booking = data.data;
      successResId.textContent = booking.bookingId;
      successEmail.textContent = booking.email;

      showStep('success');
      document.querySelector('.steps-progress-wrapper').style.display = 'none';
      document.querySelector('.booking-summary-sidebar').style.display = 'none';
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

    } catch (err) {
      console.error('Booking error:', err);
      alert('Something went wrong while confirming your booking:\n' + err.message + '\n\nPlease try again.');
      document.querySelector('.steps-progress-wrapper').style.opacity = '1';
      showStep(5);
    }
  }

  /* ═══════════════════════════════════════════════════
     PDF ITINERARY DOWNLOAD
     ═══════════════════════════════════════════════════ */
  document.getElementById('downloadItineraryBtn').onclick = () => {
    const bookingId = successResId.textContent;
    const email = successEmail.textContent;
    const fare = lastBookingFare || calculateFare();
    const dist = getDistanceKm();

    const pdfHTML = `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <div style="background:#6E1F2B;padding:30px 40px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="margin:0 0 4px 0;font-size:28px;font-weight:700;color:#fff;letter-spacing:4px;">VOYAGO</h1>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;">TOURS & TRAVELS</p>
        </div>
        <div style="background:#fdf6f7;padding:20px 40px;text-align:center;border-bottom:2px dashed #6E1F2B;">
          <p style="margin:0 0 4px 0;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;font-weight:600;">Booking Reference ID</p>
          <p style="margin:0;font-size:24px;font-weight:700;color:#6E1F2B;letter-spacing:1px;">${bookingId}</p>
        </div>
        <div style="background:#e8f5e9;padding:14px 40px;text-align:center;">
          <p style="margin:0;font-size:15px;font-weight:600;color:#2E7D32;">✓ BOOKING CONFIRMED</p>
        </div>
        <div style="padding:24px 40px;">
          <h3 style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#6E1F2B;text-transform:uppercase;letter-spacing:1px;">Trip Details</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr><td style="padding:8px 0;color:#777;width:40%;">Pickup</td><td style="padding:8px 0;font-weight:600;">${pickupInput.value.trim()}</td></tr>
            <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:8px 0;color:#777;">Drop-off</td><td style="padding:8px 0;font-weight:600;">${dropoffInput.value.trim()}</td></tr>
            <tr><td style="padding:8px 0;color:#777;">Date & Time</td><td style="padding:8px 0;font-weight:600;">${fmtDate(journeyDateInput.value)} at ${journeyTimeInput.value}</td></tr>
            <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:8px 0;color:#777;">Trip Type</td><td style="padding:8px 0;font-weight:600;">${tripType}</td></tr>
            ${tripType === 'Round Trip' && returnDateInput.value ? `<tr><td style="padding:8px 0;color:#777;">Return Date</td><td style="padding:8px 0;font-weight:600;">${fmtDate(returnDateInput.value)}</td></tr>` : ''}
            <tr><td style="padding:8px 0;color:#777;">Distance</td><td style="padding:8px 0;font-weight:600;">~ ${dist} km${tripType === 'Round Trip' ? ' (× 2)' : ''}</td></tr>
            <tr><td style="padding:8px 0;color:#777;">Duration</td><td style="padding:8px 0;font-weight:600;">${getDurationStr(dist)}</td></tr>
          </table>
        </div>
        <div style="padding:0 40px 24px;">
          <h3 style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#6E1F2B;text-transform:uppercase;letter-spacing:1px;">Vehicle</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr><td style="padding:8px 0;color:#777;width:40%;">Selected</td><td style="padding:8px 0;font-weight:600;">${selectedVehicle ? selectedVehicle.name : 'N/A'}${selectedVehicle && selectedVehicle.model ? ' — ' + selectedVehicle.model : ''}</td></tr>
            <tr><td style="padding:8px 0;color:#777;">Capacity</td><td style="padding:8px 0;font-weight:600;">${selectedVehicle ? selectedVehicle.seats : 'N/A'} Seats &bull; ${selectedVehicle ? selectedVehicle.luggage : 'N/A'} Bags</td></tr>
            <tr><td style="padding:8px 0;color:#777;">Rate</td><td style="padding:8px 0;font-weight:600;">${selectedVehicle ? fmt(selectedVehicle.pricePerKm) : 'N/A'} per km</td></tr>
          </table>
        </div>
        <div style="padding:0 40px 24px;">
          <h3 style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#6E1F2B;text-transform:uppercase;letter-spacing:1px;">Customer Details</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr><td style="padding:8px 0;color:#777;width:40%;">Name</td><td style="padding:8px 0;font-weight:600;">${custName.value.trim()}</td></tr>
            <tr><td style="padding:8px 0;color:#777;">Email</td><td style="padding:8px 0;font-weight:600;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#777;">Phone</td><td style="padding:8px 0;font-weight:600;">+91 ${custPhone.value.trim()}</td></tr>
            ${custGst.value.trim() ? `<tr><td style="padding:8px 0;color:#777;">GST</td><td style="padding:8px 0;font-weight:600;">${custGst.value.trim().toUpperCase()}</td></tr>` : ''}
          </table>
        </div>
        <div style="padding:0 40px 24px;">
          <h3 style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#6E1F2B;text-transform:uppercase;letter-spacing:1px;">Fare Breakdown</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;border:2px solid #6E1F2B;border-radius:8px;overflow:hidden;">
            <tr style="background:rgba(110,31,43,0.04);"><td style="padding:10px 14px;color:#777;">Base Fare</td><td style="padding:10px 14px;text-align:right;">${fmt(fare.base)}</td></tr>
            <tr style="background:rgba(110,31,43,0.02);"><td style="padding:10px 14px;color:#777;">Distance Charge</td><td style="padding:10px 14px;text-align:right;">${fmt(fare.distance)}</td></tr>
            <tr style="background:rgba(110,31,43,0.04);"><td style="padding:10px 14px;color:#777;">Driver Allowance</td><td style="padding:10px 14px;text-align:right;">${fmt(fare.driver)}</td></tr>
            <tr style="background:rgba(110,31,43,0.02);"><td style="padding:10px 14px;color:#777;">Toll & Parking</td><td style="padding:10px 14px;text-align:right;">${fmt(fare.toll)}</td></tr>
            <tr style="background:rgba(110,31,43,0.04);"><td style="padding:10px 14px;color:#777;">Taxes & Fees</td><td style="padding:10px 14px;text-align:right;">${fmt(fare.tax)}</td></tr>
            <tr style="background:#6E1F2B;"><td style="padding:14px;font-weight:700;color:#fff;font-size:15px;">Estimated Total</td><td style="padding:14px;text-align:right;font-weight:700;color:#fff;font-size:18px;">${fmt(fare.total)}</td></tr>
          </table>
        </div>
        <div style="background:#f9f9f9;padding:20px 40px;border-radius:0 0 8px 8px;">
          <p style="margin:0 0 8px 0;font-size:12px;color:#555;">📞 For queries, contact our agent: <strong>+91 9359873623</strong></p>
          <p style="margin:0 0 8px 0;font-size:12px;color:#555;">✉ Email: hello@voyago.in</p>
          <p style="margin:0 0 12px 0;font-size:11px;color:#999;">Keep your Booking ID (<strong>${bookingId}</strong>) handy for all communications.</p>
          <p style="margin:0;font-size:10px;color:#bbb;text-align:center;">&copy; ${new Date().getFullYear()} Voyago Tours & Travels. All rights reserved.</p>
        </div>
      </div>`;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = pdfHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    document.body.appendChild(tempDiv);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Voyago-Itinerary-${bookingId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof html2pdf !== 'undefined') {
      html2pdf().set(opt).from(tempDiv).save().then(() => {
        document.body.removeChild(tempDiv);
      }).catch(err => {
        console.error('PDF generation failed:', err);
        document.body.removeChild(tempDiv);
        alert('PDF download failed. Please try again.');
      });
    } else {
      alert('PDF library not loaded. Please refresh the page and try again.');
      document.body.removeChild(tempDiv);
    }
  };

});