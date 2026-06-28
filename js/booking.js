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


  // ─── INITIALIZATION ───
  // Parse URL query parameters for dynamic selection
  const urlParams = new URLSearchParams(window.location.search);
  
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

  backToStep4Btn.addEventListener('click', () => {
    showStep(4);
  });

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
    const vehicle = vehiclesData[selectedVehicleId];
    if (!vehicle) return;

    const base = vehicle.baseFare;
    
    // Formula: First 100km included in Base Fare. Rest at per-km rate.
    const freeKm = 100;
    const billableKm = Math.max(0, distance - freeKm);
    const distanceChargeVal = billableKm * vehicle.rate;

    let allowanceMultiplier = 1;
    let tollMultiplier = 1;

    if (tripType === 'Round Trip') {
      // Driver allowance increases for round trip
      allowanceMultiplier = 1.8;
      // Tolls double
      tollMultiplier = 2;
    }

    const driverAllow = Math.round(vehicle.driverAllowance * allowanceMultiplier);
    const tollPark = Math.round(vehicle.tollParking * tollMultiplier);
    
    const subtotal = base + distanceChargeVal + driverAllow + tollPark;
    
    // Tax is 6.67% of subtotal (rounded to nearest 50)
    const taxVal = Math.round((subtotal * 0.0667) / 10) * 10;
    
    const total = subtotal + taxVal;

    // Update sidebar text content
    summaryBaseFare.textContent = `₹ ${base.toLocaleString('en-IN')}`;
    summaryDistanceCharge.textContent = `₹ ${distanceChargeVal.toLocaleString('en-IN')}`;
    summaryDriverAllowance.textContent = `₹ ${driverAllow.toLocaleString('en-IN')}`;
    summaryTollParking.textContent = `₹ ${tollPark.toLocaleString('en-IN')}`;
    summaryTaxes.textContent = `₹ ${taxVal.toLocaleString('en-IN')}`;
    summaryTotal.textContent = `₹ ${total.toLocaleString('en-IN')}`;

    // Update Cash payable placeholder on Step 5 if needed
    cashPayableAmt.textContent = `₹ ${total.toLocaleString('en-IN')}`;

    // Update details in Step 2 vehicle pricing tags dynamically as well!
    updateVehicleListPricings(distance);
  }

  // Update vehicle pricing cards in step 2 dynamically based on current route distance!
  function updateVehicleListPricings(distance) {
    Object.keys(vehiclesData).forEach(vKey => {
      const v = vehiclesData[vKey];
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

      // Find individual vehicle price display in DOM and update it
      const priceText = document.getElementById(`vPriceVal-${v.id}`);
      if (priceText) {
        priceText.textContent = `₹ ${total.toLocaleString('en-IN')}`;
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
  cardNumber.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += val[i];
    }
    e.target.value = formatted;
  });

  // Expiry date formatting (MM/YY)
  cardExpiry.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
    if (val.length >= 2) {
      e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
    } else {
      e.target.value = val;
    }
  });


  // ─── VALIDATION SCHEMES ───
  function validateStep1() {
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
    let isValid = true;
    const activeMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    if (activeMethod === 'card') {
      // Validate Card Number (16 digits formatted is 19 characters)
      const cNum = cardNumber.value.replace(/\s/g, '');
      if (cNum.length !== 16 || isNaN(cNum)) {
        cardNumber.classList.add('error');
        cardNumError.style.display = 'block';
        isValid = false;
      } else {
        cardNumber.classList.remove('error');
        cardNumError.style.display = 'none';
      }

      // Validate Expiry (MM/YY)
      const exp = cardExpiry.value;
      const expRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expRegex.test(exp)) {
        cardExpiry.classList.add('error');
        cardExpiryError.style.display = 'block';
        isValid = false;
      } else {
        cardExpiry.classList.remove('error');
        cardExpiryError.style.display = 'none';
      }

      // Validate CVV (3 or 4 digits)
      const cvv = cardCvv.value;
      if (cvv.length < 3 || cvv.length > 4 || isNaN(cvv)) {
        cardCvv.classList.add('error');
        cardCvvError.style.display = 'block';
        isValid = false;
      } else {
        cardCvv.classList.remove('error');
        cardCvvError.style.display = 'none';
      }
    } else if (activeMethod === 'upi') {
      const upiVal = upiId.value.trim();
      if (!upiVal || !upiVal.includes('@')) {
        upiId.classList.add('error');
        upiError.style.display = 'block';
        isValid = false;
      } else {
        upiId.classList.remove('error');
        upiError.style.display = 'none';
      }
    }

    // Terms check box
    if (!termsCheck.checked) {
      termsError.style.display = 'block';
      isValid = false;
    } else {
      termsError.style.display = 'none';
    }

    return isValid;
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

});
