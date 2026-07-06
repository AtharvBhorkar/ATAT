const vehicles = [{
    id: 'sedan-dzire',
    type: 'Sedan',
    name: 'Swift Dzire',
    badge: 'MOST BOOKED',
    rating: 4.8,
    totalTrips: 1840,
    description: 'India\'s classic highway companion — smooth, fuel-efficient and perfectly sized for couples or small families on long drives.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=700&q=80',
    pricing: { perKm: 12, perDay: 2800, minimumFare: 350, advance: 280, advancePercentage: 10,
        driverCharges: 'Included', tollParking: 'Extra (stated upfront)', balanceDue: 'On journey day' },
    specifications: { seating: '4 Passengers', fuel: 'Petrol / CNG', ac: 'Fully AC',
        luggage: '2 Large Bags', transmission: 'Manual / Auto', mileage: '22–26 km/L' },
    amenities: ['Air Conditioning', 'USB Charging Port', 'GPS Navigation', 'Music System',
        'Reclining Seats', 'Sanitised After Each Trip', 'Emergency Assistance', 'Verified Driver',
        'Bluetooth Connectivity', 'Phone Holder'
    ],
    highlights: ['Fully insured rides', 'Free cancellation', 'Instant confirmation'],
    whyChoose: 'The Swift Dzire is the perfect balance of economy and comfort. With its excellent fuel efficiency and compact size, it navigates city traffic and open highways with equal ease — ideal for 2–4 people on short or medium trips.',
    idealFor: ['Couples', 'Small Families', 'Business Trips', 'Airport Transfers'],
    cancellationPolicy: 'Free cancellation up to 24 hrs before pickup.',
    reviews: [
        { name: 'Rahul Sharma', stars: 5, comment: 'Excellent car, very smooth ride. Driver was punctual and polite.' },
        { name: 'Priya Patel', stars: 4, comment: 'Great value for money. AC was perfect for the summer heat.' }
    ]
},];

const packages = [{
    id: 'shimla-manali',
    category: 'hill',
    badge: 'Hill Station',
    name: 'Shimla–Manali Grand Tour',
    duration: '6 Days / 5 Nights',
    rating: 4.8,
    totalReviews: 2400,
    description: 'Snow-capped peaks, colonial charm, and mountain highways on one epic northern escape.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    pricing: { amount: 18500, currency: '₹', per: 'person' },
    includes: ['Private Cab', '3★ Hotel', 'Meals'],
    vehicle: 'Swift Dzire',
    highlights: ['Snow-capped peaks views', 'Colonial heritage walks', 'Mountain highway drives',
        'Experienced driver-guide'
    ],
    itinerary: {
        day1: 'Arrival in Shimla. Check into your hotel and take a leisurely walk on the iconic Mall Road. Visit the historic Christ Church and enjoy the vibrant evening atmosphere.',
        day2: 'Full day Shimla sightseeing: Jakhoo Temple for panoramic views, the Vice Regal Lodge, and the charming Gaiety Theatre. Spend the evening exploring the local markets.',
        day3: 'Drive from Shimla to Manali via the scenic Kullu Valley. Stop at Pandoh Dam and enjoy the breathtaking views of the Beas River. Arrive in Manali and check in.',
        day4: 'Manali local sightseeing: Hadimba Temple, the ancient Vashisht hot springs, and the picturesque Manali Club House. Visit the Tibetan monastery and explore the Old Manali village.',
        day5: 'Full day excursion to Solang Valley. Enjoy adventure activities like paragliding, zorbing, and skiing (seasonal). Return to Manali in the evening.',
        day6: 'Departure from Manali after breakfast. Drive back with memories of the majestic Himalayas.'
    },
    amenities: ['Private AC Cab', 'Hotel Accommodation', 'Breakfast & Dinner', 'Sightseeing Included',
        'Driver Allowance', 'Fuel & Toll Charges', '24/7 Support'
    ],
    notIncluded: ['Personal expenses', 'Entry tickets to monuments', 'Adventure activity charges',
        'Travel insurance'
    ],
    bestTime: 'March to June and September to November',
    groupSize: '2–6 people',
    reviews: [
        { name: 'Amit Verma', stars: 5, comment: 'Absolutely magical. The mountains, the snow, the colonial charm — everything was perfect.' },
        { name: 'Sneha Reddy', stars: 4, comment: 'Well-planned itinerary. The driver was excellent on the winding roads.' }
    ],
    whyChoose: 'This grand tour combines the colonial elegance of Shimla with the adventure of Manali. Perfect for families and couples, it offers the best of Himachal in one seamless journey.'
},];