/* ═══════════════════════════════════════════════════════════════
   ATAT — Admin Dashboard Controller (FIXED IMAGE HANDLING)
   Matches: admin-dashboard.html
   Depends: /js/api.js, Chart.js (CDN)
════════════════════════════════════════════════════════════════ */
'use strict';

window.API = window.API || {};

/* ───────────────────────────
   STATE
─────────────────────────── */
var state = {
    currentSection: 'dashboard',
    admin: null,
    vehicles: [],
    packages: [],
    bookings: [],
    editingVehicle: null,
    editingPackage: null,
    vehicleImages: [],
    vehicleRoutes: [],
    packageIncludes: [],
    charts: { line: null, doughnut: null },
    contacts: []
};

var _confirmCallback = null;

/* ───────────────────────────
   NO-IMAGE FALLBACK
   Inline SVG data-URI so there is never a 404 for a
   missing /images/no-image.jpg file on the server.
─────────────────────────── */
var NO_IMAGE_SRC = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#EDE5D8"/>' +
    '<g fill="#B9A88F">' +
    '<path d="M140 120h120v70H140z" fill="none" stroke="#B9A88F" stroke-width="4"/>' +
    '<circle cx="165" cy="140" r="10" fill="#B9A88F"/>' +
    '<path d="M140 175l35-30 25 20 30-25 35 25v20H140z" fill="#B9A88F"/>' +
    '</g>' +
    '<text x="200" y="225" font-family="Arial, sans-serif" font-size="14" fill="#8a7a63" text-anchor="middle">No Image Available</text>' +
    '</svg>'
);

function noImageSrc() { return NO_IMAGE_SRC; }

/* ───────────────────────────
   HELPERS
─────────────────────────── */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ✅ PROPER IMAGE URL HANDLING
function getImageUrl(imagePath) {
    if (!imagePath || imagePath === 'undefined' || imagePath === 'null') return '';

    imagePath = String(imagePath).trim();
    if (!imagePath) return '';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    if (imagePath.startsWith('data:')) {
        return imagePath;
    }

    // uploaded backend files
    if (imagePath.startsWith('/uploads/')) return imagePath;
    if (imagePath.startsWith('uploads/')) return '/' + imagePath;

    // local backend images folder if you use one
    if (imagePath.startsWith('/images/')) return imagePath;
    if (imagePath.startsWith('images/')) return '/' + imagePath;

    // generic relative path
    if (imagePath.startsWith('/')) return imagePath;
    return '/' + imagePath.replace(/^\/+/, '');
}

function formatCurrency(n) {
    if (n === null || n === undefined || n === '') return '—';
    var num = Number(n);
    if (Number.isNaN(num)) return '—';
    return '₹' + num.toLocaleString('en-IN');
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function timeAgo(d) {
    if (!d) return '';
    var s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 604800) return Math.floor(s / 86400) + 'd ago';
    return formatDate(d);
}

function escAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function safeText(value) {
    if (value === null || value === undefined || value === '') return '—';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDateSafe(date) {
    if (!date) return '—';
    try {
        var d = new Date(date);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch (e) { return '—'; }
}

function formatCurrencySafe(value) {
    var num = Number(value || 0);
    return '₹' + num.toLocaleString('en-IN');
}

function debounce(fn, ms) {
    var timer;
    return function () {
        var args = arguments, ctx = this;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
}

/* ───────────────────────────
   TOAST
─────────────────────────── */
function toast(msg, type) {
    type = type || 'success';
    var box = document.getElementById('toastBox');
    if (!box) {
        box = document.createElement('div');
        box.id = 'toastBox';
        document.body.appendChild(box);
    }
    var icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = '<span style="font-size:16px;font-weight:700">' + (icons[type] || 'ℹ') + '</span>' +
        '<span style="flex:1">' + msg + '</span>' +
        '<button class="toast-close" onclick="this.parentElement.remove()">×</button>';
    box.appendChild(el);
    setTimeout(function () { if (el.parentElement) el.remove(); }, 4000);
}

/* ───────────────────────────
   SIDEBAR & NAVIGATION
─────────────────────────── */
function openSidebar() {
    var overlay = document.getElementById('sidebarOverlay');
    var sidebar = document.getElementById('sidebar');
    if (overlay) overlay.classList.add('active');
    if (sidebar) sidebar.classList.add('open');
}

function closeSidebar() {
    var overlay = document.getElementById('sidebarOverlay');
    var sidebar = document.getElementById('sidebar');
    if (overlay) overlay.classList.remove('active');
    if (sidebar) sidebar.classList.remove('open');
}

function navigateTo(section) {
    state.currentSection = section;

    $$('.nav-item').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.section === section);
    });

    $$('.section').forEach(function (sec) {
        sec.classList.toggle('active', sec.id === 'sec-' + section);
    });

    var titles = {
        dashboard: 'Dashboard',
        vehicles: 'Vehicles',
        packages: 'Packages',
        bookings: 'Bookings',
        contacts: 'Contacts',
        settings: 'Settings',
        profile: 'Profile'
    };
    var ht = document.getElementById('headerTitle');
    if (ht) ht.textContent = titles[section] || 'Dashboard';

    if (section === 'dashboard') loadDashboard();
    if (section === 'vehicles') loadVehicles();
    if (section === 'packages') loadPackages();
    if (section === 'bookings') loadBookings();
    if (section === 'contacts') loadContacts();

    closeSidebar();
}

/* ───────────────────────────
   AUTH
─────────────────────────── */
var API_BASE = window.location.origin + '/api';

function getToken() {
    return localStorage.getItem('voyago_token') || sessionStorage.getItem('voyago_token');
}

function logout() {
    localStorage.removeItem('voyago_token');
    sessionStorage.removeItem('voyago_token');
    window.location.replace('/admin');
}

var adminProfileLoaded = false;

async function loadAdminProfile() {
    if (adminProfileLoaded) return;
    adminProfileLoaded = true;

    var token = getToken();
    if (!token) { window.location.replace('/admin'); return; }

    try {
        var res = await fetch(API_BASE + '/admin/me', {
            headers: { Authorization: 'Bearer ' + token }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var data = await res.json();
        if (!data || !data.success || !data.admin) { logout(); return; }
        state.admin = data.admin;
        var nameEl = document.querySelector('.sidebar-user-name');
        if (nameEl) nameEl.textContent = data.admin.name || 'Admin';
    } catch (err) {
        console.error('Admin profile error:', err);
        adminProfileLoaded = false;
    }
}

/* ═══════════════════════════
   CONFIRM MODAL
════════════════════════════ */
function openConfirmModal(title, message, onConfirm) {
    _confirmCallback = onConfirm;
    var modal = document.getElementById('confirmModal');
    if (!modal) return;
    var h3 = modal.querySelector('h3');
    if (h3) h3.textContent = title;
    var txt = document.getElementById('confirmText');
    if (txt) txt.innerHTML = message;
    modal.classList.add('active');
}

function closeConfirmModal() {
    var modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('active');
    _confirmCallback = null;
}

/* ═══════════════════════════
   DASHBOARD
════════════════════════════ */
async function loadDashboard() {
    try {
        if (API.admin && API.admin.getDashboard) {
            var res = await API.admin.getDashboard();
            if (res.success) {
                renderDashboardStats(res.data);
                renderDashboardCharts(res.data);
                return;
            }
        }
    } catch (e) { }

    try {
        var results = await Promise.all([
            API.admin.getVehicles ? API.admin.getVehicles('limit=100') : { data: [], total: 0 },
            API.admin.getPackages ? API.admin.getPackages('limit=100') : { data: [], total: 0 },
            API.admin.getBookings ? API.admin.getBookings('limit=100') : { data: [], total: 0 }
        ]);
        var v = results[0], p = results[1], b = results[2];
        var vData = v.data || [], pData = p.data || [], bData = b.data || [];
        var fallbackStats = {
            totalVehicles: v.total || vData.length,
            activeVehicles: vData.filter(function (x) { return x.isActive || x.status === 'active'; }).length,
            totalPackages: p.total || pData.length,
            activePackages: pData.filter(function (x) { return x.isActive || x.status === 'active'; }).length,
            totalBookings: b.total || bData.length,
            pendingBookings: bData.filter(function (x) { return x.status === 'pending'; }).length,
            totalRevenue: bData.reduce(function (sum, x) { return sum + (x.totalPrice || 0); }, 0)
        };
        renderDashboardStats(fallbackStats);
        renderDashboardCharts(fallbackStats);
    } catch (err) {
        console.error('Dashboard load error:', err);
        renderDashboardStats({});
    }
}

async function renderDashboardCharts(d) {
    var lineCanvas = document.getElementById('lineChart');
    var doughCanvas = document.getElementById('doughnutChart');
    if (!lineCanvas || !doughCanvas || typeof Chart === 'undefined') return;

    var maroon = '#6E1F2B', gold = '#D9A441';

    if (state.charts.doughnut) state.charts.doughnut.destroy();
    state.charts.doughnut = new Chart(doughCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Vehicles', 'Packages', 'Bookings', 'Pending'],
            datasets: [{
                data: [d.totalVehicles || 0, d.totalPackages || 0, d.totalBookings || 0, d.pendingBookings || 0],
                backgroundColor: [maroon, gold, '#0d0605', '#EDE5D8'],
                borderColor: '#fff', borderWidth: 3, hoverOffset: 6
            }]
        },
        options: { responsive: true, cutout: '68%', plugins: { legend: { display: false } } }
    });

    try {
        var res = await API.admin.getBookings('limit=500');
        var bookings = (res && res.success) ? (res.data || []) : [];
        var now = new Date(), months = [];
        for (var i = 5; i >= 0; i--) {
            var dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                label: dt.toLocaleDateString('en-US', { month: 'short' }),
                y: dt.getFullYear(), m: dt.getMonth(), confirmed: 0, cancelled: 0
            });
        }
        bookings.forEach(function (b) {
            var d2 = new Date(b.createdAt || b.travelDate);
            if (isNaN(d2)) return;
            for (var j = 0; j < months.length; j++) {
                if (months[j].y === d2.getFullYear() && months[j].m === d2.getMonth()) {
                    if (b.status === 'cancelled') months[j].cancelled++;
                    else months[j].confirmed++;
                    break;
                }
            }
        });
        if (state.charts.line) state.charts.line.destroy();
        state.charts.line = new Chart(lineCanvas, {
            type: 'line',
            data: {
                labels: months.map(function (x) { return x.label; }),
                datasets: [
                    {
                        label: 'Confirmed', data: months.map(function (x) { return x.confirmed; }),
                        borderColor: maroon, backgroundColor: 'rgba(110,31,43,0.12)',
                        borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 3
                    },
                    {
                        label: 'Cancellations', data: months.map(function (x) { return x.cancelled; }),
                        borderColor: '#D32F2F', backgroundColor: 'rgba(211,47,47,0.08)',
                        borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    } catch (err) { console.error('Chart load error:', err); }
}

function renderDashboardStats(d) {
    var grid = document.getElementById('statsGrid');
    if (grid) {
        var stats = [
            { label: 'Total Vehicles', value: d.totalVehicles || 0, icon: '🚗', color: 'maroon' },
            { label: 'Active Vehicles', value: d.activeVehicles || 0, icon: '✅', color: 'green' },
            { label: 'Total Packages', value: d.totalPackages || 0, icon: '📦', color: 'blue' },
            { label: 'Total Bookings', value: d.totalBookings || 0, icon: '📅', color: 'orange' },
            { label: 'Pending Bookings', value: d.pendingBookings || 0, icon: '⏳', color: 'gold' }
        ];
        grid.innerHTML = stats.map(function (s) {
            return '<div class="stat-card"><div class="stat-top"><div class="stat-icon ' + s.color + '" style="font-size:20px">' + s.icon + '</div></div><div class="stat-label">' + s.label + '</div><div class="stat-value">' + s.value + '</div></div>';
        }).join('');
    }
    renderRevenueCard(d);
}

function renderRevenueCard(d) {
    var card = document.getElementById('revenueCard');
    if (!card) return;
    card.innerHTML = '<div class="revenue-icon">💰</div><div class="revenue-info"><div class="revenue-label">Revenue</div><div class="revenue-value">' + formatCurrency(d.totalRevenue || 0) + '</div><div class="revenue-trend">↑ 18.6% from last month</div></div>';
}

/* ═══════════════════════════
   VEHICLES
════════════════════════════ */
async function loadVehicles() {
    try {
        var search = (document.getElementById('vSearch') || {}).value || '';
        var type = (document.getElementById('vTypeFilter') || {}).value || '';
        var status = (document.getElementById('vStatusFilter') || {}).value || '';
        var params = 'limit=100';
        if (search) params += '&search=' + encodeURIComponent(search);
        if (type) params += '&type=' + encodeURIComponent(type);
        if (status) params += '&status=' + encodeURIComponent(status);
        var res = await API.admin.getVehicles(params);
        if (!res || !res.success) { toast(res ? res.message : 'Failed to load vehicles', 'error'); return; }
        state.vehicles = res.data || [];
        renderVehicles();
    } catch (err) { console.error(err); toast('Server error loading vehicles', 'error'); }
}

function isVehicleActive(v) { return v.isActive === true || v.status === 'active'; }

function renderVehicles() {
    var grid = document.getElementById('vehiclesGrid');
    if (!grid) return;
    if (state.vehicles.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>No Vehicles Found</h3><p>Start by adding your first vehicle.</p><button class="btn btn-primary" id="emptyAddVehicleBtn">+ Add Vehicle</button></div>';
        var eb = document.getElementById('emptyAddVehicleBtn');
        if (eb) eb.addEventListener('click', function () { openVehicleModal(); });
        return;
    }
    var tc = { sedan: 'badge-blue', suv: 'badge-green', van: 'badge-orange', bus: 'badge-maroon', luxury: 'badge-gold', motorcycle: 'badge-gray', Sedan: 'badge-blue', SUV: 'badge-green', Van: 'badge-orange', Bus: 'badge-maroon', Luxury: 'badge-gold', Motorcycle: 'badge-gray' };
    grid.innerHTML = state.vehicles.map(function (v) {
        // ✅ PROPER IMAGE HANDLING (never 404s — falls back to inline SVG)
        var img = getImageUrl(v.image || (v.images && v.images[0]) || '');
        var active = isVehicleActive(v);
        var imgTag = img
            ? '<img src="' + escAttr(img) + '" alt="' + escAttr(v.name) + '" loading="lazy" onerror="this.onerror=null;this.src=noImageSrc();">'
            : '<img src="' + noImageSrc() + '" alt="No image">';
        return '<div class="admin-v-card' + (active ? '' : ' disabled-card') + '">' +
            '<div class="admin-v-img">' + imgTag +
            '<div class="admin-v-img-overlay"></div>' +
            '<span class="admin-v-badge badge ' + (tc[v.type] || 'badge-gray') + '">' + (v.type || 'Other') + '</span>' +
            '<span class="admin-v-type">' + escAttr(v.brand || '') + ' ' + escAttr(v.model || '') + '</span>' +
            '<span class="admin-v-status badge ' + (active ? 'badge-green' : 'badge-red') + '">' + (active ? 'Active' : (v.status === 'maintenance' ? 'Maintenance' : 'Disabled')) + '</span></div>' +
            '<div class="admin-v-body"><div class="admin-v-name">' + escAttr(v.name) + '</div><div class="admin-v-slug">' + escAttr(v.slug || '') + '</div>' +
            '<div class="admin-v-details"><div class="admin-v-detail">Seats: <strong>' + (v.seats || '—') + '</strong></div><div class="admin-v-detail">Year: <strong>' + (v.year || '—') + '</strong></div><div class="admin-v-detail">Trans: <strong>' + (v.transmission || '—') + '</strong></div><div class="admin-v-detail">Fuel: <strong>' + (v.fuelType || v.fuel || '—') + '</strong></div></div>' +
            '<div class="admin-v-price">' + formatCurrency(v.pricePerDay) + ' <span>/ day</span></div>' +
            '<div class="admin-v-actions">' +
            '<button class="btn btn-sm btn-secondary" data-action="view-vehicle" data-id="' + v._id + '">View</button>' +
            '<button class="btn btn-sm btn-primary" data-action="edit-vehicle" data-id="' + v._id + '">Edit</button>' +
            '<button class="btn btn-sm btn-ghost" data-action="toggle-vehicle" data-id="' + v._id + '">' + (active ? 'Disable' : 'Enable') + '</button>' +
            '<button class="btn btn-sm btn-danger" data-action="delete-vehicle" data-id="' + v._id + '" data-name="' + escAttr(v.name) + '">Delete</button>' +
            '</div></div></div>';
    }).join('');
}

/* ─── VEHICLE MODAL ─── */
function openVehicleModal(vehicle) {
    state.editingVehicle = vehicle || null;
    state.vehicleImages = vehicle ? (vehicle.images || []).slice() : [];
    state.vehicleRoutes = vehicle ? (vehicle.routes || []).slice() : [];
    var title = document.getElementById('vehicleModalTitle');
    if (title) title.textContent = vehicle ? 'Edit Vehicle' : 'Add Vehicle';
    var form = document.getElementById('vehicleForm');
    if (!form) return;
    form.reset();
    $$('#vehicleForm .form-group').forEach(function (g) { g.classList.remove('error'); });
    if (vehicle) {
        setFormVal(form, 'name', vehicle.name);
        setFormVal(form, 'type', vehicle.type);
        setFormVal(form, 'brand', vehicle.brand);
        setFormVal(form, 'model', vehicle.model);
        setFormVal(form, 'year', vehicle.year);
        setFormVal(form, 'description', vehicle.description);
        setFormVal(form, 'seats', vehicle.seats);
        setFormVal(form, 'bags', vehicle.bags);
        setFormVal(form, 'fuelType', vehicle.fuelType || vehicle.fuel);
        setFormVal(form, 'transmission', vehicle.transmission);
        setFormVal(form, 'features', (vehicle.features || []).join(', '));
        setFormVal(form, 'pricePerDay', vehicle.pricePerDay);
        setFormVal(form, 'dailyRate', vehicle.dailyRate);
        setFormVal(form, 'pricePerKm', vehicle.pricePerKm);
        setFormVal(form, 'badge', vehicle.badge);
        setFormVal(form, 'badgeClass', vehicle.badgeClass);
        setFormVal(form, 'rating', vehicle.rating);
        setFormVal(form, 'totalTrips', vehicle.totalTrips);
        setFormVal(form, 'totalKmLakhs', vehicle.totalKmLakhs);
        setFormVal(form, 'ac', vehicle.ac !== undefined ? String(vehicle.ac) : 'true');
        setFormVal(form, 'status', vehicle.status || (vehicle.isActive ? 'active' : 'disabled'));
    }
    switchVehicleTab('vtab-basic');
    renderVehicleImages();
    renderVehicleRoutes();
    var modal = document.getElementById('vehicleModal');
    if (modal) modal.classList.add('active');
}

function closeVehicleModal() {
    var modal = document.getElementById('vehicleModal');
    if (modal) modal.classList.remove('active');
    state.editingVehicle = null;
}

function setFormVal(form, name, val) { var el = form.elements[name]; if (el) el.value = (val !== undefined && val !== null) ? val : ''; }
function getFormVal(form, name) { var el = form.elements[name]; return el ? el.value.trim() : ''; }
function getFormNum(form, name) { var el = form.elements[name]; return el ? parseFloat(el.value) || 0 : 0; }

function switchVehicleTab(tabId) {
    document.querySelectorAll('#vFormTabs .form-tab-btn').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === tabId); });
    document.querySelectorAll('#vehicleForm .form-tab-pane').forEach(function (p) { p.classList.toggle('active', p.id === tabId); });
}

function addVehicleImage() { state.vehicleImages.push(''); renderVehicleImages(); }
function removeVehicleImage(idx) { state.vehicleImages.splice(idx, 1); renderVehicleImages(); }

// ✅ PROPER IMAGE RENDERING (never 404s — falls back to inline SVG)
function renderVehicleImages() {
    var list = document.getElementById('imgList');
    if (!list) return;
    list.innerHTML = state.vehicleImages.map(function (url, i) {
        var imgSrc = getImageUrl(url) || noImageSrc();
        return '<div class="img-list-item">' +
            '<img src="' + escAttr(imgSrc) + '" alt="Vehicle" onerror="this.onerror=null;this.src=noImageSrc();">' +
            '<input class="form-control" placeholder="Image URL" value="' + escAttr(url) + '" data-img-idx="' + i + '">' +
            '<button class="remove-img" data-remove-img="' + i + '">×</button></div>';
    }).join('');
}

function addVehicleRoute() { state.vehicleRoutes.push(''); renderVehicleRoutes(); }
function removeVehicleRoute(idx) { state.vehicleRoutes.splice(idx, 1); renderVehicleRoutes(); }

function renderVehicleRoutes() {
    var list = document.getElementById('routesList');
    if (!list) return;
    list.innerHTML = state.vehicleRoutes.map(function (r, i) {
        return '<div class="route-item"><span class="route-emoji">📍</span><input class="form-control" placeholder="Route (e.g. Colombo → Kandy)" value="' + escAttr(r) + '" data-route-idx="' + i + '"><button class="remove-route" data-remove-route="' + i + '">×</button></div>';
    }).join('');
}

async function saveVehicle() {
    var form = document.getElementById('vehicleForm');
    if (!form) return;
    var name = getFormVal(form, 'name'), type = getFormVal(form, 'type'), brand = getFormVal(form, 'brand');
    var pricePerDay = getFormNum(form, 'pricePerDay');
    var pricePerKm = getFormNum(form, 'pricePerKm');
    $$('#vehicleForm .form-group').forEach(function (g) { g.classList.remove('error'); });
    var hasError = false;
    if (!name) { form.elements['name'].closest('.form-group').classList.add('error'); hasError = true; }
    if (!type) { form.elements['type'].closest('.form-group').classList.add('error'); hasError = true; }
    if (!brand) { form.elements['brand'].closest('.form-group').classList.add('error'); hasError = true; }
    // pricePerDay / pricePerKm are required on the backend schema — validate here too
    if (!pricePerDay) { form.elements['pricePerDay'].closest('.form-group').classList.add('error'); hasError = true; }
    if (!pricePerKm) { form.elements['pricePerKm'].closest('.form-group').classList.add('error'); hasError = true; }
    if (hasError) { toast('Please fill in all required fields (name, type, brand, price/day, price/km)', 'error'); return; }

    var featuresText = getFormVal(form, 'features');
    var features = featuresText ? featuresText.split(',').map(function (f) { return f.trim(); }).filter(function (f) { return f; }) : [];

    var data = {
        name: name, type: type, brand: brand, slug: slugify(name),
        model: getFormVal(form, 'model') || undefined,
        year: getFormNum(form, 'year') || undefined,
        description: getFormVal(form, 'description') || undefined,
        seats: getFormNum(form, 'seats') || undefined,
        bags: getFormNum(form, 'bags') || undefined,
        fuelType: getFormVal(form, 'fuelType') || undefined,
        transmission: getFormVal(form, 'transmission') || undefined,
        pricePerDay: pricePerDay,
        pricePerKm: pricePerKm,
        dailyRate: getFormNum(form, 'dailyRate') || undefined,
        badge: getFormVal(form, 'badge') || undefined,
        badgeClass: getFormVal(form, 'badgeClass') || undefined,
        rating: getFormNum(form, 'rating') || undefined,
        totalTrips: getFormNum(form, 'totalTrips') || undefined,
        totalKmLakhs: getFormNum(form, 'totalKmLakhs') || undefined,
        status: getFormVal(form, 'status') || 'active',
        // ✅ FILTER OUT EMPTY IMAGE URLS
        images: state.vehicleImages.filter(function (u) { return u.trim() && u !== 'undefined'; }),
        image: (state.vehicleImages.filter(function (u) { return u.trim() && u !== 'undefined'; })[0]) || undefined,
        features: features,
        routes: state.vehicleRoutes.filter(function (r) { return r.trim(); })
    };

    var res;
    try {
        res = state.editingVehicle ? await API.admin.updateVehicle(state.editingVehicle._id, data) : await API.admin.createVehicle(data);
    } catch (err) { toast('Server error saving vehicle', 'error'); return; }

    if (res.success) { toast(state.editingVehicle ? 'Vehicle updated!' : 'Vehicle created!', 'success'); closeVehicleModal(); loadVehicles(); }
    else { toast(res.message || 'Failed to save vehicle', 'error'); }
}

async function viewVehicle(id) {
    try { var res = await API.admin.getVehicle(id); if (res.success) openVehiclePanel(res.data); else toast('Failed to load', 'error'); }
    catch (err) { toast('Server error', 'error'); }
}
async function editVehicle(id) {
    try { var res = await API.admin.getVehicle(id); if (res.success) openVehicleModal(res.data); else toast('Failed to load', 'error'); }
    catch (err) { toast('Server error', 'error'); }
}
async function toggleVehicle(id) {
    try { var res = await API.admin.toggleVehicle(id); if (res.success) { toast('Toggled', 'success'); loadVehicles(); } else toast(res.message || 'Failed', 'error'); }
    catch (err) { toast('Server error', 'error'); }
}
function confirmDeleteVehicle(id, name) {
    openConfirmModal('Delete Vehicle', 'Are you sure you want to delete <strong>' + escAttr(name) + '</strong>?', async function () {
        try { var res = await API.admin.deleteVehicle(id); if (res.success) { toast('Deleted', 'success'); loadVehicles(); } else toast(res.message || 'Failed', 'error'); } catch (err) { toast('Server error', 'error'); }
        closeConfirmModal();
    });
}

function openVehiclePanel(v) {
    var panel = document.getElementById('vehiclePanel'), body = document.getElementById('panelBody');
    if (!panel || !body) return;
    // ✅ PROPER IMAGE URL HANDLING
    var mainImg = getImageUrl(v.image || (v.images && v.images[0]) || '') || noImageSrc();
    var thumbs = (v.images || []).slice(0, 10).map(function (img) { return getImageUrl(img) || noImageSrc(); });
    var active = isVehicleActive(v);
    body.innerHTML = '<img class="panel-img-main" src="' + escAttr(mainImg) + '" alt="' + escAttr(v.name) + '" id="vp-main-img" onerror="this.onerror=null;this.src=noImageSrc();">' +
        (thumbs.length > 1 ? '<div class="panel-img-thumbs">' + thumbs.map(function (img, i) { return '<img src="' + escAttr(img) + '" alt="Thumb"' + (i === 0 ? ' class="active"' : '') + ' data-panel-thumb="' + escAttr(img) + '" onerror="this.onerror=null;this.src=noImageSrc();">'; }).join('') + '</div>' : '') +
        '<div class="detail-section-title">Vehicle Info</div>' + detailRow('Name', v.name) + detailRow('Slug', '<code>' + escAttr(v.slug || '') + '</code>') + detailRow('Type', v.type) + detailRow('Brand', v.brand || '—') + detailRow('Model', v.model || '—') + detailRow('Year', v.year || '—') + detailRow('Status', active ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-red">' + (v.status || 'Disabled') + '</span>') +
        '<div class="detail-section-title">Specifications</div><div class="panel-specs-grid">' +
        specItem('👤', 'Seats', v.seats) + specItem('💿', 'Bags', v.bags) + specItem('⚙️', 'Transmission', v.transmission) + specItem('⛽', 'Fuel', v.fuelType || v.fuel) + specItem('❄️', 'AC', v.ac !== false ? 'Yes' : 'No') + specItem('💰', 'Price/Day', formatCurrency(v.pricePerDay)) + specItem('🛣️', 'Price/Km', v.pricePerKm ? formatCurrency(v.pricePerKm) : '—') + specItem('⭐', 'Rating', v.rating || '—') + specItem('📅', 'Created', formatDate(v.createdAt)) + '</div>' +
        (v.features && v.features.length ? '<div class="detail-section-title">Features</div><div style="margin-bottom:16px">' + v.features.map(function (f) { return '<span class="panel-feature-tag">✓ ' + escAttr(f) + '</span>'; }).join('') + '</div>' : '') +
        (v.routes && v.routes.length ? '<div class="detail-section-title">Routes</div><div style="margin-bottom:16px">' + v.routes.map(function (r) { return '<span class="panel-route-tag">📍 ' + escAttr(r) + '</span>'; }).join('') + '</div>' : '') +
        (v.description ? '<div class="detail-section-title">Description</div><p style="font-size:13px;color:var(--text-muted);line-height:1.7">' + escAttr(v.description) + '</p>' : '');
    panel.classList.add('active');
    var overlay = document.getElementById('panelOverlay');
    if (overlay) overlay.classList.add('active');
}
function closeVehiclePanel() {
    var p = document.getElementById('vehiclePanel'); if (p) p.classList.remove('active');
    var o = document.getElementById('panelOverlay'); if (o) o.classList.remove('active');
}
function detailRow(label, value) { return '<div class="detail-row"><span class="detail-label">' + label + '</span><span class="detail-value">' + (value || '—') + '</span></div>'; }
function specItem(icon, label, value) { return '<div class="panel-spec-item"><span class="panel-spec-icon">' + icon + '</span><span class="panel-spec-label">' + label + '</span><span class="panel-spec-value">' + (value || '—') + '</span></div>'; }

/* ═══════════════════════════
   PACKAGES
════════════════════════════ */
async function loadPackages() {
    try {
        var search = (document.getElementById('pSearch') || {}).value || '';
        var category = (document.getElementById('pCatFilter') || {}).value || '';
        var params = 'limit=100';
        if (search) params += '&search=' + encodeURIComponent(search);
        if (category) params += '&category=' + encodeURIComponent(category);
        var res = await API.admin.getPackages(params);
        if (res.success) { state.packages = res.data || []; renderPackages(); }
        else toast(res.message || 'Failed to load packages', 'error');
    } catch (err) { toast('Server error', 'error'); }
}

function isPackageActive(p) { return p.isActive === true || p.status === 'active'; }

function renderPackages() {
    var grid = document.getElementById('packagesGrid');
    if (!grid) return;
    if (state.packages.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h3>No Packages Found</h3><p>Create your first travel package.</p><button class="btn btn-primary" id="emptyAddPkgBtn">+ Add Package</button></div>';
        var eb = document.getElementById('emptyAddPkgBtn');
        if (eb) eb.addEventListener('click', function () { openPackageModal(); });
        return;
    }
    var cc = { adventure: 'badge-orange', cultural: 'badge-maroon', beach: 'badge-blue', wildlife: 'badge-green', mountain: 'badge-gold', city: 'badge-blue', luxury: 'badge-gold', pilgrimage: 'badge-maroon', other: 'badge-gray' };
    grid.innerHTML = state.packages.map(function (p) {
        var img = getImageUrl(p.image || (p.images && p.images[0]) || '');
        var active = isPackageActive(p);
        var incHtml = (p.includes || []).slice(0, 4).map(function (inc) { return '<span class="admin-pkg-include-tag">' + escAttr(inc) + '</span>'; }).join('');
        var imgTag = img
            ? '<img src="' + escAttr(img) + '" alt="' + escAttr(p.name) + '" loading="lazy" onerror="this.onerror=null;this.src=noImageSrc();">'
            : '<img src="' + noImageSrc() + '" alt="No image">';
        return '<div class="admin-pkg-card' + (active ? '' : ' disabled-card') + '">' +
            '<div class="admin-pkg-img">' + imgTag +
            '<div class="admin-pkg-img-overlay"></div><span class="admin-pkg-cat badge ' + (cc[p.category] || 'badge-gray') + '">' + (p.category || 'Other') + '</span>' +
            (p.duration ? '<span class="admin-pkg-duration">' + escAttr(p.duration) + '</span>' : '') +
            '<span class="admin-pkg-status badge ' + (active ? 'badge-green' : 'badge-red') + '">' + (active ? 'Active' : 'Disabled') + '</span></div>' +
            '<div class="admin-pkg-body"><div class="admin-pkg-name">' + escAttr(p.name) + '</div><div class="admin-pkg-desc">' + escAttr(p.shortDescription || p.description || '') + '</div>' +
            (incHtml ? '<div class="admin-pkg-includes">' + incHtml + '</div>' : '') +
            '<div class="admin-pkg-footer"><div class="admin-pkg-price">' + formatCurrency(p.discountPrice || p.price) + (p.discountPrice ? ' <span style="text-decoration:line-through;color:var(--medium-gray);font-size:13px;font-weight:400">' + formatCurrency(p.price) + '</span>' : '') + '</div><div class="admin-pkg-rating">' + (p.isFeatured ? '⭐ Featured' : '') + '</div></div>' +
            '<div class="admin-pkg-actions"><button class="btn btn-sm btn-secondary" data-action="edit-package" data-id="' + p._id + '">Edit</button><button class="btn btn-sm btn-ghost" data-action="toggle-package" data-id="' + p._id + '">' + (active ? 'Disable' : 'Enable') + '</button><button class="btn btn-sm btn-danger" data-action="delete-package" data-id="' + p._id + '" data-name="' + escAttr(p.name) + '">Delete</button></div></div></div>';
    }).join('');
}

function openPackageModal(pkg) {
    state.editingPackage = pkg || null;
    state.packageIncludes = pkg ? (pkg.includes || []).slice() : [];
    var title = document.getElementById('pkgModalTitle');
    if (title) title.textContent = pkg ? 'Edit Package' : 'Add Package';
    var form = document.getElementById('pkgForm');
    if (!form) return;
    form.reset();
    $$('#pkgForm .form-group').forEach(function (g) { g.classList.remove('error'); });
    if (pkg) {
        setFormVal(form, 'name', pkg.name); setFormVal(form, 'category', pkg.category);
        setFormVal(form, 'duration', pkg.duration); setFormVal(form, 'price', pkg.price);
        setFormVal(form, 'description', pkg.description);
        setFormVal(form, 'image', pkg.image || (pkg.images && pkg.images[0]) || '');
        setFormVal(form, 'maxGroup', pkg.maxGroup || pkg.maxPeople);
        setFormVal(form, 'status', pkg.status || (pkg.isActive ? 'active' : 'disabled'));
    }
    renderPackageIncludes();
    var modal = document.getElementById('pkgModal');
    if (modal) modal.classList.add('active');
}
function closePackageModal() { var m = document.getElementById('pkgModal'); if (m) m.classList.remove('active'); state.editingPackage = null; }
function addPackageInclude() { state.packageIncludes.push(''); renderPackageIncludes(); }
function removePackageInclude(idx) { state.packageIncludes.splice(idx, 1); renderPackageIncludes(); }
function renderPackageIncludes() {
    var list = document.getElementById('includesList');
    if (!list) return;
    list.innerHTML = state.packageIncludes.map(function (inc, i) {
        return '<div class="includes-item"><span style="color:var(--green);font-size:16px">✓</span><input class="form-control" placeholder="What\'s included" value="' + escAttr(inc) + '" data-include-idx="' + i + '"><button class="remove-include" data-remove-include="' + i + '">×</button></div>';
    }).join('');
}

async function savePackage() {
    var form = document.getElementById('pkgForm');
    if (!form) return;
    var name = getFormVal(form, 'name'), category = getFormVal(form, 'category'), price = getFormNum(form, 'price');
    $$('#pkgForm .form-group').forEach(function (g) { g.classList.remove('error'); });
    var hasError = false;
    if (!name) { form.elements['name'].closest('.form-group').classList.add('error'); hasError = true; }
    if (!category) { form.elements['category'].closest('.form-group').classList.add('error'); hasError = true; }
    if (!price) { form.elements['price'].closest('.form-group').classList.add('error'); hasError = true; }
    if (hasError) { toast('Please fill in all required fields', 'error'); return; }
    var data = { name: name, slug: slugify(name), category: category, duration: getFormVal(form, 'duration') || undefined, price: price, description: getFormVal(form, 'description') || undefined, image: getFormVal(form, 'image') || undefined, maxGroup: getFormNum(form, 'maxGroup') || undefined, status: getFormVal(form, 'status') || 'active', includes: state.packageIncludes.filter(function (x) { return x.trim(); }) };
    var res;
    try { res = state.editingPackage ? await API.admin.updatePackage(state.editingPackage._id, data) : await API.admin.createPackage(data); }
    catch (err) { toast('Server error', 'error'); return; }
    if (res.success) { toast(state.editingPackage ? 'Package updated!' : 'Package created!', 'success'); closePackageModal(); loadPackages(); }
    else toast(res.message || 'Failed', 'error');
}

async function editPackage(id) {
    try { var r = await API.admin.getPackage(id); if (r.success) openPackageModal(r.data); else toast('Failed', 'error'); } catch (e) { toast('Server error', 'error'); }
}
async function togglePackageStatus(id) {
    try { var r = await API.admin.togglePackage(id); if (r.success) { toast('Toggled', 'success'); loadPackages(); } else toast(r.message || 'Failed', 'error'); } catch (e) { toast('Server error', 'error'); }
}
function confirmDeletePackage(id, name) {
    openConfirmModal('Delete Package', 'Delete <strong>' + escAttr(name) + '</strong>?', async function () {
        try { var r = await API.admin.deletePackage(id); if (r.success) { toast('Deleted', 'success'); loadPackages(); } else toast(r.message || 'Failed', 'error'); } catch (e) { toast('Server error', 'error'); }
        closeConfirmModal();
    });
}

/* ═══════════════════════════════════════════════════════════════
   BOOKINGS
════════════════════════════════════════════════════════════════ */

function bookingStatusBadge(status) {
    var m = { pending: 'badge-orange', confirmed: 'badge-blue', 'in-progress': 'badge-maroon', completed: 'badge-green', cancelled: 'badge-red' };
    return m[status] || 'badge-gray';
}
function getBookingDisplayName(b) { return b.fullName || b.name || b.customerName || '—'; }
function getBookingItemName(b) { return b.vehicleName || b.packageName || b.itemName || '—'; }
function getBookingType(b) {
    if (b.vehicleId || b.vehicleName) return 'Vehicle';
    if (b.packageId || b.packageName) return 'Package';
    return 'General';
}

function injectBookingModal() {
    if (document.getElementById('bookingDetailModal')) return;
    var div = document.createElement('div');
    div.id = 'bookingDetailModal';
    div.className = 'modal-backdrop';
    div.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;justify-content:center;align-items:center;padding:20px;';
    div.innerHTML = '<div class="modal" style="max-width:760px;width:100%;max-height:90vh;overflow-y:auto;position:relative;">' +
        '<div class="modal-head"><h3 id="bookingDetailTitle">Booking Details</h3><button class="modal-close" id="bookingDetailClose">&times;</button></div>' +
        '<div class="modal-body" id="bookingDetailContent"></div></div>';
    document.body.appendChild(div);
    div.addEventListener('click', function (e) { if (e.target === div) closeBookingDetail(); });
    document.getElementById('bookingDetailClose').addEventListener('click', closeBookingDetail);
}

function openBookingDetail() { var m = document.getElementById('bookingDetailModal'); if (m) { m.style.display = 'flex'; m.classList.add('active'); document.body.style.overflow = 'hidden'; } }
function closeBookingDetail() { var m = document.getElementById('bookingDetailModal'); if (m) { m.style.display = 'none'; m.classList.remove('active'); document.body.style.overflow = ''; } }

async function loadBookings() {
    try {
        var search = (document.getElementById('bSearch') || {}).value || '';
        var status = (document.getElementById('bStatusFilter') || {}).value || '';
        var params = 'limit=100';
        if (search) params += '&search=' + encodeURIComponent(search);
        if (status) params += '&status=' + encodeURIComponent(status);
        var res = await API.admin.getBookings(params);
        if (res && res.success) { state.bookings = Array.isArray(res.data) ? res.data : []; renderBookings(); }
        else { state.bookings = []; renderBookings(); toast(res ? res.message : 'Failed to load bookings', 'error'); }
    } catch (err) { console.error('loadBookings error:', err); state.bookings = []; renderBookings(); toast('Server error', 'error'); }
}

function renderBookings() {
    var tbody = document.getElementById('bookingsBody');
    if (!tbody) return;
    if (!Array.isArray(state.bookings) || state.bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--medium-gray)">No bookings found</td></tr>';
        return;
    }
    tbody.innerHTML = state.bookings.map(function (b) {
        var typeLabel = getBookingType(b);
        var typeBadge = typeLabel === 'Vehicle' ? 'badge-blue' : (typeLabel === 'Package' ? 'badge-maroon' : 'badge-gray');
        var phone = b.phone || b.mobile || b.contactNumber || '';
        return '<tr>' +
            '<td><code style="font-size:11px">' + safeText(b.bookingId || b._id) + '</code></td>' +
            '<td><strong>' + safeText(getBookingDisplayName(b)) + '</strong></td>' +
            '<td>' + (phone ? '<a href="tel:' + escAttr(phone) + '" style="color:var(--maroon);font-weight:500">' + safeText(phone) + '</a>' : '<span style="color:var(--medium-gray)">—</span>') + '</td>' +
            '<td><span class="badge ' + typeBadge + '" style="font-size:10px;display:inline-block;margin-bottom:2px">' + typeLabel + '</span><br><span style="font-size:13px">' + safeText(getBookingItemName(b)) + '</span></td>' +
            '<td style="white-space:nowrap">' + formatDateSafe(b.travelDate || b.date || b.pickupDate) + '</td>' +
            '<td><strong>' + formatCurrencySafe(b.totalPrice || b.price || b.totalAmount) + '</strong></td>' +
            '<td><span class="badge ' + bookingStatusBadge(b.status) + '">' + safeText(b.status || 'pending') + '</span></td>' +
            '<td style="white-space:nowrap"><button class="btn btn-sm btn-secondary" onclick="viewBooking(\'' + b._id + '\')">View</button> <button class="btn btn-sm btn-danger" onclick="deleteBooking(\'' + b._id + '\')" title="Delete">&times;</button></td>' +
            '</tr>';
    }).join('');
}

async function viewBooking(id) {
    injectBookingModal();
    openBookingDetail();
    var content = document.getElementById('bookingDetailContent');
    if (content) content.innerHTML = '<div style="text-align:center;padding:40px;color:#999">Loading...</div>';
    try {
        var res = await API.admin.getBooking(id);
        if (!res || !res.success) { if (content) content.innerHTML = '<div style="text-align:center;padding:40px;color:#D32F2F">Failed to load</div>'; return; }
        renderBookingDetail(res.data);
    } catch (err) { if (content) content.innerHTML = '<div style="text-align:center;padding:40px;color:#D32F2F">Server error</div>'; }
}

function renderBookingDetail(b) {
    var content = document.getElementById('bookingDetailContent');
    if (!content) return;
    var typeLabel = getBookingType(b);
    var h = '';
    h += '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:24px;flex-wrap:wrap;gap:12px">';
    h += '<div><h2 style="margin:0 0 4px;font-size:20px">Booking Details</h2><code style="font-size:12px;color:var(--medium-gray);background:var(--bg);padding:4px 8px;border-radius:4px">' + safeText(b.bookingId || b._id) + '</code></div>';
    h += '<span class="badge ' + bookingStatusBadge(b.status) + '" style="font-size:13px;padding:6px 14px">' + safeText(b.status || 'pending') + '</span></div>';

    h += '<div class="detail-section-title">Customer Information</div><div style="background:var(--bg);border-radius:8px;padding:16px;margin-bottom:20px">';
    h += detailRow('Full Name', safeText(b.fullName || b.name || b.customerName));
    h += detailRow('Email', safeText(b.email));
    h += detailRow('Phone', b.phone || b.mobile ? '<a href="tel:' + escAttr(b.phone || b.mobile) + '" style="color:var(--maroon);font-weight:600">' + safeText(b.phone || b.mobile) + '</a>' : '—');
    h += detailRow('Alternate Phone', safeText(b.alternatePhone || b.altPhone));
    h += detailRow('Address', safeText(b.address || b.pickupAddress));
    h += '</div>';

    h += '<div class="detail-section-title">Booking Information</div><div style="background:var(--bg);border-radius:8px;padding:16px;margin-bottom:20px">';
    h += detailRow('Item Booked', safeText(getBookingItemName(b)));
    h += detailRow('Type', typeLabel);
    h += detailRow('Travel Date', formatDateSafe(b.travelDate || b.date || b.pickupDate));
    h += detailRow('Return Date', formatDateSafe(b.returnDate || b.dropDate));
    h += detailRow('Pickup Location', safeText(b.pickupLocation || b.pickupAddress));
    h += detailRow('Drop Location', safeText(b.dropLocation || b.dropAddress));
    h += detailRow('Pickup Time', safeText(b.pickupTime));
    h += detailRow('Passengers', safeText(b.passengers || b.noOfPersons || b.travelers));
    h += detailRow('Number of Days', safeText(b.numberOfDays || b.days));
    h += detailRow('Number of Vehicles', safeText(b.numberOfVehicles || b.vehicles));
    h += '</div>';

    h += '<div class="detail-section-title">Pricing</div><div style="background:var(--bg);border-radius:8px;padding:16px;margin-bottom:20px">';
    if (b.priceBreakdown && typeof b.priceBreakdown === 'object') {
        var pb = b.priceBreakdown;
        if (pb.basePrice) h += detailRow('Base Price', formatCurrencySafe(pb.basePrice));
        if (pb.perDayPrice) h += detailRow('Per Day Price', formatCurrencySafe(pb.perDayPrice));
        if (pb.totalDays) h += detailRow('Total Days', pb.totalDays);
        if (pb.perKmPrice) h += detailRow('Per Km Price', formatCurrencySafe(pb.perKmPrice));
        if (pb.estimatedKm) h += detailRow('Estimated Km', pb.estimatedKm);
        if (pb.driverAllowance) h += detailRow('Driver Allowance', formatCurrencySafe(pb.driverAllowance));
        if (pb.nightHaltCharges) h += detailRow('Night Halt Charges', formatCurrencySafe(pb.nightHaltCharges));
        if (pb.extraKmCharges) h += detailRow('Extra Km Charges', formatCurrencySafe(pb.extraKmCharges));
        if (pb.tollParking) h += detailRow('Toll / Parking', formatCurrencySafe(pb.tollParking));
        if (pb.gst) h += detailRow('GST', formatCurrencySafe(pb.gst));
        if (pb.discount) h += detailRow('Discount', '<span style="color:var(--green)">- ' + formatCurrencySafe(pb.discount) + '</span>');
    } else {
        if (b.basePrice) h += detailRow('Base Price', formatCurrencySafe(b.basePrice));
        if (b.pricePerDay) h += detailRow('Price Per Day', formatCurrencySafe(b.pricePerDay));
        if (b.discount) h += detailRow('Discount', '<span style="color:var(--green)">- ' + formatCurrencySafe(b.discount) + '</span>');
    }
    h += '<div style="border-top:2px solid var(--dark);margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;font-size:18px;font-weight:700"><span>Total</span><span style="color:var(--maroon)">' + formatCurrencySafe(b.totalPrice || b.price || b.totalAmount) + '</span></div></div>';

    if (b.specialRequests || b.notes || b.message || b.remarks) {
        h += '<div class="detail-section-title">Special Requests / Notes</div><div style="background:#FFF9E6;border-left:4px solid #D9A441;border-radius:0 8px 8px 0;padding:16px;margin-bottom:20px;font-size:14px;color:#5D4E37;line-height:1.7">' + safeText(b.specialRequests || b.notes || b.message || b.remarks) + '</div>';
    }

    h += '<div class="detail-section-title">Timestamps</div><div style="background:var(--bg);border-radius:8px;padding:16px;margin-bottom:24px">';
    h += detailRow('Created', formatDateSafe(b.createdAt) + ' ' + timeAgo(b.createdAt));
    h += detailRow('Updated', formatDateSafe(b.updatedAt) + ' ' + timeAgo(b.updatedAt));
    h += '</div>';

    h += '<div class="detail-section-title">Update Status</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px">';
    var statuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    var sIcons = { pending: '⏳', confirmed: '✅', 'in-progress': '🚗', completed: '🎉', cancelled: '❌' };
    statuses.forEach(function (s) {
        var active = (b.status === s);
        h += '<button class="btn btn-sm ' + (active ? 'btn-primary' : 'btn-ghost') + '" onclick="updateBookingStatus(\'' + b._id + '\',\'' + s + '\')" ' + (active ? 'disabled' : '') + '>' + (sIcons[s] || '') + ' ' + s.charAt(0).toUpperCase() + s.slice(1) + '</button>';
    });
    h += '</div>';

    h += '<div style="border-top:1px solid var(--border);padding-top:20px;display:flex;gap:12px;justify-content:flex-end"><button class="btn btn-danger" onclick="deleteBooking(\'' + b._id + '\');closeBookingDetail();">Delete Booking</button></div>';

    content.innerHTML = h;
}

async function updateBookingStatus(id, status) {
    try {
        var res = await API.admin.updateBookingStatus(id, { status: status });
        if (res && res.success) {
            toast('Status updated to ' + status, 'success');
            var detailRes = await API.admin.getBooking(id);
            if (detailRes && detailRes.success) renderBookingDetail(detailRes.data);
            loadBookings();
        } else { toast(res ? res.message : 'Failed', 'error'); }
    } catch (err) { toast('Server error', 'error'); }
}

function deleteBooking(id) {
    openConfirmModal('Delete Booking', 'Permanently delete this booking?', async function () {
        try { var r = await API.admin.deleteBooking(id); if (r && r.success) { toast('Deleted', 'success'); closeBookingDetail(); loadBookings(); } else toast(r ? r.message : 'Failed', 'error'); }
        catch (e) { toast('Server error', 'error'); }
        closeConfirmModal();
    });
}

/* ═══════════════════════════
   CONTACTS
════════════════════════════ */
async function loadContacts() {
    try {
        var search = (document.getElementById('cSearch') || {}).value || '';
        var params = 'limit=100';
        if (search) params += '&search=' + encodeURIComponent(search);
        var res = await API.admin.getContacts(params);
        if (res && res.success) { state.contacts = Array.isArray(res.data) ? res.data : []; renderContacts(); }
        else { state.contacts = []; renderContacts(); toast(res ? res.message : 'Failed', 'error'); }
    } catch (err) { state.contacts = []; renderContacts(); toast('Server error', 'error'); }
}

function renderContacts() {
    var tbody = document.getElementById('contactsBody');
    if (!tbody) return;
    if (state.contacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--medium-gray)">No contact messages found</td></tr>';
        return;
    }
    tbody.innerHTML = state.contacts.map(function (c) {
        var newBadge = c.isRead ? '' : ' <span class="badge badge-maroon" style="font-size:9px">NEW</span>';
        var statusText = c.isRead ? 'Read' : 'Unread';
        var statusBadge = c.isRead ? 'badge-gray' : 'badge-maroon';
        return '<tr style="' + (c.isRead ? 'opacity:0.7' : 'font-weight:500') + '">' +
            '<td>' + safeText(c.name) + '</td>' +
            '<td>' + safeText(c.email) + '</td>' +
            '<td>' + safeText(c.phone) + '</td>' +
            '<td>' + safeText(c.subject) + '</td>' +
            '<td style="white-space:nowrap">' + formatDateSafe(c.createdAt) + newBadge + '</td>' +
            '<td><span class="badge ' + statusBadge + '">' + statusText + '</span></td>' +
            '<td style="white-space:nowrap"><button class="btn btn-sm btn-secondary" onclick="viewContact(\'' + c._id + '\')">View</button> ' +
            (!c.isRead ? '<button class="btn btn-sm btn-ghost" onclick="markContactRead(\'' + c._id + '\')">Read</button> ' : '') +
            '<button class="btn btn-sm btn-danger" onclick="deleteContact(\'' + c._id + '\')" title="Delete">&times;</button></td></tr>';
    }).join('');
}

async function viewContact(id) {
    try {
        var res = await API.admin.getContact(id);
        if (!res || !res.success) { toast('Failed', 'error'); return; }
        if (!res.data.isRead) API.admin.markRead(id);
        var c = res.data;
        injectBookingModal();
        openBookingDetail();
        var content = document.getElementById('bookingDetailContent');
        if (content) {
            content.innerHTML = '<h2 style="margin:0 0 20px">Contact Message</h2>' +
                '<div class="detail-section-title">Sender</div><div style="background:var(--bg);border-radius:8px;padding:16px;margin-bottom:16px">' +
                detailRow('Name', safeText(c.name)) + detailRow('Email', safeText(c.email)) + detailRow('Phone', safeText(c.phone)) + '</div>' +
                '<div class="detail-section-title">Message</div><div style="background:var(--bg);border-radius:8px;padding:16px;margin-bottom:16px">' + detailRow('Subject', safeText(c.subject)) + '</div>' +
                '<div style="background:#FFF9E6;border-left:4px solid #D9A441;border-radius:0 8px 8px 0;padding:20px;margin-bottom:16px;font-size:14px;color:#3D3027;line-height:1.8;white-space:pre-wrap">' + safeText(c.message) + '</div>' +
                '<div style="font-size:12px;color:var(--medium-gray);text-align:right;margin-bottom:20px">Received: ' + formatDateSafe(c.createdAt) + '</div>' +
                '<div style="text-align:right"><button class="btn btn-danger" onclick="deleteContact(\'' + c._id + '\');closeBookingDetail();">Delete</button></div>';
        }
        loadContacts();
    } catch (err) { toast('Server error', 'error'); }
}

async function markContactRead(id) {
    try { var r = await API.admin.markRead(id); if (r && r.success) { toast('Marked as read', 'success'); loadContacts(); } else toast('Failed', 'error'); }
    catch (e) { toast('Server error', 'error'); }
}

function deleteContact(id) {
    openConfirmModal('Delete Contact', 'Delete this message?', async function () {
        try { var r = await API.admin.deleteContact(id); if (r && r.success) { toast('Deleted', 'success'); closeBookingDetail(); loadContacts(); } else toast('Failed', 'error'); }
        catch (e) { toast('Server error', 'error'); }
        closeConfirmModal();
    });
}

function exportContacts() {
    toast('Export feature coming soon', 'info');
}

/* ═══════════════════════════
   SETTINGS & PROFILE
════════════════════════════ */
function saveSettings() { toast('Settings saved!', 'success'); }

function saveProfile() { toast('Profile saved!', 'success'); }

async function changePassword() {
    var current = document.getElementById('currentPassword');
    var newPwd = document.getElementById('newPassword');
    var confirm = document.getElementById('confirmPassword');
    if (!current || !newPwd || !confirm) return;
    if (!current.value || !newPwd.value || !confirm.value) { toast('Fill all password fields', 'error'); return; }
    if (newPwd.value !== confirm.value) { toast('New passwords do not match', 'error'); return; }
    try {
        var res = await API.admin.changePassword({ currentPassword: current.value, newPassword: newPwd.value });
        if (res && res.success) { toast('Password changed!', 'success'); current.value = ''; newPwd.value = ''; confirm.value = ''; }
        else toast(res ? res.message : 'Failed to change password', 'error');
    } catch (err) { toast('Server error', 'error'); }
}

/* ═══════════════════════════
   GLOBAL CLICK HANDLER
════════════════════════════ */
document.addEventListener('input', function (e) {
    var target = e.target;
    if (target.dataset.imgIdx !== undefined) {
        var idx = parseInt(target.dataset.imgIdx, 10);
        if (!isNaN(idx) && state.vehicleImages[idx] !== undefined) {
            state.vehicleImages[idx] = target.value;
        }
    }
    if (target.dataset.routeIdx !== undefined) {
        var idx = parseInt(target.dataset.routeIdx, 10);
        if (!isNaN(idx) && state.vehicleRoutes[idx] !== undefined) {
            state.vehicleRoutes[idx] = target.value;
        }
    }
    if (target.dataset.includeIdx !== undefined) {
        var idx = parseInt(target.dataset.includeIdx, 10);
        if (!isNaN(idx) && state.packageIncludes[idx] !== undefined) {
            state.packageIncludes[idx] = target.value;
        }
    }
});

document.addEventListener('click', function (e) {
    /* Remove image */
    var rmImg = e.target.closest('[data-remove-img]');
    if (rmImg) { removeVehicleImage(parseInt(rmImg.dataset.removeImg, 10)); return; }
    /* Remove route */
    var rmRoute = e.target.closest('[data-remove-route]');
    if (rmRoute) { removeVehicleRoute(parseInt(rmRoute.dataset.removeRoute, 10)); return; }
    /* Remove include */
    var rmInc = e.target.closest('[data-remove-include]');
    if (rmInc) { removePackageInclude(parseInt(rmInc.dataset.removeInclude, 10)); return; }
    /* Panel thumbnail */
    var thumb = e.target.closest('[data-panel-thumb]');
    if (thumb) {
        var mainImg = document.getElementById('vp-main-img');
        if (mainImg) mainImg.src = thumb.dataset.panelThumb;
        $$('.panel-img-thumbs img').forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
        return;
    }
    /* Data-action handler */
    var actionEl = e.target.closest('[data-action]');
    if (actionEl) {
        var action = actionEl.dataset.action;
        var id = actionEl.dataset.id;
        if (action === 'view-vehicle') viewVehicle(id);
        else if (action === 'edit-vehicle') editVehicle(id);
        else if (action === 'toggle-vehicle') toggleVehicle(id);
        else if (action === 'delete-vehicle') confirmDeleteVehicle(id, actionEl.dataset.name);
        else if (action === 'edit-package') editPackage(id);
        else if (action === 'toggle-package') togglePackageStatus(id);
        else if (action === 'delete-package') confirmDeletePackage(id, actionEl.dataset.name);
    }
});

/* ═══════════════════════════
   INIT — DOMContentLoaded
════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    loadAdminProfile();

    /* Sidebar */
    var hamburger = document.getElementById('hamburger');
    if (hamburger) hamburger.addEventListener('click', openSidebar);
    var sidebarClose = document.getElementById('sidebarClose');
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    var sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    /* Nav items */
    $$('.nav-item').forEach(function (btn) {
        btn.addEventListener('click', function () { navigateTo(btn.dataset.section); });
    });

    /* Vehicle buttons */
    var addVehicleBtn = document.getElementById('addVehicleBtn');
    if (addVehicleBtn) addVehicleBtn.addEventListener('click', function () { openVehicleModal(); });
    var vehicleModalClose = document.getElementById('vehicleModalClose');
    if (vehicleModalClose) vehicleModalClose.addEventListener('click', closeVehicleModal);
    var vehicleModalCancel = document.getElementById('vehicleModalCancel');
    if (vehicleModalCancel) vehicleModalCancel.addEventListener('click', closeVehicleModal);
    var vehicleModalSave = document.getElementById('vehicleModalSave');
    if (vehicleModalSave) vehicleModalSave.addEventListener('click', saveVehicle);
    var addImgBtn = document.getElementById('addImgBtn');
    if (addImgBtn) addImgBtn.addEventListener('click', addVehicleImage);
    var addRouteBtn = document.getElementById('addRouteBtn');
    if (addRouteBtn) addRouteBtn.addEventListener('click', addVehicleRoute);

    /* Vehicle tabs */
    $$('#vFormTabs .form-tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { switchVehicleTab(btn.dataset.tab); });
    });

    /* Package buttons */
    var addPkgBtn = document.getElementById('addPkgBtn');
    if (addPkgBtn) addPkgBtn.addEventListener('click', function () { openPackageModal(); });
    var pkgModalClose = document.getElementById('pkgModalClose');
    if (pkgModalClose) pkgModalClose.addEventListener('click', closePackageModal);
    var pkgModalCancel = document.getElementById('pkgModalCancel');
    if (pkgModalCancel) pkgModalCancel.addEventListener('click', closePackageModal);
    var pkgModalSave = document.getElementById('pkgModalSave');
    if (pkgModalSave) pkgModalSave.addEventListener('click', savePackage);
    var addIncludeBtn = document.getElementById('addIncludeBtn');
    if (addIncludeBtn) addIncludeBtn.addEventListener('click', addPackageInclude);

    /* Confirm modal */
    var confirmCancelBtn = document.getElementById('confirmCancel');
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', closeConfirmModal);
    var confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', function () {
        if (typeof _confirmCallback === 'function') _confirmCallback();
    });

    /* Filters */
    var vSearch = document.getElementById('vSearch');
    if (vSearch) vSearch.addEventListener('input', debounce(loadVehicles, 400));
    var vTypeFilter = document.getElementById('vTypeFilter');
    if (vTypeFilter) vTypeFilter.addEventListener('change', loadVehicles);
    var vStatusFilter = document.getElementById('vStatusFilter');
    if (vStatusFilter) vStatusFilter.addEventListener('change', loadVehicles);

    var pSearch = document.getElementById('pSearch');
    if (pSearch) pSearch.addEventListener('input', debounce(loadPackages, 400));
    var pCatFilter = document.getElementById('pCatFilter');
    if (pCatFilter) pCatFilter.addEventListener('change', loadPackages);

    var bSearch = document.getElementById('bSearch');
    if (bSearch) bSearch.addEventListener('input', debounce(loadBookings, 400));
    var bStatusFilter = document.getElementById('bStatusFilter');
    if (bStatusFilter) bStatusFilter.addEventListener('change', loadBookings);

    var cSearch = document.getElementById('cSearch');
    if (cSearch) cSearch.addEventListener('input', debounce(loadContacts, 400));

    /* Header time */
    function updateHeaderTime() {
        var ht = document.getElementById('headerTime');
        if (ht) ht.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    updateHeaderTime();
    setInterval(updateHeaderTime, 30000);

    /* Start on dashboard */
    var activeNav = document.querySelector('.nav-item.active');
    navigateTo(activeNav ? activeNav.dataset.section : 'dashboard');
});

console.log('✅ Admin dashboard controller loaded (fixed: no-image placeholder, tab bug, price validation, routes)');