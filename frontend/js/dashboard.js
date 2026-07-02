/* ═══════════════════════════════════════════════════════════════
   VOYAGO — Admin Dashboard Controller
   Matches: admin-dashboard.html
   Depends: /js/api.js, Chart.js (CDN)
   ⚠️ NO IIFE — all functions must be global for onclick + addEventListener
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
    vehicleFeatures: [],
    vehicleRoutes: [],
    packageIncludes: []
};

/* ───────────────────────────
   HELPERS
─────────────────────────── */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatCurrency(n) {
    if (n === null || n === undefined || n === '') return '—';

    const num = Number(n);
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
   SIDEBAR MOBILE
─────────────────────────── */
function openSidebar() {
    var overlay = document.getElementById('sidebarOverlay');
    var sidebar = document.getElementById('sidebar');
    if (overlay) overlay.classList.add('active');
    if (sidebar) sidebar.classList.add('mobile-open');
}

function closeSidebar() {
    var overlay = document.getElementById('sidebarOverlay');
    var sidebar = document.getElementById('sidebar');
    if (overlay) overlay.classList.remove('active');
    if (sidebar) sidebar.classList.remove('mobile-open');
}

/* ───────────────────────────
   NAVIGATION
─────────────────────────── */
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
        settings: 'Settings',
        profile: 'Profile'
    };
    var ht = document.getElementById('headerTitle');
    if (ht) ht.textContent = titles[section] || 'Dashboard';

    if (section === 'dashboard') loadDashboard();
    if (section === 'vehicles') loadVehicles();
    if (section === 'packages') loadPackages();
    if (section === 'bookings') loadBookings();

    closeSidebar();
}

/* ───────────────────────────
   AUTH
─────────────────────────── */
var API_BASE = window.location.origin + '/api';

function getToken() {
    return localStorage.getItem('voyago_token') || sessionStorage.getItem('voyago_token');
}

let adminProfileLoaded = false;

async function loadAdminProfile() {
    if (adminProfileLoaded) return;
    adminProfileLoaded = true;

    const token = getToken();
    if (!token) {
        window.location.replace('/admin-login.html');
        return;
    }

    try {
        const res = await fetch(API_BASE + '/admin/me', {
            headers: { Authorization: 'Bearer ' + token }
        });

        // 🚨 handle non-JSON / server error pages
        if (!res.ok) throw new Error('HTTP ' + res.status);

        const data = await res.json();

        console.log("Admin API response:", data);

        if (!data?.success || !data?.admin) {
            logout(); // better than manual clearing
            return;
        }

        state.admin = data.admin;

        const nameEl = document.querySelector('.sidebar-user-name');
        if (nameEl) {
            nameEl.textContent = data.admin?.name ?? 'Admin';
        }

    } catch (err) {
        console.error('Admin profile error:', err);
        adminProfileLoaded = false;
    }
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
                return;
            }
        }
    } catch (e) { /* fallback below */ }

    try {
        var results = await Promise.all([
            API.admin.getVehicles ? API.admin.getVehicles('limit=100') : { data: [], total: 0 },
            API.admin.getPackages ? API.admin.getPackages('limit=100') : { data: [], total: 0 },
            API.admin.getBookings ? API.admin.getBookings('limit=100') : { data: [], total: 0 }
        ]);
        var v = results[0], p = results[1], b = results[2];
        var vData = v.data || [];
        var pData = p.data || [];
        var bData = b.data || [];
        renderDashboardStats({
            totalVehicles: v.total || vData.length,
            activeVehicles: vData.filter(function (x) { return x.isActive || x.status === 'active'; }).length,
            totalPackages: p.total || pData.length,
            activePackages: pData.filter(function (x) { return x.isActive || x.status === 'active'; }).length,
            totalBookings: b.total || bData.length,
            pendingBookings: bData.filter(function (x) { return x.status === 'pending'; }).length,
            totalRevenue: bData.reduce(function (sum, x) { return sum + (x.totalPrice || 0); }, 0)
        });
    } catch (err) {
        console.error('Dashboard load error:', err);
        renderDashboardStats({});
    }
}

function renderDashboardStats(d) {
    var grid = document.getElementById('statsGrid');
    if (!grid) return;
    var stats = [
        { label: 'Total Vehicles', value: d.totalVehicles || 0, icon: '🚗', color: 'maroon' },
        { label: 'Active Vehicles', value: d.activeVehicles || 0, icon: '✅', color: 'green' },
        { label: 'Total Packages', value: d.totalPackages || 0, icon: '📦', color: 'blue' },
        { label: 'Total Bookings', value: d.totalBookings || 0, icon: '📅', color: 'orange' },
        { label: 'Pending Bookings', value: d.pendingBookings || 0, icon: '⏳', color: 'gold' },
        { label: 'Revenue', value: d.totalRevenue || 0, icon: '💰', color: 'green', isCurrency: true }
    ];
    grid.innerHTML = stats.map(function (s) {
        return '<div class="stat-card">' +
            '<div class="stat-top"><div class="stat-icon ' + s.color + '" style="font-size:20px">' + s.icon + '</div></div>' +
            '<div class="stat-label">' + s.label + '</div>' +
            '<div class="stat-value">' + (s.isCurrency ? formatCurrency(s.value) : s.value) + '</div>' +
            '</div>';
    }).join('');
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
        if (!res || !res.success) {
            toast(res ? res.message : 'Failed to load vehicles', 'error');
            return;
        }
        state.vehicles = res.data || [];
        renderVehicles();
    } catch (err) {
        console.error(err);
        toast('Server error loading vehicles', 'error');
    }
}

function isVehicleActive(v) {
    return v.isActive === true || v.status === 'active';
}

function renderVehicles() {
    var grid = document.getElementById('vehiclesGrid');
    if (!grid) return;

    if (state.vehicles.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">' +
            '<h3>No Vehicles Found</h3>' +
            '<p>Start by adding your first vehicle to the fleet.</p>' +
            '<button class="btn btn-primary" id="emptyAddVehicleBtn">+ Add Vehicle</button>' +
            '</div>';
        var emptyBtn = document.getElementById('emptyAddVehicleBtn');
        if (emptyBtn) emptyBtn.addEventListener('click', function () { openVehicleModal(); });
        return;
    }

    var typeColors = {
        sedan: 'badge-blue', suv: 'badge-green', van: 'badge-orange',
        bus: 'badge-maroon', luxury: 'badge-gold', motorcycle: 'badge-gray',
        Sedan: 'badge-blue', SUV: 'badge-green', Van: 'badge-orange',
        Bus: 'badge-maroon', Luxury: 'badge-gold', Motorcycle: 'badge-gray'
    };

    grid.innerHTML = state.vehicles.map(function (v) {
        var img = (v.images && v.images[0]) || '';
        var typeBadge = typeColors[v.type] || 'badge-gray';
        var active = isVehicleActive(v);
        var statusBadge = active ? 'badge-green' : 'badge-red';
        var statusText = active ? 'Active' : (v.status === 'maintenance' ? 'Maintenance' : 'Disabled');

        return '<div class="admin-v-card' + (active ? '' : ' disabled-card') + '" data-id="' + v._id + '">' +
            '<div class="admin-v-img">' +
            (img ? '<img src="' + img + '" alt="' + escAttr(v.name) + '" loading="lazy">' : '') +
            '<div class="admin-v-img-overlay"></div>' +
            '<span class="admin-v-badge badge ' + typeBadge + '">' + (v.type || 'Other') + '</span>' +
            '<span class="admin-v-type">' + escAttr(v.brand || '') + ' ' + escAttr(v.model || '') + '</span>' +
            '<span class="admin-v-status badge ' + statusBadge + '">' + statusText + '</span>' +
            '</div>' +
            '<div class="admin-v-body">' +
            '<div class="admin-v-name">' + escAttr(v.name) + '</div>' +
            '<div class="admin-v-slug">' + escAttr(v.slug || '') + '</div>' +
            '<div class="admin-v-details">' +
            '<div class="admin-v-detail">Seats: <strong>' + (v.seats || '—') + '</strong></div>' +
            '<div class="admin-v-detail">Year: <strong>' + (v.year || '—') + '</strong></div>' +
            '<div class="admin-v-detail">Trans: <strong>' + (v.transmission || '—') + '</strong></div>' +
            '<div class="admin-v-detail">Fuel: <strong>' + (v.fuelType || v.fuel || '—') + '</strong></div>' +
            '</div>' +
            '<div class="admin-v-price">' + formatCurrency(v.pricePerDay) + ' <span>/ day</span></div>' +
            '<div class="admin-v-actions">' +
            '<button class="btn btn-sm btn-secondary" data-action="view-vehicle" data-id="' + v._id + '">View</button>' +
            '<button class="btn btn-sm btn-primary" data-action="edit-vehicle" data-id="' + v._id + '">Edit</button>' +
            '<button class="btn btn-sm btn-ghost" data-action="toggle-vehicle" data-id="' + v._id + '">' + (active ? 'Disable' : 'Enable') + '</button>' +
            '<button class="btn btn-sm btn-danger" data-action="delete-vehicle" data-id="' + v._id + '" data-name="' + escAttr(v.name) + '">Delete</button>' +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');
}

/* ─── VEHICLE MODAL ─── */
function openVehicleModal(vehicle) {
    state.editingVehicle = vehicle || null;
    state.vehicleImages = vehicle ? (vehicle.images || []).slice() : [];
    state.vehicleFeatures = vehicle ? (vehicle.features || []).slice() : [];
    state.vehicleRoutes = vehicle ? (vehicle.routes || []).slice() : [];

    var title = document.getElementById('vehicleModalTitle');
    if (title) title.textContent = vehicle ? 'Edit Vehicle' : 'Add Vehicle';

    var form = document.getElementById('vehicleForm');
    if (!form) return;

    // Reset form
    form.reset();
    // Clear error states
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

    // Switch to first tab
    switchVehicleTab('vtab-basic');

    renderVehicleImages();
    renderVehicleFeatures();
    renderVehicleRoutes();

    var modal = document.getElementById('vehicleModal');
    if (modal) modal.classList.add('active');
}

function closeVehicleModal() {
    var modal = document.getElementById('vehicleModal');
    if (modal) modal.classList.remove('active');
    state.editingVehicle = null;
}

function setFormVal(form, name, val) {
    var el = form.elements[name];
    if (el) el.value = (val !== undefined && val !== null) ? val : '';
}

function getFormVal(form, name) {
    var el = form.elements[name];
    return el ? el.value.trim() : '';
}

function getFormNum(form, name) {
    var el = form.elements[name];
    return el ? parseFloat(el.value) || 0 : 0;
}

/* ─── VEHICLE FORM TABS ─── */
function switchVehicleTab(tabId) {
    var tabs = document.querySelectorAll('#vFormTabs .form-tab-btn');
    var panes = document.querySelectorAll('#vehicleForm .form-tab-pane');
    tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.tab === tabId); });
    panes.forEach(function (p) { p.classList.toggle('active', p.id === tabId); });
}

/* ─── VEHICLE IMAGES ─── */
function addVehicleImage() {
    state.vehicleImages.push('');
    renderVehicleImages();
}

function removeVehicleImage(idx) {
    state.vehicleImages.splice(idx, 1);
    renderVehicleImages();
}

function updateVehicleImage(idx, val) {
    state.vehicleImages[idx] = val;
}

function renderVehicleImages() {
    var list = document.getElementById('imgList');
    if (!list) return;
    list.innerHTML = state.vehicleImages.map(function (url, i) {
        var safeUrl = escAttr(url);
        return '<div class="img-list-item">' +
            (url ? '<img src="' + safeUrl + '" alt="Vehicle">' :
                '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'64\' height=\'44\' fill=\'%23E8E3DC\'%3E%3Crect width=\'64\' height=\'44\' rx=\'4\'/%3E%3Ctext x=\'50%25\' y=\'55%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%238B8680\' font-size=\'10\'>No img%3C/text%3E%3C/svg%3E" alt="No image">') +
            '<input class="form-control" placeholder="Image URL" value="' + safeUrl + '" data-img-idx="' + i + '">' +
            '<button class="remove-img" data-remove-img="' + i + '">×</button>' +
            '</div>';
    }).join('');
}

/* ─── VEHICLE FEATURES ─── */
var ALL_FEATURES = [
    'AC', 'Bluetooth', 'USB Charging', 'GPS', 'WiFi',
    'Leather Seats', 'Sunroof', 'Backup Camera', 'Parking Sensors',
    'Cruise Control', 'Keyless Entry', 'Tinted Windows', 'Child Lock',
    'Spare Tire', 'First Aid Kit', 'Fire Extinguisher'
];

function renderVehicleFeatures() {
    var grid = document.getElementById('featuresGrid');
    if (!grid) return;
    grid.innerHTML = ALL_FEATURES.map(function (feat) {
        var checked = state.vehicleFeatures.indexOf(feat) !== -1;
        return '<label class="feature-check' + (checked ? ' checked' : '') + '" data-feature="' + escAttr(feat) + '">' +
            '<input type="checkbox"' + (checked ? ' checked' : '') + '>' +
            feat +
            '</label>';
    }).join('');
}

function toggleFeature(labelEl, featName) {
    var idx = state.vehicleFeatures.indexOf(featName);
    if (idx === -1) {
        state.vehicleFeatures.push(featName);
        labelEl.classList.add('checked');
        labelEl.querySelector('input').checked = true;
    } else {
        state.vehicleFeatures.splice(idx, 1);
        labelEl.classList.remove('checked');
        labelEl.querySelector('input').checked = false;
    }
}

/* ─── VEHICLE ROUTES ─── */
function addVehicleRoute() {
    state.vehicleRoutes.push('');
    renderVehicleRoutes();
}

function removeVehicleRoute(idx) {
    state.vehicleRoutes.splice(idx, 1);
    renderVehicleRoutes();
}

function updateVehicleRoute(idx, val) {
    state.vehicleRoutes[idx] = val;
}

function renderVehicleRoutes() {
    var list = document.getElementById('routesList');
    if (!list) return;
    list.innerHTML = state.vehicleRoutes.map(function (r, i) {
        return '<div class="route-item">' +
            '<span class="route-emoji">📍</span>' +
            '<input class="form-control" placeholder="Route name (e.g. Colombo → Kandy)" value="' + escAttr(r) + '" data-route-idx="' + i + '">' +
            '<button class="remove-route" data-remove-route="' + i + '">×</button>' +
            '</div>';
    }).join('');
}

/* ─── SAVE VEHICLE ─── */
async function saveVehicle() {
    var form = document.getElementById('vehicleForm');
    if (!form) return;

    var name = getFormVal(form, 'name');
    var type = getFormVal(form, 'type');
    var brand = getFormVal(form, 'brand');

    // Clear errors
    $$('#vehicleForm .form-group').forEach(function (g) { g.classList.remove('error'); });

    // Validate
    var hasError = false;
    if (!name) { form.elements['name'].closest('.form-group').classList.add('error'); hasError = true; }
    if (!type) { form.elements['type'].closest('.form-group').classList.add('error'); hasError = true; }
    if (!brand) { form.elements['brand'].closest('.form-group').classList.add('error'); hasError = true; }
    if (hasError) { toast('Please fill in all required fields', 'error'); return; }

    var data = {
        name: name,
        type: type,
        brand: brand,
        slug: slugify(name),
        model: getFormVal(form, 'model') || undefined,
        year: getFormNum(form, 'year') || undefined,
        description: getFormVal(form, 'description') || undefined,
        seats: getFormNum(form, 'seats') || undefined,
        bags: getFormNum(form, 'bags') || undefined,
        fuelType: getFormVal(form, 'fuelType') || undefined,
        transmission: getFormVal(form, 'transmission') || undefined,
        pricePerDay: getFormNum(form, 'pricePerDay') || undefined,
        dailyRate: getFormNum(form, 'dailyRate') || undefined,
        pricePerKm: getFormNum(form, 'pricePerKm') || undefined,
        badge: getFormVal(form, 'badge') || undefined,
        badgeClass: getFormVal(form, 'badgeClass') || undefined,
        rating: getFormNum(form, 'rating') || undefined,
        totalTrips: getFormNum(form, 'totalTrips') || undefined,
        totalKmLakhs: getFormNum(form, 'totalKmLakhs') || undefined,
        ac: form.elements['ac'].value === 'true',
        status: getFormVal(form, 'status') || 'active',
        images: state.vehicleImages.filter(function (u) { return u.trim(); }),
        features: state.vehicleFeatures.slice(),
        routes: state.vehicleRoutes.filter(function (r) { return r.trim(); })
    };

    var res;
    try {
        if (state.editingVehicle) {
            res = await API.admin.updateVehicle(state.editingVehicle._id, data);
        } else {
            res = await API.admin.createVehicle(data);
        }
    } catch (err) {
        toast('Server error saving vehicle', 'error');
        return;
    }

    if (res.success) {
        toast(state.editingVehicle ? 'Vehicle updated!' : 'Vehicle created!', 'success');
        closeVehicleModal();
        loadVehicles();
    } else {
        toast(res.message || 'Failed to save vehicle', 'error');
    }
}

/* ─── VEHICLE ACTIONS ─── */
async function viewVehicle(id) {
    try {
        var res = await API.admin.getVehicle(id);
        if (!res.success) { toast('Failed to load vehicle', 'error'); return; }
        openVehiclePanel(res.data);
    } catch (err) {
        toast('Server error', 'error');
    }
}

async function editVehicle(id) {
    try {
        var res = await API.admin.getVehicle(id);
        if (!res.success) { toast('Failed to load vehicle', 'error'); return; }
        openVehicleModal(res.data);
    } catch (err) {
        toast('Server error', 'error');
    }
}

async function toggleVehicle(id) {
    try {
        var res = await API.admin.toggleVehicle(id);
        if (res.success) { toast('Vehicle status toggled', 'success'); loadVehicles(); }
        else { toast(res.message || 'Failed to toggle', 'error'); }
    } catch (err) { toast('Server error', 'error'); }
}

function confirmDeleteVehicle(id, name) {
    openConfirmModal(
        'Delete Vehicle',
        'Are you sure you want to delete <strong>' + escAttr(name) + '</strong>? This action cannot be undone.',
        async function () {
            try {
                var res = await API.admin.deleteVehicle(id);
                if (res.success) { toast('Vehicle deleted', 'success'); loadVehicles(); }
                else { toast(res.message || 'Failed to delete', 'error'); }
            } catch (err) { toast('Server error', 'error'); }
            closeConfirmModal();
        }
    );
}

/* ─── VEHICLE DETAIL PANEL ─── */
function openVehiclePanel(v) {
    var panel = document.getElementById('vehiclePanel');
    var body = document.getElementById('panelBody');
    if (!panel || !body) return;

    var mainImg = (v.images && v.images[0]) || '';
    var thumbs = (v.images || []).slice(0, 10);
    var active = isVehicleActive(v);

    body.innerHTML =
        (mainImg ? '<img class="panel-img-main" src="' + escAttr(mainImg) + '" alt="' + escAttr(v.name) + '" id="vp-main-img">' : '') +
        (thumbs.length > 1 ? '<div class="panel-img-thumbs">' + thumbs.map(function (img, i) {
            return '<img src="' + escAttr(img) + '" alt="Thumb"' + (i === 0 ? ' class="active"' : '') + ' data-panel-thumb="' + escAttr(img) + '">';
        }).join('') + '</div>' : '') +
        '<div class="detail-section-title">Vehicle Info</div>' +
        detailRow('Name', v.name) +
        detailRow('Slug', '<code>' + escAttr(v.slug || '') + '</code>') +
        detailRow('Type', v.type) +
        detailRow('Brand', v.brand || '—') +
        detailRow('Model', v.model || '—') +
        detailRow('Year', v.year || '—') +
        detailRow('Status', active ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-red">' + (v.status || 'Disabled') + '</span>') +
        '<div class="detail-section-title">Specifications</div>' +
        '<div class="panel-specs-grid">' +
        specItem('👤', 'Seats', v.seats) +
        specItem('💿', 'Bags', v.bags) +
        specItem('⚙️', 'Transmission', v.transmission) +
        specItem('⛽', 'Fuel', v.fuelType || v.fuel) +
        specItem('❄️', 'AC', v.ac !== false ? 'Yes' : 'No') +
        specItem('💰', 'Price/Day', formatCurrency(v.pricePerDay)) +
        specItem('🛣️', 'Price/Km', v.pricePerKm ? formatCurrency(v.pricePerKm) : '—') +
        specItem('⭐', 'Rating', v.rating || '—') +
        specItem('📅', 'Created', formatDate(v.createdAt)) +
        '</div>' +
        (v.features && v.features.length ? '<div class="detail-section-title">Features</div><div style="margin-bottom:16px">' +
            v.features.map(function (f) { return '<span class="panel-feature-tag">✓ ' + escAttr(f) + '</span>'; }).join('') +
            '</div>' : '') +
        (v.routes && v.routes.length ? '<div class="detail-section-title">Routes</div><div style="margin-bottom:16px">' +
            v.routes.map(function (r) { return '<span class="panel-route-tag">📍 ' + escAttr(r) + '</span>'; }).join('') +
            '</div>' : '') +
        (v.description ? '<div class="detail-section-title">Description</div><p style="font-size:13px;color:var(--text-muted);line-height:1.7">' + escAttr(v.description) + '</p>' : '');

    panel.classList.add('active');
    var overlay = document.getElementById('panelOverlay');
    if (overlay) overlay.classList.add('active');
}

function closeVehiclePanel() {
    var panel = document.getElementById('vehiclePanel');
    if (panel) panel.classList.remove('active');
    var overlay = document.getElementById('panelOverlay');
    if (overlay) overlay.classList.remove('active');
}

function switchVPanelImg(thumb, src) {
    var main = document.getElementById('vp-main-img');
    if (main) main.src = src;
    $$('.panel-img-thumbs img').forEach(function (img) { img.classList.remove('active'); });
    thumb.classList.add('active');
}

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
        if (res.success) {
            state.packages = res.data || [];
            renderPackages();
        } else {
            toast(res.message || 'Failed to load packages', 'error');
        }
    } catch (err) {
        toast('Server error loading packages', 'error');
    }
}

function isPackageActive(p) {
    return p.isActive === true || p.status === 'active';
}

function renderPackages() {
    var grid = document.getElementById('packagesGrid');
    if (!grid) return;

    if (state.packages.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">' +
            '<h3>No Packages Found</h3>' +
            '<p>Create your first travel package to get started.</p>' +
            '<button class="btn btn-primary" id="emptyAddPkgBtn">+ Add Package</button>' +
            '</div>';
        var emptyBtn = document.getElementById('emptyAddPkgBtn');
        if (emptyBtn) emptyBtn.addEventListener('click', function () { openPackageModal(); });
        return;
    }

    var catColors = {
        adventure: 'badge-orange', cultural: 'badge-maroon', beach: 'badge-blue',
        wildlife: 'badge-green', mountain: 'badge-gold', city: 'badge-blue',
        luxury: 'badge-gold', pilgrimage: 'badge-maroon', other: 'badge-gray',
        Adventure: 'badge-orange', Cultural: 'badge-maroon', Beach: 'badge-blue',
        Wildlife: 'badge-green', Mountain: 'badge-gold', City: 'badge-blue'
    };

    grid.innerHTML = state.packages.map(function (p) {
        var img = p.image || (p.images && p.images[0]) || '';
        var catBadge = catColors[p.category] || 'badge-gray';
        var active = isPackageActive(p);
        var statusBadge = active ? 'badge-green' : 'badge-red';
        var statusText = active ? 'Active' : 'Disabled';

        var includesHtml = (p.includes || []).slice(0, 4).map(function (inc) {
            return '<span class="admin-pkg-include-tag">' + escAttr(inc) + '</span>';
        }).join('');

        return '<div class="admin-pkg-card' + (active ? '' : ' disabled-card') + '" data-id="' + p._id + '">' +
            '<div class="admin-pkg-img">' +
            (img ? '<img src="' + escAttr(img) + '" alt="' + escAttr(p.name) + '" loading="lazy">' : '') +
            '<div class="admin-pkg-img-overlay"></div>' +
            '<span class="admin-pkg-cat badge ' + catBadge + '">' + (p.category || 'Other') + '</span>' +
            (p.duration ? '<span class="admin-pkg-duration">' + escAttr(p.duration) + '</span>' : '') +
            '<span class="admin-pkg-status badge ' + statusBadge + '">' + statusText + '</span>' +
            '</div>' +
            '<div class="admin-pkg-body">' +
            '<div class="admin-pkg-name">' + escAttr(p.name) + '</div>' +
            '<div class="admin-pkg-desc">' + escAttr(p.shortDescription || p.description || '') + '</div>' +
            (includesHtml ? '<div class="admin-pkg-includes">' + includesHtml + '</div>' : '') +
            '<div class="admin-pkg-footer">' +
            '<div class="admin-pkg-price">' + formatCurrency(p.discountPrice || p.price) +
            (p.discountPrice ? ' <span style="text-decoration:line-through;color:var(--medium-gray);font-size:13px;font-weight:400">' + formatCurrency(p.price) + '</span>' : '') +
            '</div>' +
            '<div class="admin-pkg-rating">' + (p.isFeatured ? '⭐ Featured' : '') + '</div>' +
            '</div>' +
            '<div class="admin-pkg-actions">' +
            '<button class="btn btn-sm btn-secondary" data-action="edit-package" data-id="' + p._id + '">Edit</button>' +
            '<button class="btn btn-sm btn-ghost" data-action="toggle-package" data-id="' + p._id + '">' + (active ? 'Disable' : 'Enable') + '</button>' +
            '<button class="btn btn-sm btn-danger" data-action="delete-package" data-id="' + p._id + '" data-name="' + escAttr(p.name) + '">Delete</button>' +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');
}

/* ─── PACKAGE MODAL ─── */
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
        setFormVal(form, 'name', pkg.name);
        setFormVal(form, 'category', pkg.category);
        setFormVal(form, 'duration', pkg.duration);
        setFormVal(form, 'price', pkg.price);
        setFormVal(form, 'description', pkg.description);
        setFormVal(form, 'image', pkg.image || (pkg.images && pkg.images[0]) || '');
        setFormVal(form, 'maxGroup', pkg.maxGroup || pkg.maxPeople);
        setFormVal(form, 'status', pkg.status || (pkg.isActive ? 'active' : 'disabled'));
    }

    renderPackageIncludes();

    var modal = document.getElementById('pkgModal');
    if (modal) modal.classList.add('active');
}

function closePackageModal() {
    var modal = document.getElementById('pkgModal');
    if (modal) modal.classList.remove('active');
    state.editingPackage = null;
}

/* ─── PACKAGE INCLUDES ─── */
function addPackageInclude() {
    state.packageIncludes.push('');
    renderPackageIncludes();
}

function removePackageInclude(idx) {
    state.packageIncludes.splice(idx, 1);
    renderPackageIncludes();
}

function updatePackageInclude(idx, val) {
    state.packageIncludes[idx] = val;
}

function renderPackageIncludes() {
    var list = document.getElementById('includesList');
    if (!list) return;
    list.innerHTML = state.packageIncludes.map(function (inc, i) {
        return '<div class="includes-item">' +
            '<span style="color:var(--green);font-size:16px">✓</span>' +
            '<input class="form-control" placeholder="What\'s included (e.g. Airport Transfer)" value="' + escAttr(inc) + '" data-include-idx="' + i + '">' +
            '<button class="remove-include" data-remove-include="' + i + '">×</button>' +
            '</div>';
    }).join('');
}

/* ─── SAVE PACKAGE ─── */
async function savePackage() {
    var form = document.getElementById('pkgForm');
    if (!form) return;

    var name = getFormVal(form, 'name');
    var category = getFormVal(form, 'category');
    var price = getFormNum(form, 'price');

    $$('#pkgForm .form-group').forEach(function (g) { g.classList.remove('error'); });
    var hasError = false;
    if (!name) { form.elements['name'].closest('.form-group').classList.add('error'); hasError = true; }
    if (!category) { form.elements['category'].closest('.form-group').classList.add('error'); hasError = true; }
    if (!price) { form.elements['price'].closest('.form-group').classList.add('error'); hasError = true; }
    if (hasError) { toast('Please fill in all required fields', 'error'); return; }

    var data = {
        name: name,
        slug: slugify(name),
        category: category,
        duration: getFormVal(form, 'duration') || undefined,
        price: price,
        description: getFormVal(form, 'description') || undefined,
        image: getFormVal(form, 'image') || undefined,
        maxGroup: getFormNum(form, 'maxGroup') || undefined,
        status: getFormVal(form, 'status') || 'active',
        includes: state.packageIncludes.filter(function (x) { return x.trim(); })
    };

    var res;
    try {
        if (state.editingPackage) {
            res = await API.admin.updatePackage(state.editingPackage._id, data);
        } else {
            res = await API.admin.createPackage(data);
        }
    } catch (err) {
        toast('Server error saving package', 'error');
        return;
    }

    if (res.success) {
        toast(state.editingPackage ? 'Package updated!' : 'Package created!', 'success');
        closePackageModal();
        loadPackages();
    } else {
        toast(res.message || 'Failed to save package', 'error');
    }
}

/* ─── PACKAGE ACTIONS ─── */
async function togglePackageStatus(id) {
    try {
        var res = await API.admin.togglePackage(id);
        if (res.success) { toast('Package status toggled', 'success'); loadPackages(); }
        else { toast(res.message || 'Failed to toggle', 'error'); }
    } catch (err) { toast('Server error', 'error'); }
}

function confirmDeletePackage(id, name) {
    openConfirmModal(
        'Delete Package',
        'Are you sure you want to delete <strong>' + escAttr(name) + '</strong>? This action cannot be undone.',
        async function () {
            try {
                var res = await API.admin.deletePackage(id);
                if (res.success) { toast('Package deleted', 'success'); loadPackages(); }
                else { toast(res.message || 'Failed to delete', 'error'); }
            } catch (err) { toast('Server error', 'error'); }
            closeConfirmModal();
        }
    );
}



/* ═══════════════════════════
   BOOKINGS MODAL + CRUD
════════════════════════════ */

// ── Add this modal HTML to your page (or inject it) ──
function injectBookingModal() {
    if (document.getElementById('bookingModal')) return;
    var div = document.createElement('div');
    div.id = 'bookingModal';
    div.className = 'modal-overlay';
    div.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;justify-content:center;align-items:center;padding:20px;';
    div.innerHTML = `
        <div class="modal-box" style="background:#fff;border-radius:12px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <button onclick="closeBookingModal()" style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:24px;cursor:pointer;color:#666;line-height:1;">&times;</button>
            <div id="bookingModalContent" style="padding:32px;"></div>
        </div>
    `;
    document.body.appendChild(div);

    // Close on overlay click
    div.addEventListener('click', function(e) {
        if (e.target === div) closeBookingModal();
    });
}

function openBookingModal() {
    var m = document.getElementById('bookingModal');
    if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeBookingModal() {
    var m = document.getElementById('bookingModal');
    if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
}

// ── LOAD BOOKINGS ──
async function loadBookings() {
    try {
        var search = (document.getElementById('bSearch') || {}).value || '';
        var status = (document.getElementById('bStatusFilter') || {}).value || '';

        var params = 'limit=100';
        if (search) params += '&search=' + encodeURIComponent(search);
        if (status) params += '&status=' + encodeURIComponent(status);

        var res = await API.admin.getBookings(params);
        if (res.success) {
            state.bookings = res.data || [];
            renderBookings();
        } else {
            toast(res.message || 'Failed to load bookings', 'error');
        }
    } catch (err) {
        toast('Server error loading bookings', 'error');
    }
}

// ── RENDER TABLE ──
function renderBookings() {
    var tbody = document.getElementById('bookingsBody');
    if (!tbody) return;

    if (state.bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--medium-gray)">No bookings found</td></tr>';
        return;
    }

    var statusColors = {
        'pending': 'badge-orange',
        'confirmed': 'badge-blue',
        'in-progress': 'badge-maroon',
        'completed': 'badge-green',
        'cancelled': 'badge-red'
    };

    tbody.innerHTML = state.bookings.map(function (b) {
        return '<tr>' +
            '<td><code style="font-size:11px">' + escAttr(b.bookingId || '—') + '</code></td>' +
            '<td><strong>' + escAttr(b.fullName || b.name || '—') + '</strong><br><span style="font-size:11px;color:var(--medium-gray)">' + escAttr(b.email || '') + '</span></td>' +
            '<td>' + escAttr(b.type === 'vehicle' ? (b.vehicleName || 'Vehicle') : (b.packageName || 'Package')) + '</td>' +
            '<td style="white-space:nowrap">' + formatDate(b.travelDate || b.createdAt) + '</td>' +
            '<td><strong>' + formatCurrency(b.totalPrice) + '</strong></td>' +
            '<td><span class="badge ' + (statusColors[b.status] || 'badge-gray') + '">' + escAttr(b.status || '—') + '</span></td>' +
            '<td>' +
                '<button class="btn btn-sm btn-secondary" data-action="view-booking" data-id="' + b._id + '">View</button> ' +
                '<button class="btn btn-sm btn-danger" data-action="delete-booking" data-id="' + b._id + '" title="Delete">&times;</button>' +
            '</td>' +
            '</tr>';
    }).join('');
}

// ── VIEW BOOKING — Opens proper modal ──
async function viewBooking(id) {
    injectBookingModal();

    var content = document.getElementById('bookingModalContent');
    content.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">Loading...</div>';
    openBookingModal();

    try {
        var res = await API.admin.getBooking(id);
        if (!res.success) {
            content.innerHTML = '<div style="text-align:center;padding:40px;color:red;">Failed to load booking</div>';
            return;
        }
        renderBookingDetail(res.data);
    } catch (err) {
        content.innerHTML = '<div style="text-align:center;padding:40px;color:red;">Server error</div>';
    }
}

// ── RENDER BOOKING DETAIL INSIDE MODAL ──
function renderBookingDetail(b) {
    var content = document.getElementById('bookingModalContent');
    if (!content) return;

    var statusColors = {
        'pending': '#e67e22', 'confirmed': '#2980b9', 'in-progress': '#800000',
        'completed': '#27ae60', 'cancelled': '#c0392b'
    };

    var allStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

    var statusOptions = allStatuses.map(function(s) {
        return '<option value="' + s + '"' + (b.status === s ? ' selected' : '') + '>' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>';
    }).join('');

    // Build detail rows
    function row(label, value) {
        return '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;">' +
            '<span style="color:#888;font-size:13px;">' + label + '</span>' +
            '<span style="font-weight:600;font-size:14px;text-align:right;max-width:60%;">' + (value || '—') + '</span>' +
            '</div>';
    }

    var html = '';
    // Header
    html += '<div style="margin-bottom:24px;">';
    html += '<h2 style="margin:0 0 4px 0;font-size:22px;">Booking Details</h2>';
    html += '<code style="font-size:13px;color:#888;">' + escAttr(b.bookingId || b._id) + '</code>';
    html += '</div>';

    // Status bar
    html += '<div style="background:#f8f8f8;border-radius:8px;padding:16px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<span style="width:12px;height:12px;border-radius:50%;background:' + (statusColors[b.status] || '#999') + ';display:inline-block;"></span>';
    html += '<span style="font-weight:700;font-size:15px;text-transform:capitalize;color:' + (statusColors[b.status] || '#999') + ';">' + escAttr(b.status) + '</span>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<label style="font-size:13px;color:#666;">Change:</label>';
    html += '<select id="modalStatusSelect" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;cursor:pointer;">' + statusOptions + '</select>';
    html += '<button onclick="updateBookingStatus(\'' + b._id + '\')" class="btn btn-sm" style="background:var(--maroon);color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;">Update</button>';
    html += '</div>';
    html += '</div>';

    // Customer Info
    html += '<h3 style="font-size:15px;color:var(--maroon);margin:0 0 8px 0;text-transform:uppercase;letter-spacing:1px;">Customer Info</h3>';
    html += row('Full Name', escAttr(b.fullName || b.name));
    html += row('Email', escAttr(b.email));
    html += row('Phone', escAttr(b.phone));
    html += row('Address', escAttr(b.address || b.pickupLocation || ''));

    // Booking Info
    html += '<h3 style="font-size:15px;color:var(--maroon);margin:20px 0 8px 0;text-transform:uppercase;letter-spacing:1px;">Booking Info</h3>';
    html += row('Type', (b.type || '—').charAt(0).toUpperCase() + (b.type || '—').slice(1));
    html += row(b.type === 'vehicle' ? 'Vehicle' : 'Package', escAttr(b.vehicleName || b.packageName || '—'));
    if (b.vehicleName) html += row('Vehicle Type', escAttr(b.vehicleType || '—'));
    html += row('Travel Date', formatDate(b.travelDate));
    html += row('Return Date', b.returnDate ? formatDate(b.returnDate) : '—');
    html += row('Guests / Passengers', b.guests || b.passengers || '—');
    html += row('Created', formatDate(b.createdAt));

    // Pricing
    html += '<h3 style="font-size:15px;color:var(--maroon);margin:20px 0 8px 0;text-transform:uppercase;letter-spacing:1px;">Pricing</h3>';
    html += row('Base Price', formatCurrency(b.basePrice || b.price));
    if (b.extraCharges) html += row('Extra Charges', formatCurrency(b.extraCharges));
    if (b.discount) html += row('Discount', '-' + formatCurrency(b.discount));
    if (b.tax) html += row('Tax', formatCurrency(b.tax));
    html += '<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:2px solid var(--maroon);">';
    html += '<span style="font-weight:700;font-size:16px;">Total</span>';
    html += '<span style="font-weight:700;font-size:18px;color:var(--maroon);">' + formatCurrency(b.totalPrice) + '</span>';
    html += '</div>';

    // Special Requests
    if (b.specialRequests || b.notes) {
        html += '<h3 style="font-size:15px;color:var(--maroon);margin:20px 0 8px 0;text-transform:uppercase;letter-spacing:1px;">Notes</h3>';
        html += '<p style="background:#f8f8f8;padding:12px;border-radius:6px;font-size:13px;color:#555;">' + escAttr(b.specialRequests || b.notes) + '</p>';
    }

    // Payment Info
    if (b.paymentStatus || b.paymentMethod) {
        html += '<h3 style="font-size:15px;color:var(--maroon);margin:20px 0 8px 0;text-transform:uppercase;letter-spacing:1px;">Payment</h3>';
        html += row('Method', escAttr(b.paymentMethod || '—'));
        var payColor = b.paymentStatus === 'paid' ? '#27ae60' : '#e67e22';
        html += row('Status', '<span style="color:' + payColor + ';font-weight:700;text-transform:capitalize;">' + escAttr(b.paymentStatus || 'pending') + '</span>');
    }

    // Action Buttons
    html += '<div style="margin-top:28px;display:flex;gap:10px;flex-wrap:wrap;">';

    // Quick status buttons
    if (b.status === 'pending') {
        html += '<button onclick="updateBookingStatus(\'' + b._id + '\', \'confirmed\')" class="btn" style="background:#2980b9;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">✓ Confirm</button>';
    }
    if (b.status === 'confirmed') {
        html += '<button onclick="updateBookingStatus(\'' + b._id + '\', \'in-progress\')" class="btn" style="background:var(--maroon);color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">▶ Start Trip</button>';
    }
    if (b.status === 'in-progress') {
        html += '<button onclick="updateBookingStatus(\'' + b._id + '\', \'completed\')" class="btn" style="background:#27ae60;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">✔ Complete</button>';
    }
    if (b.status !== 'cancelled' && b.status !== 'completed') {
        html += '<button onclick="updateBookingStatus(\'' + b._id + '\', \'cancelled\')" class="btn" style="background:#c0392b;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">✕ Cancel</button>';
    }

    // Delete button
    html += '<button onclick="deleteBooking(\'' + b._id + '\')" class="btn" style="background:#fff;color:#c0392b;border:2px solid #c0392b;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;margin-left:auto;">🗑 Delete</button>';
    html += '</div>';

    content.innerHTML = html;
}

// ── UPDATE BOOKING STATUS ──
async function updateBookingStatus(id, forceStatus) {
    var newStatus = forceStatus;
    if (!newStatus) {
        var sel = document.getElementById('modalStatusSelect');
        newStatus = sel ? sel.value : null;
    }
    if (!newStatus) { toast('Select a status', 'error'); return; }

    try {
        var res = await API.admin.updateBooking(id, { status: newStatus });
        if (res.success) {
            toast('Status updated to ' + newStatus, 'success');
            // Re-fetch and re-render inside modal
            var detail = await API.admin.getBooking(id);
            if (detail.success) renderBookingDetail(detail.data);
            // Also refresh table
            loadBookings();
        } else {
            toast(res.message || 'Failed to update status', 'error');
        }
    } catch (err) {
        toast('Server error updating status', 'error');
    }
}

// ── DELETE BOOKING ──
async function deleteBooking(id) {
    // Confirm before delete
    if (!confirm('Are you sure you want to permanently delete this booking?')) return;

    try {
        var res = await API.admin.deleteBooking(id);
        if (res.success) {
            toast('Booking deleted', 'success');
            closeBookingModal();
            loadBookings();
        } else {
            toast(res.message || 'Failed to delete booking', 'error');
        }
    } catch (err) {
        toast('Server error deleting booking', 'error');
    }
}

// ── DELEGATION: Wire up table buttons ──
// Add this inside your main event delegation (the big switch/case or if/else block)
// Example inside your document click handler:
//
//   else if (action === 'view-booking') {
//       viewBooking(id);
//   }
//   else if (action === 'delete-booking') {
//       deleteBooking(id);
//   }



/* ═══════════════════════════
   SETTINGS & PROFILE
════════════════════════════ */
function saveSettings() {
    toast('Settings saved successfully!', 'success');
}

function saveProfile() {
    toast('Profile saved successfully!', 'success');
}

function changePassword() {
    var current = document.getElementById('currentPassword');
    var newPwd = document.getElementById('newPassword');
    var confirm = document.getElementById('confirmPassword');
    if (!current || !current.value) { toast('Current password is required', 'error'); return; }
    if (!newPwd || !newPwd.value) { toast('New password is required', 'error'); return; }
    if (!confirm || newPwd.value !== confirm.value) { toast('Passwords do not match', 'error'); return; }
    toast('Password changed successfully!', 'success');
    if (current) current.value = '';
    if (newPwd) newPwd.value = '';
    if (confirm) confirm.value = '';
}

/* ═══════════════════════════
   CONFIRM MODAL
════════════════════════════ */
var confirmCallback = null;

function openConfirmModal(title, text, onConfirm) {
    confirmCallback = onConfirm;
    var modal = document.getElementById('confirmModal');
    if (!modal) return;
    var h3 = modal.querySelector('h3');
    var p = document.getElementById('confirmText');
    if (h3) h3.textContent = title;
    if (p) p.innerHTML = text;
    modal.classList.add('active');
}

function closeConfirmModal() {
    var modal = document.getElementById('confirmModal');
    if (modal) modal.classList.remove('active');
    confirmCallback = null;
}

async function executeConfirm() {
    if (confirmCallback) await confirmCallback();
}

/* ═══════════════════════════
   UTILITY HELPERS
════════════════════════════ */
function detailRow(label, value) {
    return '<div class="detail-row"><span class="detail-label">' + label + '</span><span class="detail-value">' + value + '</span></div>';
}

function specItem(emoji, label, value) {
    return '<div class="panel-spec-item"><span>' + emoji + '</span><span>' + label + ': <strong>' + (value || '—') + '</strong></span></div>';
}

/* ═══════════════════════════
   HEADER CLOCK
════════════════════════════ */
function updateClock() {
    var el = document.getElementById('headerTime');
    if (el) {
        var now = new Date();
        el.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

/* ═══════════════════════════
   LOGOUT
════════════════════════════ */
function logout() {
    if (window.API && window.API.clearToken) { API.clearToken(); }
    localStorage.removeItem('voyago_token');
    sessionStorage.removeItem('voyago_token');
    window.location.href = '/admin';
}

/* ═══════════════════════════
   EVENT DELEGATION & INIT
════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

    /* ── Sidebar nav clicks ── */
    $$('.nav-item').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (btn.dataset.section) navigateTo(btn.dataset.section);
        });
    });

    /* ── Sidebar mobile ── */
    var hamburger = document.getElementById('hamburger');
    if (hamburger) hamburger.addEventListener('click', openSidebar);
    var sidebarClose = document.getElementById('sidebarClose');
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    var sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    /* ── Vehicle filters (debounced) ── */
    var vSearchTimer = null;
    var vSearch = document.getElementById('vSearch');
    if (vSearch) vSearch.addEventListener('input', function () {
        clearTimeout(vSearchTimer);
        vSearchTimer = setTimeout(loadVehicles, 350);
    });
    var vTypeFilter = document.getElementById('vTypeFilter');
    if (vTypeFilter) vTypeFilter.addEventListener('change', loadVehicles);
    var vStatusFilter = document.getElementById('vStatusFilter');
    if (vStatusFilter) vStatusFilter.addEventListener('change', loadVehicles);

    /* ── Package filters (debounced) ── */
    var pSearchTimer = null;
    var pSearch = document.getElementById('pSearch');
    if (pSearch) pSearch.addEventListener('input', function () {
        clearTimeout(pSearchTimer);
        pSearchTimer = setTimeout(loadPackages, 350);
    });
    var pCatFilter = document.getElementById('pCatFilter');
    if (pCatFilter) pCatFilter.addEventListener('change', loadPackages);

    /* ── Booking filters (debounced) ── */
    var bSearchTimer = null;
    var bSearch = document.getElementById('bSearch');
    if (bSearch) bSearch.addEventListener('input', function () {
        clearTimeout(bSearchTimer);
        bSearchTimer = setTimeout(loadBookings, 350);
    });
    var bStatusFilter = document.getElementById('bStatusFilter');
    if (bStatusFilter) bStatusFilter.addEventListener('change', loadBookings);

    /* ── Add Vehicle button ── */
    var addVehicleBtn = document.getElementById('addVehicleBtn');
    if (addVehicleBtn) addVehicleBtn.addEventListener('click', function () { openVehicleModal(); });

    /* ── Add Package button ── */
    var addPkgBtn = document.getElementById('addPkgBtn');
    if (addPkgBtn) addPkgBtn.addEventListener('click', function () { openPackageModal(); });

    /* ── Vehicle Modal buttons ── */
    var vehicleModalClose = document.getElementById('vehicleModalClose');
    if (vehicleModalClose) vehicleModalClose.addEventListener('click', closeVehicleModal);
    var vehicleModalCancel = document.getElementById('vehicleModalCancel');
    if (vehicleModalCancel) vehicleModalCancel.addEventListener('click', closeVehicleModal);
    var vehicleModalSave = document.getElementById('vehicleModalSave');
    if (vehicleModalSave) vehicleModalSave.addEventListener('click', saveVehicle);

    /* ── Vehicle Form Tabs ── */
    var vFormTabs = document.getElementById('vFormTabs');
    if (vFormTabs) {
        vFormTabs.addEventListener('click', function (e) {
            var btn = e.target.closest('.form-tab-btn');
            if (btn && btn.dataset.tab) switchVehicleTab(btn.dataset.tab);
        });
    }

    /* ── Vehicle: Add Image / Route buttons ── */
    var addImgBtn = document.getElementById('addImgBtn');
    if (addImgBtn) addImgBtn.addEventListener('click', addVehicleImage);
    var addRouteBtn = document.getElementById('addRouteBtn');
    if (addRouteBtn) addRouteBtn.addEventListener('click', addVehicleRoute);

    /* ── Package Modal buttons ── */
    var pkgModalClose = document.getElementById('pkgModalClose');
    if (pkgModalClose) pkgModalClose.addEventListener('click', closePackageModal);
    var pkgModalCancel = document.getElementById('pkgModalCancel');
    if (pkgModalCancel) pkgModalCancel.addEventListener('click', closePackageModal);
    var pkgModalSave = document.getElementById('pkgModalSave');
    if (pkgModalSave) pkgModalSave.addEventListener('click', savePackage);

    /* ── Package: Add Include button ── */
    var addIncludeBtn = document.getElementById('addIncludeBtn');
    if (addIncludeBtn) addIncludeBtn.addEventListener('click', addPackageInclude);

    /* ── Panel close ── */
    var panelClose = document.getElementById('panelClose');
    if (panelClose) panelClose.addEventListener('click', closeVehiclePanel);
    var panelOverlay = document.getElementById('panelOverlay');
    if (panelOverlay) panelOverlay.addEventListener('click', closeVehiclePanel);

    /* ── Confirm modal buttons ── */
    var confirmCancelBtn = document.getElementById('confirmCancel');
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', closeConfirmModal);
    var confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', executeConfirm);

    /* ═══════════════════════════
       EVENT DELEGATION for dynamic content
       (vehicle cards, package cards, images, routes, features, includes, panel thumbs)
    ═══════════════════════════ */

    document.addEventListener('click', function (e) {
        var target = e.target;

        /* ── Vehicle grid card actions ── */
        var vAction = target.closest('[data-action]');
        if (vAction) {
            var action = vAction.dataset.action;
            var id = vAction.dataset.id;
            if (action === 'view-vehicle') viewVehicle(id);
            else if (action === 'edit-vehicle') editVehicle(id);
            else if (action === 'toggle-vehicle') toggleVehicle(id);
            else if (action === 'delete-vehicle') confirmDeleteVehicle(id, vAction.dataset.name);
            else if (action === 'edit-package') {
                (async function () {
                    try {
                        var res = await API.admin.getPackage(id);
                        if (res.success) openPackageModal(res.data);
                        else toast('Failed to load package', 'error');
                    } catch (err) { toast('Server error', 'error'); }
                })();
            }
            else if (action === 'toggle-package') togglePackageStatus(id);
            else if (action === 'delete-package') confirmDeletePackage(id, vAction.dataset.name);
            else if (action === 'view-booking') viewBooking(id);
            return;
        }

        /* ── Remove image button ── */
        var removeImgBtn = target.closest('[data-remove-img]');
        if (removeImgBtn) {
            removeVehicleImage(parseInt(removeImgBtn.dataset.removeImg, 10));
            return;
        }

        /* ── Remove route button ── */
        var removeRouteBtn = target.closest('[data-remove-route]');
        if (removeRouteBtn) {
            removeVehicleRoute(parseInt(removeRouteBtn.dataset.removeRoute, 10));
            return;
        }

        /* ── Remove include button ── */
        var removeIncBtn = target.closest('[data-remove-include]');
        if (removeIncBtn) {
            removePackageInclude(parseInt(removeIncBtn.dataset.removeInclude, 10));
            return;
        }

        /* ── Feature toggle ── */
        var featLabel = target.closest('[data-feature]');
        if (featLabel) {
            toggleFeature(featLabel, featLabel.dataset.feature);
            return;
        }

        /* ── Panel thumbnail click ── */
        var thumb = target.closest('[data-panel-thumb]');
        if (thumb) {
            switchVPanelImg(thumb, thumb.dataset.panelThumb);
            return;
        }
    });

    /* ── Delegated change events for dynamic inputs ── */
    document.addEventListener('change', function (e) {
        var target = e.target;

        if (target.dataset.imgIdx !== undefined) {
            updateVehicleImage(parseInt(target.dataset.imgIdx, 10), target.value);
        }
        if (target.dataset.routeIdx !== undefined) {
            updateVehicleRoute(parseInt(target.dataset.routeIdx, 10), target.value);
        }
        if (target.dataset.includeIdx !== undefined) {
            updatePackageInclude(parseInt(target.dataset.includeIdx, 10), target.value);
        }
    });

    /* ── Close modals on backdrop click ── */
    ['vehicleModal', 'pkgModal', 'confirmModal'].forEach(function (modalId) {
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    if (modalId === 'vehicleModal') closeVehicleModal();
                    else if (modalId === 'pkgModal') closePackageModal();
                    else if (modalId === 'confirmModal') closeConfirmModal();
                }
            });
        }
    });

    /* ── Keyboard: Escape to close ── */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeVehicleModal();
            closePackageModal();
            closeConfirmModal();
            closeVehiclePanel();
        }
    });

    /* ── Clock ── */
    updateClock();
    setInterval(updateClock, 1000);

    /* ── Auth & Initial Load ── */
    (async function init() {
        await loadAdminProfile();
        navigateTo('dashboard');
    })();
});