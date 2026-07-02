/* ═══════════════════════════════════════════════════════════════
   VOYAGO — Admin Dashboard Controller (IMPROVED)
   Better: Auth flow, error handling, debugging
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
    return '₹' + Number(n).toLocaleString('en-IN');
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
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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
    console.log('📍 Navigating to:', section);
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

var adminProfileLoaded = false;

async function loadAdminProfile() {
    if (adminProfileLoaded) {
        console.log('✅ Admin profile already loaded');
        return true;
    }

    console.log('👤 Loading admin profile...');
    var token = getToken();

    if (!token) {
        console.error('❌ No token found');
        logout();
        return false;
    }

    try {
        var data = await API.admin.getMe();

        console.log('👤 Profile response:', data);

        if (!data || !data.success || !data.admin) {
            console.error('❌ Failed to load admin profile:', data);
            logout();
            return false;
        }

        state.admin = data.admin;
        adminProfileLoaded = true;

        var nameEl = document.querySelector('.sidebar-user-name');
        if (nameEl) {
            nameEl.textContent = data.admin.name || 'Admin';
        }

        return true;
    } catch (err) {
        console.error('❌ Admin profile error:', err);
        logout();
        return false;
    }
}

/* ═══════════════════════════
   DASHBOARD
════════════════════════════ */
async function loadDashboard() {
    console.log('📊 Loading dashboard...');
    try {
        if (API.admin && API.admin.getDashboard) {
            var res = await API.admin.getDashboard();
            if (res && res.success) {
                renderDashboardStats(res.data || res.stats || {});
                return;
            }
        }
    } catch (e) { console.error('Dashboard API error:', e); }

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
        console.error('❌ Dashboard load error:', err);
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
   VEHICLES (Summary)
════════════════════════════ */
async function loadVehicles() {
    console.log('🚗 Loading vehicles...');
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
        console.error('❌ Vehicle load error:', err);
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

/* Additional vehicle management functions (abbreviated for brevity - include rest from original file) */

/* ═══════════════════════════
   PACKAGES (Summary)
════════════════════════════ */
async function loadPackages() {
    console.log('📦 Loading packages...');
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
        console.error('❌ Package load error:', err);
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
        luxury: 'badge-gold', pilgrimage: 'badge-maroon', other: 'badge-gray'
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

/* ═══════════════════════════
   BOOKINGS
════════════════════════════ */
async function loadBookings() {
    console.log('📅 Loading bookings...');
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
        console.error('❌ Booking load error:', err);
        toast('Server error loading bookings', 'error');
    }
}

function renderBookings() {
    var tbody = document.getElementById('bookingsBody');
    if (!tbody) return;

    if (state.bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--medium-gray)">No bookings found</td></tr>';
        return;
    }

    var statusColors = {
        pending: 'badge-orange', confirmed: 'badge-blue', 'in-progress': 'badge-maroon',
        completed: 'badge-green', cancelled: 'badge-red'
    };

    tbody.innerHTML = state.bookings.map(function (b) {
        return '<tr>' +
            '<td><code style="font-size:11px">' + escAttr(b.bookingId || '—') + '</code></td>' +
            '<td><strong>' + escAttr(b.fullName || b.name || '—') + '</strong><br><span style="font-size:11px;color:var(--medium-gray)">' + escAttr(b.email || '') + '</span></td>' +
            '<td>' + escAttr(b.type === 'vehicle' ? (b.vehicleName || 'Vehicle') : (b.packageName || 'Package')) + '</td>' +
            '<td style="white-space:nowrap">' + formatDate(b.travelDate || b.createdAt) + '</td>' +
            '<td><strong>' + formatCurrency(b.totalPrice) + '</strong></td>' +
            '<td><span class="badge ' + (statusColors[b.status] || 'badge-gray') + '">' + escAttr(b.status) + '</span></td>' +
            '<td><button class="btn btn-sm btn-secondary" data-action="view-booking" data-id="' + b._id + '">View</button></td>' +
            '</tr>';
    }).join('');
}

async function viewBooking(id) {
    try {
        var res = await API.admin.getBooking(id);
        if (!res.success) { toast('Failed to load booking', 'error'); return; }
        var b = res.data;
        alert(
            'Booking: ' + (b.bookingId || '—') + '\n' +
            'Customer: ' + (b.fullName || b.name || '—') + '\n' +
            'Email: ' + (b.email || '—') + '\n' +
            'Phone: ' + (b.phone || '—') + '\n' +
            'Type: ' + (b.type || '—') + '\n' +
            'Status: ' + (b.status || '—') + '\n' +
            'Total: ' + formatCurrency(b.totalPrice) + '\n' +
            'Date: ' + formatDate(b.createdAt)
        );
    } catch (err) { toast('Server error', 'error'); }
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
    console.log('🚪 Logging out...');
    if (window.API && typeof window.API.clearToken === 'function') {
        window.API.clearToken();
    }
    window.location.replace('/admin');
}

/* ═══════════════════════════
   EVENT DELEGATION & INIT
════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎬 Dashboard initializing...');

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

    /* ── Clock ── */
    updateClock();
    setInterval(updateClock, 1000);

    /* ── Auth & Initial Load ── */
    (async function init() {
        console.log('🔐 Starting authentication flow...');
        const ok = await loadAdminProfile();
        if (!ok) {
            console.error('❌ Auth failed - redirecting to login');
            return;
        }
        console.log('✅ Auth successful - loading dashboard');
        navigateTo('dashboard');
    })();
});

console.log('✅ Dashboard module loaded');



