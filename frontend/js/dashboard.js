/* ═══════════════════════════════════════════════════════════════
   ATAT — Admin Dashboard Controller (CORRECTED & IMPROVED)
   Matches: admin-dashboard.html
   Depends: /js/api.js, Chart.js (CDN)
════════════════════════════════════════════════════════════════ */
'use strict';

window.API = window.API || {};

/* ───────────────────────────
   STATE MANAGEMENT
─────────────────────────── */
const state = {
    currentSection: 'dashboard',
    admin: null,
    vehicles: [],
    packages: [],
    bookings: [],
    contacts: [],
    editingVehicle: null,
    editingPackage: null,
    vehicleImages: [],
    vehicleRoutes: [],
    packageIncludes: [],
    charts: { line: null, doughnut: null }
};

let confirmCallback = null;

/* ───────────────────────────
   UTILITY FUNCTIONS
─────────────────────────── */
const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

function slugify(str) {
    return String(str).toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function getImageUrl(imagePath) {
    if (!imagePath || imagePath === 'undefined' || imagePath.trim() === '') {
        return '/images/no-image.jpg';
    }
    if (typeof imagePath !== 'string') return '/images/no-image.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    if (imagePath.startsWith('/')) return imagePath;
    return '/' + imagePath;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeText(value) {
    return value ? escapeHtml(String(value)) : '—';
}

function formatCurrency(num) {
    if (num === null || num === undefined || num === '') return '—';
    const n = Number(num);
    if (Number.isNaN(n)) return '—';
    return '₹' + n.toLocaleString('en-IN');
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return '—';
    }
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    return formatDate(dateStr);
}

function debounce(fn, ms) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
}

/* ───────────────────────────
   TOAST NOTIFICATIONS
─────────────────────────── */
function toast(message, type = 'success') {
    let toastBox = $('#toastBox');
    if (!toastBox) {
        toastBox = document.createElement('div');
        toastBox.id = 'toastBox';
        document.body.appendChild(toastBox);
    }

    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
        <span style="font-size:16px;font-weight:700">${icons[type] || 'ℹ'}</span>
        <span style="flex:1">${escapeHtml(message)}</span>
        <button class="toast-close">×</button>
    `;

    el.querySelector('.toast-close').addEventListener('click', () => el.remove());
    toastBox.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

/* ───────────────────────────
   SIDEBAR & NAVIGATION
─────────────────────────── */
function openSidebar() {
    $('#sidebarOverlay')?.classList.add('active');
    $('#sidebar')?.classList.add('open');
}

function closeSidebar() {
    $('#sidebarOverlay')?.classList.remove('active');
    $('#sidebar')?.classList.remove('open');
}

function navigateTo(section) {
    state.currentSection = section;

    $$('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });

    $$('.section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `sec-${section}`);
    });

    const titles = {
        dashboard: 'Dashboard',
        vehicles: 'Vehicles',
        packages: 'Packages',
        bookings: 'Bookings',
        contacts: 'Contacts',
        settings: 'Settings',
        profile: 'Profile'
    };

    const headerTitle = $('#headerTitle');
    if (headerTitle) headerTitle.textContent = titles[section] || 'Dashboard';

    // Load data for section
    if (section === 'dashboard') loadDashboard();
    if (section === 'vehicles') loadVehicles();
    if (section === 'packages') loadPackages();
    if (section === 'bookings') loadBookings();
    if (section === 'contacts') loadContacts();

    closeSidebar();
}

/* ───────────────────────────
   AUTHENTICATION
─────────────────────────── */
const API_BASE = window.location.origin + '/api';

function getToken() {
    return localStorage.getItem('voyago_token') || sessionStorage.getItem('voyago_token');
}

function logout() {
    localStorage.removeItem('voyago_token');
    sessionStorage.removeItem('voyago_token');
    window.location.replace('/admin');
}

let adminProfileLoaded = false;

async function loadAdminProfile() {
    if (adminProfileLoaded) return;
    adminProfileLoaded = true;

    const token = getToken();
    if (!token) {
        window.location.replace('/admin');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!data?.success || !data?.admin) {
            logout();
            return;
        }

        state.admin = data.admin;
        const nameEl = $('.sidebar-user-name');
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
    confirmCallback = onConfirm;
    const modal = $('#confirmModal');
    if (!modal) return;

    const h3 = modal.querySelector('h3');
    if (h3) h3.textContent = title;

    const txt = $('#confirmText');
    if (txt) txt.innerHTML = message;

    modal.classList.add('active');
}

function closeConfirmModal() {
    const modal = $('#confirmModal');
    if (modal) modal.classList.remove('active');
    confirmCallback = null;
}

/* ═══════════════════════════
   DASHBOARD
════════════════════════════ */
async function loadDashboard() {
    try {
        // Try dedicated dashboard endpoint first
        if (API.admin?.getDashboard) {
            const res = await API.admin.getDashboard();
            if (res.success) {
                renderDashboardStats(res.data);
                renderDashboardCharts(res.data);
                return;
            }
        }

        // Fallback: calculate from individual endpoints
        const [vehiclesRes, packagesRes, bookingsRes] = await Promise.all([
            API.admin?.getVehicles?.('limit=100') || { data: [], total: 0 },
            API.admin?.getPackages?.('limit=100') || { data: [], total: 0 },
            API.admin?.getBookings?.('limit=100') || { data: [], total: 0 }
        ]);

        const vData = vehiclesRes.data || [];
        const pData = packagesRes.data || [];
        const bData = bookingsRes.data || [];

        const stats = {
            totalVehicles: vehiclesRes.total || vData.length,
            activeVehicles: vData.filter(v => v.isActive || v.status === 'active').length,
            totalPackages: packagesRes.total || pData.length,
            activePackages: pData.filter(p => p.isActive || p.status === 'active').length,
            totalBookings: bookingsRes.total || bData.length,
            pendingBookings: bData.filter(b => b.status === 'pending').length,
            totalRevenue: bData.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
        };

        renderDashboardStats(stats);
        renderDashboardCharts(stats);
    } catch (err) {
        console.error('Dashboard load error:', err);
        renderDashboardStats({});
    }
}

async function renderDashboardCharts(data) {
    const lineCanvas = $('#lineChart');
    const doughnutCanvas = $('#doughnutChart');

    if (!lineCanvas || !doughnutCanvas || typeof Chart === 'undefined') return;

    const maroon = '#6E1F2B';
    const gold = '#D9A441';

    // Destroy existing charts
    if (state.charts.doughnut) state.charts.doughnut.destroy();
    if (state.charts.line) state.charts.line.destroy();

    // Doughnut Chart
    state.charts.doughnut = new Chart(doughnutCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Vehicles', 'Packages', 'Bookings', 'Pending'],
            datasets: [{
                data: [
                    data.totalVehicles || 0,
                    data.totalPackages || 0,
                    data.totalBookings || 0,
                    data.pendingBookings || 0
                ],
                backgroundColor: [maroon, gold, '#0d0605', '#EDE5D8'],
                borderColor: '#fff',
                borderWidth: 3,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            cutout: '68%',
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Line Chart
    try {
        const bookingsRes = await API.admin?.getBookings?.('limit=500');
        const bookings = bookingsRes?.success ? (bookingsRes.data || []) : [];

        const monthsData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            monthsData.push({
                label: date.toLocaleDateString('en-US', { month: 'short' }),
                year: date.getFullYear(),
                month: date.getMonth(),
                confirmed: 0,
                cancelled: 0
            });
        }

        bookings.forEach(booking => {
            const bookingDate = new Date(booking.createdAt || booking.travelDate);
            if (Number.isNaN(bookingDate.getTime())) return;

            monthsData.forEach(m => {
                if (m.year === bookingDate.getFullYear() && m.month === bookingDate.getMonth()) {
                    if (booking.status === 'cancelled') {
                        m.cancelled++;
                    } else {
                        m.confirmed++;
                    }
                }
            });
        });

        state.charts.line = new Chart(lineCanvas, {
            type: 'line',
            data: {
                labels: monthsData.map(m => m.label),
                datasets: [
                    {
                        label: 'Confirmed',
                        data: monthsData.map(m => m.confirmed),
                        borderColor: maroon,
                        backgroundColor: 'rgba(110,31,43,0.12)',
                        borderWidth: 2.5,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3
                    },
                    {
                        label: 'Cancellations',
                        data: monthsData.map(m => m.cancelled),
                        borderColor: '#D32F2F',
                        backgroundColor: 'rgba(211,47,47,0.08)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 10, font: { size: 11 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    } catch (err) {
        console.error('Chart error:', err);
    }
}

function renderDashboardStats(data) {
    const statsGrid = $('#statsGrid');
    if (!statsGrid) return;

    const stats = [
        { label: 'Total Vehicles', value: data.totalVehicles || 0, icon: '🚗', color: 'maroon' },
        { label: 'Active Vehicles', value: data.activeVehicles || 0, icon: '✅', color: 'green' },
        { label: 'Total Packages', value: data.totalPackages || 0, icon: '📦', color: 'blue' },
        { label: 'Total Bookings', value: data.totalBookings || 0, icon: '📅', color: 'orange' },
        { label: 'Pending Bookings', value: data.pendingBookings || 0, icon: '⏳', color: 'gold' }
    ];

    statsGrid.innerHTML = stats.map(s => `
        <div class="stat-card">
            <div class="stat-top">
                <div class="stat-icon ${s.color}" style="font-size:20px">${s.icon}</div>
            </div>
            <div class="stat-label">${s.label}</div>
            <div class="stat-value">${s.value}</div>
        </div>
    `).join('');

    renderRevenueCard(data);
}

function renderRevenueCard(data) {
    const card = $('#revenueCard');
    if (!card) return;
    card.innerHTML = `
        <div class="revenue-icon">💰</div>
        <div class="revenue-info">
            <div class="revenue-label">Revenue</div>
            <div class="revenue-value">${formatCurrency(data.totalRevenue || 0)}</div>
            <div class="revenue-trend">↑ 18.6% from last month</div>
        </div>
    `;
}

/* ═══════════════════════════
   VEHICLES
════════════════════════════ */
async function loadVehicles() {
    try {
        const search = $('#vSearch')?.value || '';
        const type = $('#vTypeFilter')?.value || '';
        const status = $('#vStatusFilter')?.value || '';

        let params = 'limit=100';
        if (search) params += `&search=${encodeURIComponent(search)}`;
        if (type) params += `&type=${encodeURIComponent(type)}`;
        if (status) params += `&status=${encodeURIComponent(status)}`;

        const res = await API.admin.getVehicles(params);
        if (!res?.success) {
            toast(res?.message || 'Failed to load vehicles', 'error');
            return;
        }

        state.vehicles = res.data || [];
        renderVehicles();
    } catch (err) {
        console.error(err);
        toast('Server error loading vehicles', 'error');
    }
}

function isVehicleActive(vehicle) {
    return vehicle.isActive === true || vehicle.status === 'active';
}

function renderVehicles() {
    const grid = $('#vehiclesGrid');
    if (!grid) return;

    if (state.vehicles.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <h3>No Vehicles Found</h3>
                <p>Start by adding your first vehicle.</p>
                <button class="btn btn-primary" onclick="openVehicleModal()">+ Add Vehicle</button>
            </div>
        `;
        return;
    }

    const typeClasses = {
        'sedan': 'badge-blue', 'Sedan': 'badge-blue',
        'suv': 'badge-green', 'SUV': 'badge-green',
        'van': 'badge-orange', 'Van': 'badge-orange',
        'bus': 'badge-maroon', 'Bus': 'badge-maroon',
        'luxury': 'badge-gold', 'Luxury': 'badge-gold',
        'motorcycle': 'badge-gray', 'Motorcycle': 'badge-gray'
    };

    grid.innerHTML = state.vehicles.map(vehicle => {
        const imgUrl = getImageUrl(vehicle.image || vehicle.images?.[0] || '');
        const isActive = isVehicleActive(vehicle);
        const badgeClass = typeClasses[vehicle.type] || 'badge-gray';

        return `
            <div class="admin-v-card${isActive ? '' : ' disabled-card'}">
                <div class="admin-v-img">
                    <img src="${imgUrl}" alt="${escapeHtml(vehicle.name)}" 
                         loading="lazy" onerror="this.src='/images/no-image.jpg'">
                    <div class="admin-v-img-overlay"></div>
                    <span class="admin-v-badge badge ${badgeClass}">${escapeHtml(vehicle.type || 'Other')}</span>
                    <span class="admin-v-type">${escapeHtml(vehicle.brand || '')} ${escapeHtml(vehicle.model || '')}</span>
                    <span class="admin-v-status badge ${isActive ? 'badge-green' : 'badge-red'}">
                        ${isActive ? 'Active' : (vehicle.status === 'maintenance' ? 'Maintenance' : 'Disabled')}
                    </span>
                </div>
                <div class="admin-v-body">
                    <div class="admin-v-name">${escapeHtml(vehicle.name)}</div>
                    <div class="admin-v-slug">${escapeHtml(vehicle.slug || '')}</div>
                    <div class="admin-v-details">
                        <div class="admin-v-detail">Seats: <strong>${vehicle.seats || '—'}</strong></div>
                        <div class="admin-v-detail">Year: <strong>${vehicle.year || '—'}</strong></div>
                        <div class="admin-v-detail">Trans: <strong>${vehicle.transmission || '—'}</strong></div>
                        <div class="admin-v-detail">Fuel: <strong>${vehicle.fuelType || vehicle.fuel || '—'}</strong></div>
                    </div>
                    <div class="admin-v-price">${formatCurrency(vehicle.pricePerDay)} <span>/ day</span></div>
                    <div class="admin-v-actions">
                        <button class="btn btn-sm btn-secondary" onclick="viewVehicle('${vehicle._id}')">View</button>
                        <button class="btn btn-sm btn-primary" onclick="editVehicle('${vehicle._id}')">Edit</button>
                        <button class="btn btn-sm btn-ghost" onclick="toggleVehicle('${vehicle._id}')">
                            ${isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${vehicle._id}', '${escapeHtml(vehicle.name)}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/* ─── VEHICLE MODAL ─── */
function openVehicleModal(vehicle = null) {
    state.editingVehicle = vehicle || null;
    state.vehicleImages = vehicle ? [...(vehicle.images || [])] : [];
    state.vehicleRoutes = vehicle ? [...(vehicle.routes || [])] : [];

    const title = $('#vehicleModalTitle');
    if (title) title.textContent = vehicle ? 'Edit Vehicle' : 'Add Vehicle';

    const form = $('#vehicleForm');
    if (!form) return;

    form.reset();
    $$('#vehicleForm .form-group').forEach(g => g.classList.remove('error'));

    if (vehicle) {
        form.elements['name'].value = vehicle.name || '';
        form.elements['type'].value = vehicle.type || '';
        form.elements['brand'].value = vehicle.brand || '';
        form.elements['model'].value = vehicle.model || '';
        form.elements['year'].value = vehicle.year || '';
        form.elements['description'].value = vehicle.description || '';
        form.elements['seats'].value = vehicle.seats || '';
        form.elements['bags'].value = vehicle.bags || '';
        form.elements['fuelType'].value = vehicle.fuelType || vehicle.fuel || '';
        form.elements['transmission'].value = vehicle.transmission || '';
        form.elements['features'].value = (vehicle.features || []).join(', ');
        form.elements['pricePerDay'].value = vehicle.pricePerDay || '';
        form.elements['dailyRate'].value = vehicle.dailyRate || '';
        form.elements['pricePerKm'].value = vehicle.pricePerKm || '';
        form.elements['badge'].value = vehicle.badge || '';
        form.elements['badgeClass'].value = vehicle.badgeClass || '';
        form.elements['rating'].value = vehicle.rating || '';
        form.elements['totalTrips'].value = vehicle.totalTrips || '';
        form.elements['totalKmLakhs'].value = vehicle.totalKmLakhs || '';
        form.elements['ac'].value = vehicle.ac !== false ? 'true' : 'false';
        form.elements['status'].value = vehicle.status || (vehicle.isActive ? 'active' : 'disabled');
    }

    switchVehicleTab('vtab-basic');
    renderVehicleImages();
    renderVehicleRoutes();

    $('#vehicleModal')?.classList.add('active');
}

function closeVehicleModal() {
    $('#vehicleModal')?.classList.remove('active');
    state.editingVehicle = null;
}

function switchVehicleTab(tabId) {
    $$('#vFormTabs .form-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    $$('#vehicleForm .form-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === tabId);
    });
}

function renderVehicleImages() {
    const list = $('#imgList');
    if (!list) return;

    list.innerHTML = state.vehicleImages.map((url, i) => {
        const imgUrl = getImageUrl(url);
        return `
            <div class="img-list-item">
                <img src="${imgUrl}" alt="Vehicle" onerror="this.src='/images/no-image.jpg'">
                <input class="form-control" placeholder="Image URL" value="${escapeHtml(url)}" 
                       data-img-idx="${i}" onchange="state.vehicleImages[${i}] = this.value">
                <button class="remove-img" type="button" data-remove-img="${i}">×</button>
            </div>
        `;
    }).join('');

    $$('[data-remove-img]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.removeImg, 10);
            state.vehicleImages.splice(idx, 1);
            renderVehicleImages();
        });
    });
}

function addVehicleImage() {
    state.vehicleImages.push('');
    renderVehicleImages();
}

function renderVehicleRoutes() {
    const list = $('#routesList');
    if (!list) return;

    list.innerHTML = state.vehicleRoutes.map((route, i) => `
        <div class="route-item">
            <span class="route-emoji">📍</span>
            <input class="form-control" placeholder="Route (e.g. Colombo → Kandy)" value="${escapeHtml(route)}"
                   data-route-idx="${i}" onchange="state.vehicleRoutes[${i}] = this.value">
            <button class="remove-route" type="button" data-remove-route="${i}">×</button>
        </div>
    `).join('');

    $$('[data-remove-route]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.removeRoute, 10);
            state.vehicleRoutes.splice(idx, 1);
            renderVehicleRoutes();
        });
    });
}

function addVehicleRoute() {
    state.vehicleRoutes.push('');
    renderVehicleRoutes();
}

async function saveVehicle() {
    const form = $('#vehicleForm');
    if (!form) return;

    const name = form.elements['name']?.value.trim() || '';
    const type = form.elements['type']?.value.trim() || '';
    const brand = form.elements['brand']?.value.trim() || '';

    $$('#vehicleForm .form-group').forEach(g => g.classList.remove('error'));
    let hasError = false;

    if (!name) {
        form.elements['name'].closest('.form-group').classList.add('error');
        hasError = true;
    }
    if (!type) {
        form.elements['type'].closest('.form-group').classList.add('error');
        hasError = true;
    }
    if (!brand) {
        form.elements['brand'].closest('.form-group').classList.add('error');
        hasError = true;
    }

    if (hasError) {
        toast('Please fill in all required fields', 'error');
        return;
    }

    const featuresText = form.elements['features']?.value || '';
    const features = featuresText
        .split(',')
        .map(f => f.trim())
        .filter(f => f);

    const data = {
        name,
        type,
        brand,
        slug: slugify(name),
        model: form.elements['model']?.value.trim() || undefined,
        year: form.elements['year']?.value ? parseInt(form.elements['year'].value) : undefined,
        description: form.elements['description']?.value.trim() || undefined,
        seats: form.elements['seats']?.value ? parseInt(form.elements['seats'].value) : undefined,
        bags: form.elements['bags']?.value ? parseInt(form.elements['bags'].value) : undefined,
        fuelType: form.elements['fuelType']?.value.trim() || undefined,
        transmission: form.elements['transmission']?.value.trim() || undefined,
        pricePerDay: form.elements['pricePerDay']?.value ? parseFloat(form.elements['pricePerDay'].value) : undefined,
        dailyRate: form.elements['dailyRate']?.value ? parseFloat(form.elements['dailyRate'].value) : undefined,
        pricePerKm: form.elements['pricePerKm']?.value ? parseFloat(form.elements['pricePerKm'].value) : undefined,
        badge: form.elements['badge']?.value.trim() || undefined,
        badgeClass: form.elements['badgeClass']?.value.trim() || undefined,
        rating: form.elements['rating']?.value ? parseFloat(form.elements['rating'].value) : undefined,
        totalTrips: form.elements['totalTrips']?.value ? parseInt(form.elements['totalTrips'].value) : undefined,
        totalKmLakhs: form.elements['totalKmLakhs']?.value ? parseFloat(form.elements['totalKmLakhs'].value) : undefined,
        ac: form.elements['ac'].value === 'true',
        status: form.elements['status']?.value || 'active',
        images: state.vehicleImages.filter(u => u.trim() && u !== 'undefined'),
        features,
        routes: state.vehicleRoutes.filter(r => r.trim())
    };

    try {
        const res = state.editingVehicle
            ? await API.admin.updateVehicle(state.editingVehicle._id, data)
            : await API.admin.createVehicle(data);

        if (res.success) {
            toast(state.editingVehicle ? 'Vehicle updated!' : 'Vehicle created!', 'success');
            closeVehicleModal();
            loadVehicles();
        } else {
            toast(res.message || 'Failed to save vehicle', 'error');
        }
    } catch (err) {
        console.error(err);
        toast('Server error saving vehicle', 'error');
    }
}

async function viewVehicle(id) {
    try {
        const res = await API.admin.getVehicle(id);
        if (res.success) {
            openVehiclePanel(res.data);
        } else {
            toast('Failed to load vehicle', 'error');
        }
    } catch (err) {
        toast('Server error', 'error');
    }
}

async function editVehicle(id) {
    try {
        const res = await API.admin.getVehicle(id);
        if (res.success) {
            openVehicleModal(res.data);
        } else {
            toast('Failed to load vehicle', 'error');
        }
    } catch (err) {
        toast('Server error', 'error');
    }
}

async function toggleVehicle(id) {
    try {
        const res = await API.admin.toggleVehicle(id);
        if (res.success) {
            toast('Vehicle toggled', 'success');
            loadVehicles();
        } else {
            toast(res.message || 'Failed to toggle vehicle', 'error');
        }
    } catch (err) {
        toast('Server error', 'error');
    }
}

function deleteVehicle(id, name) {
    openConfirmModal(
        'Delete Vehicle',
        `Are you sure you want to delete <strong>${escapeHtml(name)}</strong>?`,
        async () => {
            try {
                const res = await API.admin.deleteVehicle(id);
                if (res.success) {
                    toast('Vehicle deleted', 'success');
                    loadVehicles();
                } else {
                    toast(res.message || 'Failed to delete', 'error');
                }
            } catch (err) {
                toast('Server error', 'error');
            }
            closeConfirmModal();
        }
    );
}

function openVehiclePanel(vehicle) {
    const panel = $('#vehiclePanel');
    const body = $('#panelBody');
    if (!panel || !body) return;

    const mainImg = getImageUrl(vehicle.image || vehicle.images?.[0] || '');
    const thumbs = (vehicle.images || []).slice(0, 10).map(img => getImageUrl(img));
    const isActive = isVehicleActive(vehicle);

    let html = '';

    if (mainImg && mainImg !== '/images/no-image.jpg') {
        html += `<img class="panel-img-main" src="${mainImg}" alt="${escapeHtml(vehicle.name)}" onerror="this.src='/images/no-image.jpg'">`;
    }

    if (thumbs.length > 1) {
        html += '<div class="panel-img-thumbs">' + thumbs.map((img, i) => `
            <img src="${img}" alt="Thumb" ${i === 0 ? 'class="active"' : ''} 
                 data-panel-thumb="${img}" onclick="switchPanelImage(this)" onerror="this.src='/images/no-image.jpg'">
        `).join('') + '</div>';
    }

    html += `
        <div class="detail-section-title">Vehicle Info</div>
        <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value">${escapeHtml(vehicle.name)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Slug</span>
            <span class="detail-value"><code>${escapeHtml(vehicle.slug || '')}</code></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Type</span>
            <span class="detail-value">${escapeHtml(vehicle.type)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Brand</span>
            <span class="detail-value">${escapeHtml(vehicle.brand || '—')}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Model</span>
            <span class="detail-value">${escapeHtml(vehicle.model || '—')}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value">
                <span class="badge ${isActive ? 'badge-green' : 'badge-red'}">
                    ${isActive ? 'Active' : (vehicle.status || 'Disabled')}
                </span>
            </span>
        </div>
        <div class="detail-section-title">Specifications</div>
        <div class="panel-specs-grid">
            <div class="panel-spec-item"><span class="panel-spec-icon">👤</span><span class="panel-spec-label">Seats</span><span class="panel-spec-value">${vehicle.seats || '—'}</span></div>
            <div class="panel-spec-item"><span class="panel-spec-icon">💿</span><span class="panel-spec-label">Bags</span><span class="panel-spec-value">${vehicle.bags || '—'}</span></div>
            <div class="panel-spec-item"><span class="panel-spec-icon">⚙️</span><span class="panel-spec-label">Transmission</span><span class="panel-spec-value">${escapeHtml(vehicle.transmission || '—')}</span></div>
            <div class="panel-spec-item"><span class="panel-spec-icon">⛽</span><span class="panel-spec-label">Fuel</span><span class="panel-spec-value">${escapeHtml(vehicle.fuelType || vehicle.fuel || '—')}</span></div>
            <div class="panel-spec-item"><span class="panel-spec-icon">❄️</span><span class="panel-spec-label">AC</span><span class="panel-spec-value">${vehicle.ac !== false ? 'Yes' : 'No'}</span></div>
            <div class="panel-spec-item"><span class="panel-spec-icon">💰</span><span class="panel-spec-label">Price/Day</span><span class="panel-spec-value">${formatCurrency(vehicle.pricePerDay)}</span></div>
        </div>
    `;

    if (vehicle.features?.length) {
        html += '<div class="detail-section-title">Features</div>';
        html += vehicle.features.map(f => `<span class="panel-feature-tag">✓ ${escapeHtml(f)}</span>`).join('');
    }

    if (vehicle.routes?.length) {
        html += '<div class="detail-section-title">Routes</div>';
        html += vehicle.routes.map(r => `<span class="panel-route-tag">📍 ${escapeHtml(r)}</span>`).join('');
    }

    if (vehicle.description) {
        html += `<div class="detail-section-title">Description</div><p>${escapeHtml(vehicle.description)}</p>`;
    }

    body.innerHTML = html;
    panel.classList.add('active');
    $('#panelOverlay')?.classList.add('active');
}

function switchPanelImage(img) {
    const mainImg = $('#vp-main-img');
    if (mainImg) mainImg.src = img.dataset.panelThumb;
    $$('.panel-img-thumbs img').forEach(t => t.classList.remove('active'));
    img.classList.add('active');
}

function closeVehiclePanel() {
    $('#vehiclePanel')?.classList.remove('active');
    $('#panelOverlay')?.classList.remove('active');
}

/* ═══════════════════════════
   PACKAGES
════════════════════════════ */
async function loadPackages() {
    try {
        const search = $('#pSearch')?.value || '';
        const category = $('#pCatFilter')?.value || '';

        let params = 'limit=100';
        if (search) params += `&search=${encodeURIComponent(search)}`;
        if (category) params += `&category=${encodeURIComponent(category)}`;

        const res = await API.admin.getPackages(params);
        if (res.success) {
            state.packages = res.data || [];
            renderPackages();
        } else {
            toast(res.message || 'Failed to load packages', 'error');
        }
    } catch (err) {
        toast('Server error', 'error');
    }
}

function isPackageActive(pkg) {
    return pkg.isActive === true || pkg.status === 'active';
}

function renderPackages() {
    const grid = $('#packagesGrid');
    if (!grid) return;

    if (state.packages.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <h3>No Packages Found</h3>
                <p>Create your first travel package.</p>
                <button class="btn btn-primary" onclick="openPackageModal()">+ Add Package</button>
            </div>
        `;
        return;
    }

    const categoryClasses = {
        'adventure': 'badge-orange', 'cultural': 'badge-maroon', 'beach': 'badge-blue',
        'wildlife': 'badge-green', 'mountain': 'badge-gold', 'city': 'badge-blue',
        'luxury': 'badge-gold', 'pilgrimage': 'badge-maroon', 'other': 'badge-gray'
    };

    grid.innerHTML = state.packages.map(pkg => {
        const imgUrl = getImageUrl(pkg.image || pkg.images?.[0] || '');
        const isActive = isPackageActive(pkg);
        const badgeClass = categoryClasses[pkg.category] || 'badge-gray';
        const includesHtml = (pkg.includes || []).slice(0, 4)
            .map(inc => `<span class="admin-pkg-include-tag">${escapeHtml(inc)}</span>`)
            .join('');

        return `
            <div class="admin-pkg-card${isActive ? '' : ' disabled-card'}">
                <div class="admin-pkg-img">
                    <img src="${imgUrl}" alt="${escapeHtml(pkg.name)}" loading="lazy" onerror="this.src='/images/no-image.jpg'">
                    <div class="admin-pkg-img-overlay"></div>
                    <span class="admin-pkg-cat badge ${badgeClass}">${escapeHtml(pkg.category || 'Other')}</span>
                    ${pkg.duration ? `<span class="admin-pkg-duration">${escapeHtml(pkg.duration)}</span>` : ''}
                    <span class="admin-pkg-status badge ${isActive ? 'badge-green' : 'badge-red'}">
                        ${isActive ? 'Active' : 'Disabled'}
                    </span>
                </div>
                <div class="admin-pkg-body">
                    <div class="admin-pkg-name">${escapeHtml(pkg.name)}</div>
                    <div class="admin-pkg-desc">${escapeHtml(pkg.shortDescription || pkg.description || '')}</div>
                    ${includesHtml ? `<div class="admin-pkg-includes">${includesHtml}</div>` : ''}
                    <div class="admin-pkg-footer">
                        <div class="admin-pkg-price">
                            ${formatCurrency(pkg.discountPrice || pkg.price)}
                            ${pkg.discountPrice ? `<span style="text-decoration:line-through;color:var(--medium-gray);font-size:13px;font-weight:400">${formatCurrency(pkg.price)}</span>` : ''}
                        </div>
                        <div class="admin-pkg-rating">${pkg.isFeatured ? '⭐ Featured' : ''}</div>
                    </div>
                    <div class="admin-pkg-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editPackage('${pkg._id}')">Edit</button>
                        <button class="btn btn-sm btn-ghost" onclick="togglePackage('${pkg._id}')">
                            ${isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePackage('${pkg._id}', '${escapeHtml(pkg.name)}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openPackageModal(pkg = null) {
    state.editingPackage = pkg || null;
    state.packageIncludes = pkg ? [...(pkg.includes || [])] : [];

    const title = $('#pkgModalTitle');
    if (title) title.textContent = pkg ? 'Edit Package' : 'Add Package';

    const form = $('#pkgForm');
    if (!form) return;

    form.reset();
    $$('#pkgForm .form-group').forEach(g => g.classList.remove('error'));

    if (pkg) {
        form.elements['name'].value = pkg.name || '';
        form.elements['category'].value = pkg.category || '';
        form.elements['duration'].value = pkg.duration || '';
        form.elements['price'].value = pkg.price || '';
        form.elements['description'].value = pkg.description || '';
        form.elements['image'].value = pkg.image || pkg.images?.[0] || '';
        form.elements['maxGroup'].value = pkg.maxGroup || pkg.maxPeople || '';
        form.elements['status'].value = pkg.status || (pkg.isActive ? 'active' : 'disabled');
    }

    renderPackageIncludes();
    $('#pkgModal')?.classList.add('active');
}

function closePackageModal() {
    $('#pkgModal')?.classList.remove('active');
    state.editingPackage = null;
}

function renderPackageIncludes() {
    const list = $('#includesList');
    if (!list) return;

    list.innerHTML = state.packageIncludes.map((inc, i) => `
        <div class="includes-item">
            <span style="color:var(--green);font-size:16px">✓</span>
            <input class="form-control" placeholder="What's included" value="${escapeHtml(inc)}"
                   data-include-idx="${i}" onchange="state.packageIncludes[${i}] = this.value">
            <button class="remove-include" type="button" data-remove-include="${i}">×</button>
        </div>
    `).join('');

    $$('[data-remove-include]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.removeInclude, 10);
            state.packageIncludes.splice(idx, 1);
            renderPackageIncludes();
        });
    });
}

function addPackageInclude() {
    state.packageIncludes.push('');
    renderPackageIncludes();
}

async function savePackage() {
    const form = $('#pkgForm');
    if (!form) return;

    const name = form.elements['name']?.value.trim() || '';
    const category = form.elements['category']?.value.trim() || '';
    const price = parseFloat(form.elements['price']?.value || 0);

    $$('#pkgForm .form-group').forEach(g => g.classList.remove('error'));
    let hasError = false;

    if (!name) {
        form.elements['name'].closest('.form-group').classList.add('error');
        hasError = true;
    }
    if (!category) {
        form.elements['category'].closest('.form-group').classList.add('error');
        hasError = true;
    }
    if (!price) {
        form.elements['price'].closest('.form-group').classList.add('error');
        hasError = true;
    }

    if (hasError) {
        toast('Please fill in all required fields', 'error');
        return;
    }

    const data = {
        name,
        slug: slugify(name),
        category,
        duration: form.elements['duration']?.value.trim() || undefined,
        price,
        description: form.elements['description']?.value.trim() || undefined,
        image: form.elements['image']?.value.trim() || undefined,
        maxGroup: form.elements['maxGroup']?.value ? parseInt(form.elements['maxGroup'].value) : undefined,
        status: form.elements['status']?.value || 'active',
        includes: state.packageIncludes.filter(x => x.trim())
    };

    try {
        const res = state.editingPackage
            ? await API.admin.updatePackage(state.editingPackage._id, data)
            : await API.admin.createPackage(data);

        if (res.success) {
            toast(state.editingPackage ? 'Package updated!' : 'Package created!', 'success');
            closePackageModal();
            loadPackages();
        } else {
            toast(res.message || 'Failed to save package', 'error');
        }
    } catch (err) {
        toast('Server error', 'error');
    }
}

async function editPackage(id) {
    try {
        const res = await API.admin.getPackage(id);
        if (res.success) {
            openPackageModal(res.data);
        } else {
            toast('Failed to load package', 'error');
        }
    } catch (err) {
        toast('Server error', 'error');
    }
}

async function togglePackage(id) {
    try {
        const res = await API.admin.togglePackage(id);
        if (res.success) {
            toast('Package toggled', 'success');
            loadPackages();
        } else {
            toast(res.message || 'Failed', 'error');
        }
    } catch (err) {
        toast('Server error', 'error');
    }
}

function deletePackage(id, name) {
    openConfirmModal(
        'Delete Package',
        `Delete <strong>${escapeHtml(name)}</strong>?`,
        async () => {
            try {
                const res = await API.admin.deletePackage(id);
                if (res.success) {
                    toast('Package deleted', 'success');
                    loadPackages();
                } else {
                    toast(res.message || 'Failed', 'error');
                }
            } catch (err) {
                toast('Server error', 'error');
            }
            closeConfirmModal();
        }
    );
}

/* ═══════════════════════════
   BOOKINGS
════════════════════════════ */
function bookingStatusBadge(status) {
    const map = {
        'pending': 'badge-orange',
        'confirmed': 'badge-blue',
        'in-progress': 'badge-maroon',
        'completed': 'badge-green',
        'cancelled': 'badge-red'
    };
    return map[status] || 'badge-gray';
}

async function loadBookings() {
    try {
        const search = $('#bSearch')?.value || '';
        const status = $('#bStatusFilter')?.value || '';

        let params = 'limit=100';
        if (search) params += `&search=${encodeURIComponent(search)}`;
        if (status) params += `&status=${encodeURIComponent(status)}`;

        const res = await API.admin.getBookings(params);
        state.bookings = res?.success ? (res.data || []) : [];
        renderBookings();
    } catch (err) {
        state.bookings = [];
        renderBookings();
        toast('Server error', 'error');
    }
}

function renderBookings() {
    const tbody = $('#bookingsBody');
    if (!tbody) return;

    if (!Array.isArray(state.bookings) || state.bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--medium-gray)">No bookings found</td></tr>';
        return;
    }

    tbody.innerHTML = state.bookings.map(booking => `
        <tr>
            <td><code style="font-size:11px">${safeText(booking.bookingId || booking._id)}</code></td>
            <td><strong>${safeText(booking.fullName || booking.name || booking.customerName)}</strong></td>
            <td>${booking.phone || booking.mobile ? `<a href="tel:${booking.phone || booking.mobile}" style="color:var(--maroon)">${safeText(booking.phone || booking.mobile)}</a>` : '—'}</td>
            <td>${safeText(booking.vehicleName || booking.packageName || 'General')}</td>
            <td style="white-space:nowrap">${formatDate(booking.travelDate || booking.date)}</td>
            <td><strong>${formatCurrency(booking.totalPrice || booking.price)}</strong></td>
            <td><span class="badge ${bookingStatusBadge(booking.status)}">${safeText(booking.status || 'pending')}</span></td>
            <td style="white-space:nowrap">
                <button class="btn btn-sm btn-secondary" onclick="viewBooking('${booking._id}')">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBooking('${booking._id}')" title="Delete">×</button>
            </td>
        </tr>
    `).join('');
}

async function viewBooking(id) {
    try {
        const res = await API.admin.getBooking(id);
        if (!res?.success) {
            toast('Failed to load booking', 'error');
            return;
        }
        // Render booking details in a modal/panel
        toast('View booking feature coming soon', 'info');
    } catch (err) {
        toast('Server error', 'error');
    }
}

function deleteBooking(id) {
    openConfirmModal(
        'Delete Booking',
        'Permanently delete this booking?',
        async () => {
            try {
                const res = await API.admin.deleteBooking(id);
                if (res.success) {
                    toast('Booking deleted', 'success');
                    loadBookings();
                } else {
                    toast(res.message || 'Failed', 'error');
                }
            } catch (err) {
                toast('Server error', 'error');
            }
            closeConfirmModal();
        }
    );
}

/* ═══════════════════════════
   CONTACTS
════════════════════════════ */
async function loadContacts() {
    try {
        const search = $('#cSearch')?.value || '';
        let params = 'limit=100';
        if (search) params += `&search=${encodeURIComponent(search)}`;

        const res = await API.admin.getContacts(params);
        state.contacts = res?.success ? (res.data || []) : [];
        renderContacts();
    } catch (err) {
        state.contacts = [];
        renderContacts();
        toast('Server error', 'error');
    }
}

function renderContacts() {
    const tbody = $('#contactsBody');
    if (!tbody) return;

    if (state.contacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--medium-gray)">No contact messages found</td></tr>';
        return;
    }

    tbody.innerHTML = state.contacts.map(contact => `
        <tr style="${contact.isRead ? 'opacity:0.7' : 'font-weight:500'}">
            <td>${safeText(contact.name)}</td>
            <td>${safeText(contact.email)}</td>
            <td>${safeText(contact.phone)}</td>
            <td>${safeText(contact.subject)}</td>
            <td style="white-space:nowrap">${formatDate(contact.createdAt)} ${!contact.isRead ? '<span class="badge badge-maroon" style="font-size:9px">NEW</span>' : ''}</td>
            <td><span class="badge ${contact.isRead ? 'badge-gray' : 'badge-maroon'}">${contact.isRead ? 'Read' : 'Unread'}</span></td>
            <td style="white-space:nowrap">
                <button class="btn btn-sm btn-secondary" onclick="viewContact('${contact._id}')">View</button>
                <button class="btn btn-sm btn-danger" onclick="deleteContact('${contact._id}')" title="Delete">×</button>
            </td>
        </tr>
    `).join('');
}

function deleteContact(id) {
    openConfirmModal(
        'Delete Contact',
        'Delete this message?',
        async () => {
            try {
                const res = await API.admin.deleteContact(id);
                if (res.success) {
                    toast('Message deleted', 'success');
                    loadContacts();
                } else {
                    toast('Failed', 'error');
                }
            } catch (err) {
                toast('Server error', 'error');
            }
            closeConfirmModal();
        }
    );
}

/* ═══════════════════════════
   INITIALIZATION
════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    loadAdminProfile();

    // Sidebar events
    $('#hamburger')?.addEventListener('click', openSidebar);
    $('#sidebarClose')?.addEventListener('click', closeSidebar);
    $('#sidebarOverlay')?.addEventListener('click', closeSidebar);

    // Navigation
    $$('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.section));
    });

    // Vehicle modal
    $('#addVehicleBtn')?.addEventListener('click', () => openVehicleModal());
    $('#vehicleModalClose')?.addEventListener('click', closeVehicleModal);
    $('#vehicleModalCancel')?.addEventListener('click', closeVehicleModal);
    $('#vehicleModalSave')?.addEventListener('click', saveVehicle);
    $('#addImgBtn')?.addEventListener('click', addVehicleImage);
    $('#addRouteBtn')?.addEventListener('click', addVehicleRoute);

    $$('#vFormTabs .form-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchVehicleTab(btn.dataset.tab));
    });

    // Package modal
    $('#addPkgBtn')?.addEventListener('click', () => openPackageModal());
    $('#pkgModalClose')?.addEventListener('click', closePackageModal);
    $('#pkgModalCancel')?.addEventListener('click', closePackageModal);
    $('#pkgModalSave')?.addEventListener('click', savePackage);
    $('#addIncludeBtn')?.addEventListener('click', addPackageInclude);

    // Confirm modal
    $('#confirmCancel')?.addEventListener('click', closeConfirmModal);
    $('#confirmDelete')?.addEventListener('click', () => {
        if (typeof confirmCallback === 'function') confirmCallback();
    });

    // Filters with debounce
    $('#vSearch')?.addEventListener('input', debounce(loadVehicles, 400));
    $('#vTypeFilter')?.addEventListener('change', loadVehicles);
    $('#vStatusFilter')?.addEventListener('change', loadVehicles);

    $('#pSearch')?.addEventListener('input', debounce(loadPackages, 400));
    $('#pCatFilter')?.addEventListener('change', loadPackages);

    $('#bSearch')?.addEventListener('input', debounce(loadBookings, 400));
    $('#bStatusFilter')?.addEventListener('change', loadBookings);

    $('#cSearch')?.addEventListener('input', debounce(loadContacts, 400));

    // Header time
    function updateHeaderTime() {
        const headerTime = $('#headerTime');
        if (headerTime) {
            headerTime.textContent = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    updateHeaderTime();
    setInterval(updateHeaderTime, 30000);

    // Load initial section
    const activeNav = $('.nav-item.active');
    navigateTo(activeNav?.dataset.section || 'dashboard');
});

console.log('✅ Admin dashboard loaded successfully');