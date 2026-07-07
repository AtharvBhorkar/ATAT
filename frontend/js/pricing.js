(function () {
    'use strict';

    // const API_BASE = window.location.port === '5500' || window.location.port === '3000'
    //     ? 'http://localhost:5000/api'
    //     : '/api';
    const API_BASE =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api"
        : "https://atat-backend.onrender.com/api";


    const skeletonCSS = `
        .skeleton-card{background:#fff;border-radius:12px;overflow:hidden;border:1px solid var(--border,rgba(0,0,0,.08));animation:pulse 1.5s ease-in-out infinite}
        .skeleton-img{height:180px;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        .skeleton-body{padding:16px}
        .skeleton-line{height:12px;border-radius:6px;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;margin-bottom:10px}
        .skeleton-line.long{width:80%}
        .skeleton-line.short{width:50%}
        .skeleton-strip{min-width:260px;border-radius:10px;overflow:hidden;background:#fff;border:1px solid var(--border,rgba(0,0,0,.08));animation:pulse 1.5s ease-in-out infinite}
        .skeleton-strip-img{height:140px;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        .skeleton-strip-body{padding:12px}
        .error-state{text-align:center;padding:60px 20px;grid-column:1/-1}
        .error-state h3{color:var(--accent-color,#b8552e);margin-bottom:8px}
        .error-state p{color:var(--text-secondary,#666);margin-bottom:20px}
        .error-state .btn-primary{display:inline-block}
        .loading-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,.7);z-index:9999;display:flex;align-items:center;justify-content:center;transition:opacity .3s}
        .loading-overlay.hidden{opacity:0;pointer-events:none}
        .loading-spinner{width:40px;height:40px;border:3px solid var(--border,rgba(0,0,0,.1));border-top-color:var(--accent-color,#b8552e);border-radius:50%;animation:spin .8s linear infinite}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
        @keyframes spin{to{transform:rotate(360deg)}}
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = skeletonCSS;
    document.head.appendChild(styleEl);

    function starSVG() {
        return '<svg viewBox="0 0 12 12" fill="none"><path d="M6 1l1 3h3l-2.4 1.8.9 3L6 7.2 3.5 8.8l.9-3L2 4h3z" fill="#D89E41"/></svg>';
    }

    function starSVGSmall() {
        return '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M6 1l1 3h3l-2.4 1.8.9 3L6 7.2 3.5 8.8l.9-3L2 4h3z" fill="#D89E41"/></svg>';
    }

    function amenityCheck() {
        return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l3.5 3.5L13 4"/></svg>';
    }

    function getBadgeHTML(badge) {
        if (!badge) return '<span class="badge-pill empty">—</span>';
        return '<span class="badge-pill">' + badge + '</span>';
    }

    function getBadgeCorner(badge) {
        if (!badge) return '';
        return '<span class="badge-corner">' + badge + '</span>';
    }

    function getDetailBadge(badge) {
        if (!badge) return '<span class="detail-badge empty"></span>';
        return '<span class="detail-badge">' + badge + '</span>';
    }

    function getRatingStars(rating) {
        const full = Math.floor(rating);
        const half = rating - full >= 0.5 ? 1 : 0;
        let html = '';
        for (let i = 0; i < 5; i++) {
            if (i < full) {
                html += starSVG();
            } else if (i === full && half) {
                html += '<svg viewBox="0 0 12 12" fill="none"><path d="M6 1l1 3h3l-2.4 1.8.9 3L6 7.2 3.5 8.8l.9-3L2 4h3z" fill="#D89E41" opacity="0.6"/></svg>';
            } else {
                html += '<svg viewBox="0 0 12 12" fill="none"><path d="M6 1l1 3h3l-2.4 1.8.9 3L6 7.2 3.5 8.8l.9-3L2 4h3z" fill="#ddd"/></svg>';
            }
        }
        return html;
    }

    function getStarsSmall(rating) {
        const full = Math.floor(rating);
        let html = '';
        for (let i = 0; i < 5; i++) {
            html += i < full ? starSVGSmall() :
                '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M6 1l1 3h3l-2.4 1.8.9 3L6 7.2 3.5 8.8l.9-3L2 4h3z" fill="#ddd"/></svg>';
        }
        return html;
    }

    let vehicles = [];
    let packages = [];
    let activeTab = 'vehicles';
    let activeVehicleId = null;
    let activePackageId = null;
    let searchQuery = '';
    let typeFilter = 'all';
    let catFilter = 'all';
    let sortOption = 'default';
    let isDataLoaded = false;
    let tripType = 'local';

    async function fetchFromAPI(endpoint) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        const json = await response.json();
        if (!json.success) {
            throw new Error(json.message || 'API returned unsuccessful response');
        }
        return json;
    }

    async function fetchVehicles() {
        const json = await fetchFromAPI('/public/vehicles?limit=100');
        const rawList = json.data || json.vehicles || [];
        return rawList.map(transformVehicle);
    }

    async function fetchPackages() {
        const json = await fetchFromAPI('/public/packages?limit=100&active=true');
        const rawList = json.data || json.packages || [];
        return rawList.map(transformPackage);
    }


    function transformVehicle(v) {
        const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : 'N/A';

        return {
            id: v.slug || (v._id ? v._id.toString() : ''),
            name: v.name || 'Unnamed Vehicle',
            type: capitalize(v.type),
            image: v.image || 'https://placehold.co/600x400/e8e8e8/999?text=No+Image',
            description: v.description || v.note || '',
            whyChoose: v.whyChoose || 'Reliable and comfortable ride for your journey.',

            specifications: {
                seating: v.seats ? `${v.seats}+1 Seater` : 'N/A',
                fuel: capitalize(v.fuel || v.fuelType),
                ac: v.ac !== false ? 'Full AC' : 'Non-AC',
                luggage: v.luggage ? `${v.luggage} Large Bags` : (v.bags ? `${v.bags} Large Bags` : 'N/A'),
                transmission: capitalize(v.transmission),
                mileage: v.mileage || 'N/A'
            },

            amenities: (v.amenities && v.amenities.length > 0) ? v.amenities : (v.features || []),
            highlights: v.highlights || [],

            pricing: {
                perKm: v.pricePerKm || 0,
                perDay: v.pricePerDay || 0,
                minimumFare: v.minimumFare || v.minFare || 0,
                advance: v.advance || 0,
                advancePercentage: v.advancePercentage || 10,
                driverCharges: v.driverCharges || 'Included',
                tollParking: v.tollParking || 'Extra',
                balanceDue: v.balanceDue || 'Before Journey'
            },

            rating: v.rating || 0,
            totalTrips: v.totalTrips || 0,
            badge: v.badge || '',
            cancellationPolicy: v.cancellationPolicy || 'Free cancellation up to 24 hours before pickup.',
            reviews: (v.reviews && v.reviews.length > 0) ? v.reviews : [
                { name: 'Traveller', stars: 5, comment: 'Great experience with this vehicle.' }
            ],
            idealFor: v.idealFor || ['City Tours', 'Outstation Trips']
        };
    }

    function transformPackage(p) {
        const itinerary = {};
        if (Array.isArray(p.itinerary) && p.itinerary.length > 0) {
            p.itinerary.forEach(item => {
                if (item.day) {
                    const parts = [item.title, item.description].filter(Boolean);
                    itinerary[`Day ${item.day}`] = parts.join(' — ') || 'Details coming soon.';
                }
            });
        }
        if (Object.keys(itinerary).length === 0) {
            const days = parseInt(p.durationNights) || parseInt(p.duration) || 1;
            for (let i = 1; i <= days; i++) {
                itinerary[`Day ${i}`] = 'Detailed itinerary available on request.';
            }
        }

        return {
            id: p.slug || (p._id ? p._id.toString() : ''),
            name: p.name || p.title || 'Unnamed Package',
            category: p.category || '',
            image: p.image || 'https://placehold.co/600x400/e8e8e8/999?text=No+Image',
            description: p.description || '',
            whyChoose: p.whyChoose || 'Carefully curated package for a memorable experience.',
            duration: p.duration || `${p.durationNights || 1}N/${(p.durationNights || 1) + 1}D`,
            vehicle: p.vehicle || 'Sedan / SUV',
            bestTime: p.bestTime || 'Round Year',
            groupSize: p.groupSize || `${p.minPeople || 1}–${p.maxPeople || 10} People`,
            itinerary: itinerary,

            pricing: {
                amount: p.price || 0,
                per: 'person'
            },

            includes: p.includes || [],
            notIncluded: p.notIncluded || p.excludes || [],
            amenities: p.amenities || [],
            highlights: p.highlights || [],

            rating: p.rating || 0,
            totalReviews: p.totalBookings || 0,
            badge: p.badge || '',
            reviews: (p.reviews && p.reviews.length > 0) ? p.reviews : [
                { name: 'Traveller', stars: 5, comment: 'Amazing trip, well organized!' }
            ]
        };
    }

    function showLoadingState() {
        const skel = '<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line long"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>';
        const skelStrip = '<div class="skeleton-strip"><div class="skeleton-strip-img"></div><div class="skeleton-strip-body"><div class="skeleton-line long"></div><div class="skeleton-line short"></div></div></div>';
        const tableSkel = '<tr><td colspan="8" style="text-align:center;padding:30px;color:#999;">Loading data from server…</td></tr>';

        const vg = document.getElementById('vehicleCardsGrid');
        const pg = document.getElementById('packageCardsGrid');
        const vs = document.getElementById('vehicleStrip');
        const ps = document.getElementById('packageStrip');
        const vtb = document.getElementById('vehicleTableBody');
        const ptb = document.getElementById('packageTableBody');

        if (vg) vg.innerHTML = skel.repeat(6);
        if (pg) pg.innerHTML = skel.repeat(6);
        if (vs) vs.innerHTML = skelStrip.repeat(4);
        if (ps) ps.innerHTML = skelStrip.repeat(4);
        if (vtb) vtb.innerHTML = tableSkel;
        if (ptb) ptb.innerHTML = tableSkel;
    }

    function showErrorState(message) {
        const errHtml = `
            <div class="error-state">
                <h3>⚠️ Unable to Load Data</h3>
                <p>${message}</p>
                <button onclick="window.retryLoadData()" class="btn-primary" style="padding:10px 28px;border:none;cursor:pointer;">Try Again</button>
            </div>`;
        ['vehicleCardsGrid', 'packageCardsGrid'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = errHtml;
        });
    }

    const LOCAL_PRICING = {
        hatchback: { halfDay: 700,  eightHr: 1300, fullDay: 2200, extraKm: 11, extraHr: 100, night: 200, maxPax: 4 },
        sedan:     { halfDay: 900,  eightHr: 1600, fullDay: 2700, extraKm: 13, extraHr: 100, night: 200, maxPax: 4 },
        luxury:    { halfDay: 1000, eightHr: 1800, fullDay: 3500, extraKm: 15, extraHr: 120, night: 200, maxPax: 4 },
        suv:       { halfDay: null, eightHr: 2500, fullDay: 3800, extraKm: 16, extraHr: 200, night: 250, maxPax: 6 },
        muv:       { halfDay: null, eightHr: 3000, fullDay: 4800, extraKm: 21, extraHr: 200, night: 250, maxPax: 6 }
    };

    function getLocalPricing(type) {
        const key = (type || '').toLowerCase();
        return LOCAL_PRICING[key] || LOCAL_PRICING.sedan;
    }

    const OUTSTATION_PRICING = {
        hatchback: { ratePerKm: 11, minKmPerDay: 250, extraKm: 11, driverTA: 200, maxPax: 4 },
        sedan:     { ratePerKm: 13, minKmPerDay: 250, extraKm: 13, driverTA: 200, maxPax: 4 },
        luxury:    { ratePerKm: 15, minKmPerDay: 250, extraKm: 15, driverTA: 200, maxPax: 4 },
        suv:       { ratePerKm: 16, minKmPerDay: 250, extraKm: 16, driverTA: 200, maxPax: 6 },
        muv:       { ratePerKm: 21, minKmPerDay: 250, extraKm: 21, driverTA: 200, maxPax: 6 },
        tempo:     { ratePerKm: 32, minKmPerDay: 250, extraKm: 32, driverTA: 200, maxPax: 20 },
        bus:       { ratePerKm: 32, minKmPerDay: 250, extraKm: 32, driverTA: 200, maxPax: 20 }
    };

    function getOutstationPricing(type) {
        const key = (type || '').toLowerCase();
        return OUTSTATION_PRICING[key] || OUTSTATION_PRICING.sedan;
    }

    function renderVehicleTable() {
        const thead = document.getElementById('vehicleTableHead');
        const tbody = document.getElementById('vehicleTableBody');
        if (!tbody) return;

        if (tripType === 'outstation') {
            if (thead) thead.innerHTML = `<tr>
                        <th>#</th>
                        <th>Vehicle</th>
                        <th>Category</th>
                        <th>Rate / Per KM</th>
                        <th>Minm per Day</th>
                        <th>Extra KM</th>
                        <th>Driver TA</th>
                        <th>Max Passenger</th>
                        <th>Badge</th>
                    </tr>`;

            if (vehicles.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:#999;">No vehicles found.</td></tr>';
                return;
            }
            let html = '';
            vehicles.forEach((v, i) => {
                const op = getOutstationPricing(v.type);
                html += `<tr>
                            <td>${i + 1}</td>
                            <td><strong>${v.name}</strong></td>
                            <td>${v.type}</td>
                            <td>₹${op.ratePerKm}</td>
                            <td>${op.minKmPerDay} KM</td>
                            <td>₹${op.extraKm}</td>
                            <td>₹${op.driverTA}</td>
                            <td>${op.maxPax}</td>
                            <td>${getBadgeHTML(v.badge)}</td>
                        </tr>`;
            });
            tbody.innerHTML = html;
            return;
        }

        if (thead) thead.innerHTML = `<tr>
                        <th>#</th>
                        <th>Vehicle</th>
                        <th>Category</th>
                        <th>Half Day<br>(4Hrs/40Km)</th>
                        <th>8 Hrs<br>(80Km)</th>
                        <th>12 Hrs<br>(Fullday)</th>
                        <th>Extra KM</th>
                        <th>Extra Hrs</th>
                        <th>Night Charges</th>
                        <th>Max Passenger</th>
                        <th>Badge</th>
                    </tr>`;

        if (vehicles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:20px;color:#999;">No vehicles found.</td></tr>';
            return;
        }
        let html = '';
        vehicles.forEach((v, i) => {
            const lp = getLocalPricing(v.type);
            html += `<tr>
                        <td>${i + 1}</td>
                        <td><strong>${v.name}</strong></td>
                        <td>${v.type}</td>
                        <td>${lp.halfDay ? '₹' + lp.halfDay.toLocaleString() : 'NA'}</td>
                        <td>₹${lp.eightHr.toLocaleString()}</td>
                        <td>₹${lp.fullDay.toLocaleString()}</td>
                        <td>₹${lp.extraKm}</td>
                        <td>₹${lp.extraHr}</td>
                        <td>₹${lp.night}</td>
                        <td>${lp.maxPax}</td>
                        <td>${getBadgeHTML(v.badge)}</td>
                    </tr>`;
        });
        tbody.innerHTML = html;
    }

    function renderPackageTable() {
        const tbody = document.getElementById('packageTableBody');
        if (!tbody) return;
        if (packages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#999;">No packages found.</td></tr>';
            return;
        }
        let html = '';
        packages.forEach((p, i) => {
            html += `<tr>
                        <td>${i + 1}</td>
                        <td><strong>${p.name}</strong></td>
                        <td>${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</td>
                        <td>${p.duration}</td>
                        <td><span class="rating-cell">${getStarsSmall(p.rating)} ${p.rating}</span></td>
                        <td>₹${p.pricing.amount.toLocaleString()}</td>
                        <td>${getBadgeHTML(p.badge)}</td>
                    </tr>`;
        });
        tbody.innerHTML = html;
    }

    function getFilteredVehicles() {
        let list = vehicles.slice();
        const q = searchQuery.trim().toLowerCase();
        if (q) list = list.filter(v => v.name.toLowerCase().includes(q) || v.type.toLowerCase().includes(q));
        if (typeFilter !== 'all') list = list.filter(v => v.type.toLowerCase() === typeFilter.toLowerCase());
        if (sortOption === 'price-asc') list.sort((a, b) => a.pricing.perKm - b.pricing.perKm);
        else if (sortOption === 'price-desc') list.sort((a, b) => b.pricing.perKm - a.pricing.perKm);
        else if (sortOption === 'rating') list.sort((a, b) => b.rating - a.rating);
        return list;
    }

    function getFilteredPackages() {
        let list = packages.slice();
        const q = searchQuery.trim().toLowerCase();
        if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        if (catFilter !== 'all') list = list.filter(p => p.category.toLowerCase() === catFilter.toLowerCase());
        if (sortOption === 'price-asc') list.sort((a, b) => a.pricing.amount - b.pricing.amount);
        else if (sortOption === 'price-desc') list.sort((a, b) => b.pricing.amount - a.pricing.amount);
        else if (sortOption === 'rating') list.sort((a, b) => b.rating - a.rating);
        return list;
    }

    function renderVehicleCards() {
        const grid = document.getElementById('vehicleCardsGrid');
        if (!grid) return;
        const list = getFilteredVehicles();
        if (list.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>No vehicles match your filters</h3><p>Try adjusting your search or filters.</p></div>';
            return;
        }
        let html = '';
        list.forEach(v => {
            html += `<div class="card" data-id="${v.id}" onclick="window.selectVehicle('${v.id}')">
                        <div class="card-img">
                            <img src="${v.image}" alt="${v.name}" loading="lazy" onerror="this.src='https://placehold.co/600x400/e8e8e8/999?text=Image+Error'" />
                            ${getBadgeCorner(v.badge)}
                        </div>
                        <div class="card-body">
                            <div class="card-top">
                                <span class="card-type">${v.type}</span>
                                <span class="card-rating">${getStarsSmall(v.rating)} ${v.rating}</span>
                            </div>
                            <h3>${v.name}</h3>
                            <p class="card-desc">${v.description}</p>
                            <div class="card-footer">
                                <span class="card-price">
                                    <span class="num">₹${v.pricing.perKm}</span>
                                    <span class="unit">/ km</span>
                                    <span class="per">· ₹${v.pricing.perDay.toLocaleString()}/day</span>
                                </span>
                                <button class="btn-outline-sm">View Details</button>
                            </div>
                        </div>
                    </div>`;
        });
        grid.innerHTML = html;
    }

    function renderPackageCards() {
        const grid = document.getElementById('packageCardsGrid');
        if (!grid) return;
        const list = getFilteredPackages();
        if (list.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>No packages match your filters</h3><p>Try adjusting your search or filters.</p></div>';
            return;
        }
        let html = '';
        list.forEach(p => {
            html += `<div class="card" data-id="${p.id}" onclick="window.selectPackage('${p.id}')">
                        <div class="card-img">
                            <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/600x400/e8e8e8/999?text=Image+Error'" />
                            ${getBadgeCorner(p.badge)}
                        </div>
                        <div class="card-body">
                            <div class="card-top">
                                <span class="card-type">${p.category}</span>
                                <span class="card-rating">${getStarsSmall(p.rating)} ${p.rating}</span>
                            </div>
                            <h3>${p.name}</h3>
                            <p class="card-desc">${p.description}</p>
                            <div class="card-footer">
                                <span class="card-price">
                                    <span class="num">₹${p.pricing.amount.toLocaleString()}</span>
                                    <span class="unit">/ ${p.pricing.per}</span>
                                </span>
                                <button class="btn-outline-sm">View Details</button>
                            </div>
                        </div>
                    </div>`;
        });
        grid.innerHTML = html;
    }

    function renderVehicleDetail(id, shouldScroll) {
        const v = vehicles.find(x => x.id === id || x._id === id);
        if (!v) return;
        activeVehicleId = id;

        const heroBg = document.getElementById('heroBg');
        if (heroBg) heroBg.style.backgroundImage = `url('${v.image}')`;

        const vDetailImg = document.getElementById('vDetailImg');
        if (vDetailImg) { vDetailImg.src = v.image; vDetailImg.alt = v.name; }

        const vDetailBadge = document.getElementById('vDetailBadge');
        if (vDetailBadge) {
            vDetailBadge.textContent = v.badge || '';
            vDetailBadge.className = 'detail-badge' + (v.badge ? '' : ' empty');
        }

        const c = document.getElementById('vDetailContent');
        if (!c) return;

        let html = `
                    <div class="detail-meta">
                        <span class="detail-type">${v.type}</span>
                        <span class="detail-rating">${getStarsSmall(v.rating)} ${v.rating} <span class="count">(${v.totalTrips} trips)</span></span>
                    </div>
                    <h2>${v.name}</h2>
                    <p class="detail-desc">${v.description}</p>
                    <div class="detail-why"><strong>Why Choose This Vehicle:</strong> ${v.whyChoose}</div>

                    <div class="detail-specs-grid">
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="2.5"/><path d="M2.5 13c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" stroke-linecap="round"/></svg> <strong>${v.specifications.seating}</strong></div>
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5l2 2" stroke-linecap="round"/></svg> <strong>${v.specifications.fuel}</strong></div>
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1L3 3.2v4c0 3.7 2.2 7 5 8 2.8-1 5-4.3 5-8v-4z" stroke-linejoin="round"/></svg> <strong>${v.specifications.ac}</strong></div>
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="12" height="8" rx="1.5"/><path d="M5 4V2.5M11 4V2.5" stroke-linecap="round"/></svg> <strong>${v.specifications.luggage}</strong></div>
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2" stroke-linecap="round"/></svg> <strong>${v.specifications.transmission}</strong></div>
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10V5l2.5-3h7L14 5v5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4.5" cy="10" r="1.5"/><circle cx="11.5" cy="10" r="1.5"/><path d="M6.5 10h3" stroke-linecap="round"/></svg> <strong>${v.specifications.mileage}</strong></div>
                    </div>

                    <div class="detail-amenities">
                        ${v.amenities.map(a => `<span class="amenity">${amenityCheck()} ${a}</span>`).join('')}
                    </div>

                    <div class="detail-highlights">
                        ${v.highlights.map(h => `<span class="hl">${amenityCheck()} ${h}</span>`).join('')}
                    </div>

                    <div class="detail-pricing-block">
                        <div class="p-item"><strong class="highlight">₹${v.pricing.perKm} / km</strong> Per KM</div>
                        <div class="p-item"><strong>₹${v.pricing.perDay.toLocaleString()}</strong> Per Day</div>
                        <div class="p-item"><strong>₹${v.pricing.minimumFare.toLocaleString()}</strong> Minimum Fare</div>
                        <div class="p-item"><strong>₹${v.pricing.advance.toLocaleString()}</strong> Advance (${v.pricing.advancePercentage}%)</div>
                        <div class="p-item"><strong>${v.pricing.driverCharges}</strong> Driver</div>
                        <div class="p-item"><strong>${v.pricing.tollParking}</strong> Toll/Parking</div>
                        <div class="p-item" style="grid-column: span 2;"><strong>${v.pricing.balanceDue}</strong> Balance</div>
                    </div>

                    <div class="detail-why" style="border-left-color: var(--accent-color);"><strong>Ideal For:</strong> ${v.idealFor.join(' · ')}</div>
                    <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:8px;">📌 ${v.cancellationPolicy}</div>

                    <div class="detail-reviews">
                        ${v.reviews.map(r => `<div class="rev"><strong>${r.name}</strong> <span class="rev-stars">${'★'.repeat(r.stars)}</span> "${r.comment}"</div>`).join('')}
                    </div>

                    <div class="detail-cta">
                        <a href="booking.html?vehicle=${v.id}" class="btn-primary">Book This Vehicle <span class="btn-arrow-anim">→</span></a>
                        <a href="vehicles.html" class="btn-outline">View All Vehicles</a>
                    </div>
                `;
        c.innerHTML = html;

        const panel = document.getElementById('vehicleDetailPanel');
        if (panel) panel.classList.add('active');
        if (shouldScroll && panel) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function renderPackageDetail(id, shouldScroll) {
        const p = packages.find(x => x.id === id || x._id === id);
        if (!p) return;
        activePackageId = id;

        const heroBg = document.getElementById('heroBg');
        if (heroBg) heroBg.style.backgroundImage = `url('${p.image}')`;

        const pDetailImg = document.getElementById('pDetailImg');
        if (pDetailImg) { pDetailImg.src = p.image; pDetailImg.alt = p.name; }

        const pDetailBadge = document.getElementById('pDetailBadge');
        if (pDetailBadge) {
            pDetailBadge.textContent = p.badge || '';
            pDetailBadge.className = 'detail-badge' + (p.badge ? '' : ' empty');
        }

        const c = document.getElementById('pDetailContent');
        if (!c) return;

        const itinHtml = Object.keys(p.itinerary).map(key =>
            `<div class="it-day"><strong>${key.toUpperCase()}:</strong> <span>${p.itinerary[key]}</span></div>`
        ).join('');

        let html = `
                    <div class="detail-meta">
                        <span class="detail-type">${p.category}</span>
                        <span class="detail-rating">${getStarsSmall(p.rating)} ${p.rating} <span class="count">(${p.totalReviews} reviews)</span></span>
                    </div>
                    <h2>${p.name}</h2>
                    <p class="detail-desc">${p.description}</p>
                    <div class="detail-why"><strong>Why This Package:</strong> ${p.whyChoose}</div>

                    <div class="detail-specs-grid">
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5l2 2" stroke-linecap="round"/></svg> <strong>${p.duration}</strong></div>
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 10V5l2.5-3h7L14 5v5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4.5" cy="10" r="1.5"/><circle cx="11.5" cy="10" r="1.5"/><path d="M6.5 10h3" stroke-linecap="round"/></svg> <strong>${p.vehicle}</strong></div>
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1L3 3.2v4c0 3.7 2.2 7 5 8 2.8-1 5-4.3 5-8v-4z" stroke-linejoin="round"/></svg> <strong>${p.bestTime}</strong></div>
                        <div class="spec-item"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="2.5"/><path d="M2.5 13c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" stroke-linecap="round"/></svg> <strong>${p.groupSize}</strong></div>
                    </div>

                    <div class="detail-pricing-block">
                        <div class="p-item" style="grid-column: span 2;"><strong class="highlight">₹${p.pricing.amount.toLocaleString()}</strong> per ${p.pricing.per}</div>
                        <div class="p-item" style="grid-column: span 2;"><strong>Includes:</strong> ${p.includes.length > 0 ? p.includes.join(' · ') : 'Contact for details'}</div>
                    </div>

                    ${p.amenities.length > 0 ? `<div class="detail-amenities">${p.amenities.map(a => `<span class="amenity">${amenityCheck()} ${a}</span>`).join('')}</div>` : ''}
                    ${p.highlights.length > 0 ? `<div class="detail-highlights">${p.highlights.map(h => `<span class="hl">${amenityCheck()} ${h}</span>`).join('')}</div>` : ''}

                    ${p.notIncluded.length > 0 ? `<div class="detail-not-included"><strong>What's NOT Included:</strong><ul>${p.notIncluded.map(n => `<li>${n}</li>`).join('')}</ul></div>` : ''}

                    <h4 style="font-family:var(--font-heading);color:var(--accent-color);margin:12px 0 8px;">📅 Itinerary</h4>
                    <div class="detail-itinerary">${itinHtml}</div>

                    <div class="detail-reviews">
                        ${p.reviews.map(r => `<div class="rev"><strong>${r.name}</strong> <span class="rev-stars">${'★'.repeat(r.stars)}</span> "${r.comment}"</div>`).join('')}
                    </div>

                    <div class="detail-cta">
                        <a href="booking.html?package=${p.id}" class="btn-primary">Book This Package <span class="btn-arrow-anim">→</span></a>
                        <a href="packages.html" class="btn-outline">View All Packages</a>
                    </div>
                `;
        c.innerHTML = html;

        const panel = document.getElementById('packageDetailPanel');
        if (panel) panel.classList.add('active');
        if (shouldScroll && panel) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function renderVehicleStrip() {
        const strip = document.getElementById('vehicleStrip');
        if (!strip) return;
        const list = vehicles.slice(0, 6);
        if (list.length === 0) {
            strip.innerHTML = '<p style="padding:20px;color:#999;">No vehicles available.</p>';
            return;
        }
        let html = '';
        list.forEach(v => {
            html += `<div class="strip-card" onclick="window.selectVehicle('${v.id}')">
                        <img src="${v.image}" alt="${v.name}" loading="lazy" onerror="this.src='https://placehold.co/400x250/e8e8e8/999?text=Image'" />
                        <div class="strip-body">
                            <div class="strip-name">${v.name}</div>
                            <div class="strip-meta"><span class="price">₹${v.pricing.perKm}/km</span> · ${v.type}</div>
                        </div>
                    </div>`;
        });
        strip.innerHTML = html;
    }

    function renderPackageStrip() {
        const strip = document.getElementById('packageStrip');
        if (!strip) return;
        const list = packages.slice(0, 6);
        if (list.length === 0) {
            strip.innerHTML = '<p style="padding:20px;color:#999;">No packages available.</p>';
            return;
        }
        let html = '';
        list.forEach(p => {
            html += `<div class="strip-card" onclick="window.selectPackage('${p.id}')">
                        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x250/e8e8e8/999?text=Image'" />
                        <div class="strip-body">
                            <div class="strip-name">${p.name}</div>
                            <div class="strip-meta"><span class="price">₹${p.pricing.amount.toLocaleString()}</span> · ${p.duration}</div>
                        </div>
                    </div>`;
        });
        strip.innerHTML = html;
    }

    function updateVisibility() {
        if (!isDataLoaded) return;

        const isVehicles = activeTab === 'vehicles';
        const vSec = document.getElementById('vehiclesSection');
        const pSec = document.getElementById('packagesSection');
        if (vSec) vSec.style.display = isVehicles ? 'block' : 'none';
        if (pSec) pSec.style.display = isVehicles ? 'none' : 'block';

        const vPanel = document.getElementById('vehicleDetailPanel');
        const pPanel = document.getElementById('packageDetailPanel');
        if (!isVehicles && vPanel) vPanel.classList.remove('active');
        if (isVehicles && pPanel) pPanel.classList.remove('active');

        document.querySelectorAll('#mainTabs button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeTab);
        });

        if (isVehicles) {
            renderVehicleCards();
            if (activeVehicleId) renderVehicleDetail(activeVehicleId, false);
        } else {
            renderPackageCards();
            if (activePackageId) renderPackageDetail(activePackageId, false);
        }
    }

    window.selectVehicle = function (id) {
        activeTab = 'vehicles';
        document.querySelectorAll('#mainTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === 'vehicles'));
        updateVisibility();
        renderVehicleDetail(id, true);
    };

    window.selectPackage = function (id) {
        activeTab = 'packages';
        document.querySelectorAll('#mainTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === 'packages'));
        updateVisibility();
        renderPackageDetail(id, true);
    };

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            searchQuery = this.value;
            if (!isDataLoaded) return;
            if (activeTab === 'vehicles') renderVehicleCards();
            else renderPackageCards();
        });
    }

    function setupCustomSelect(wrapperId, onChange) {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;
        const trigger = wrapper.querySelector('.custom-select-trigger');
        const options = wrapper.querySelector('.custom-select-options');
        if (!trigger || !options) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select.open').forEach(el => {
                if (el !== wrapper) el.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        });

        options.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                options.querySelectorAll('li').forEach(x => x.classList.remove('selected'));
                li.classList.add('selected');
                trigger.querySelector('span').textContent = li.textContent;
                wrapper.classList.remove('open');
                onChange(li.dataset.value);
            });
        });

        document.addEventListener('click', () => wrapper.classList.remove('open'));
    }

    setupCustomSelect('typeFilterCustom', (value) => {
        typeFilter = value;
        if (isDataLoaded && activeTab === 'vehicles') renderVehicleCards();
    });

    setupCustomSelect('catFilterCustom', (value) => {
        catFilter = value;
        if (isDataLoaded && activeTab === 'packages') renderPackageCards();
    });

    setupCustomSelect('sortFilterCustom', (value) => {
        sortOption = value;
        if (!isDataLoaded) return;
        if (activeTab === 'vehicles') renderVehicleCards();
        else renderPackageCards();
    });

    document.querySelectorAll('#mainTabs button').forEach(btn => {
        btn.addEventListener('click', function () {
            activeTab = this.dataset.tab;
            updateVisibility();
        });
    });

    document.querySelectorAll('#tripTypeTabs button').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('#tripTypeTabs button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            tripType = this.dataset.trip;
            renderVehicleTable();
        });
    });

    

    function initRevealObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
        document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));
    }

    const reRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                reRevealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0 });

    const origRenderVehicleCards = renderVehicleCards;
    renderVehicleCards = function () {
        origRenderVehicleCards();
        const grid = document.getElementById('vehicleCardsGrid');
        if (grid) { grid.classList.add('reveal-stagger'); reRevealObserver.observe(grid); }
    };
    const origRenderPackageCards = renderPackageCards;
    renderPackageCards = function () {
        origRenderPackageCards();
        const grid = document.getElementById('packageCardsGrid');
        if (grid) { grid.classList.add('reveal-stagger'); reRevealObserver.observe(grid); }
    };

    const imgLightbox = document.getElementById('imgLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    function openLightbox(imgId) {
        const sourceImg = document.getElementById(imgId);
        if (!sourceImg || !sourceImg.src || !imgLightbox || !lightboxImg) return;
        lightboxImg.src = sourceImg.src;
        lightboxImg.alt = sourceImg.alt || '';
        imgLightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!imgLightbox) return;
        imgLightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.view-full-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(btn.dataset.target);
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (imgLightbox) {
        imgLightbox.addEventListener('click', (e) => {
            if (e.target === imgLightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    const navbar = document.getElementById('navbar');
    const onNavScroll = () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const open = hamburger.classList.toggle('open');
            navLinks.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', open);
        });
        navLinks.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', false);
            })
        );
        document.addEventListener('click', e => {
            if (navbar && !navbar.contains(e.target)) {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', false);
            }
        });
    }

    async function loadInitialData() {
        showLoadingState();

        try {
            const [vData, pData] = await Promise.all([
                fetchVehicles(),
                fetchPackages()
            ]);

            vehicles = vData;
            packages = pData;
            isDataLoaded = true;

            console.log(`✓ Loaded ${vehicles.length} vehicles, ${packages.length} packages from API`);

            // Set defaults to first items
            if (vehicles.length > 0) activeVehicleId = vehicles[0].id;
            if (packages.length > 0) activePackageId = packages[0].id;

            // Set hero background
            const defaultV = vehicles[0];
            if (defaultV) {
                const heroBg = document.getElementById('heroBg');
                if (heroBg) heroBg.style.backgroundImage = `url('${defaultV.image}')`;
            }


            renderVehicleTable();
            renderPackageTable();
            renderVehicleStrip();
            renderPackageStrip();

            activeTab = 'vehicles';
            updateVisibility();
            if (activeVehicleId) renderVehicleDetail(activeVehicleId, false);

            document.querySelectorAll('#mainTabs button').forEach(b =>
                b.classList.toggle('active', b.dataset.tab === 'vehicles')
            );

            initRevealObserver();

        } catch (error) {
            console.error(' Failed to load data:', error);
            showErrorState(error.message || 'Could not connect to server. Make sure the backend is running on port 5000.');
        }
    }


    window.retryLoadData = function () {
        loadInitialData();
    };


    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    window.addEventListener('load', () => window.scrollTo(0, 0));


    loadInitialData();

})();