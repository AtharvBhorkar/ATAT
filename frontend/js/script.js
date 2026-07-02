const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const sectionTitle = document.getElementById('sectionTitle');
const bookingsTableBody = document.getElementById('bookingsTableBody');
const vehiclesGrid = document.getElementById('vehiclesGrid');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarClose = document.getElementById('sidebarClose');
const notifBell = document.getElementById('notifBell');
const notificationPanel = document.getElementById('notificationPanel');
const panelOverlay = document.getElementById('panelOverlay');
const slidePanel = document.getElementById('slidePanel');
const headerDropdown = document.querySelector('.dropdown-toggle');
const dropdownMenu = document.querySelector('.dropdown-menu');

let bookingsChart = null;
let paymentChart = null;

function showSection(sectionId) {
    sections.forEach(section => section.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');

    navItems.forEach(item => item.classList.remove('active'));
    const activeNav = document.querySelector(`[data-section="${sectionId.replace('-section', '')}"]`);
    if (activeNav) activeNav.classList.add('active');

    const titles = {
        'dashboard-section': '📊 Dashboard Overview',
        'bookings-section': '📅 Bookings Management',
        'vehicles-section': '🚗 Vehicles Management',
        'packages-section': '📦 Packages Management',
        'users-section': '👥 Users & Registrations',
        'payments-section': '💳 Payments',
        'tracking-section': '🗺️ Live Tracking',
        'expiry-section': '⏰ Rental Expiry Management',
        'settings-section': '⚙️ Settings'
    };
    sectionTitle.textContent = titles[sectionId] || 'Dashboard';

    if (sectionId === 'dashboard-section') setTimeout(initializeCharts, 100);
    if (sectionId === 'payments-section') setTimeout(initializePaymentMethodsChart, 100);

    if (window.innerWidth <= 768) closeSidebar();
}

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

hamburgerMenu.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) closeSidebar();
        showSection(item.dataset.section + '-section');
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSidebar();
        closeSlidePanel();
        closeNotificationPanel();
        dropdownMenu.classList.remove('active');
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    }
});

headerDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
});
document.addEventListener('click', () => dropdownMenu.classList.remove('active'));

function populateBookingsTable(bookings = mockBookings) {
    bookingsTableBody.innerHTML = '';
    bookings.forEach(booking => {
        const paymentPercent = Math.round((booking.paid / booking.amount) * 100);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.customer}</td>
            <td>${booking.vehicle}</td>
            <td>${formatDate(booking.checkIn)}</td>
            <td>${formatDate(booking.checkOut)}</td>
            <td>₹${booking.amount.toLocaleString()}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${paymentPercent}%"></div>
                </div>
                <small>${paymentPercent}%</small>
            </td>
            <td><span class="badge badge-${booking.status}">${capitalize(booking.status)}</span></td>
            <td><button class="btn-secondary btn-view" style="padding: 6px 10px; font-size: 12px;">View</button></td>
        `;
        row.querySelector('.btn-view').addEventListener('click', () => {
            document.getElementById('bookingDetailBody').innerHTML = `
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Customer:</strong> ${booking.customer}</p>
                <p><strong>Vehicle:</strong> ${booking.vehicle}</p>
                <p><strong>Check-in:</strong> ${formatDate(booking.checkIn)}</p>
                <p><strong>Check-out:</strong> ${formatDate(booking.checkOut)}</p>
                <p><strong>Amount:</strong> ₹${booking.amount.toLocaleString()}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
            `;
            openModal('bookingDetailModal');
        });
        bookingsTableBody.appendChild(row);
    });
}

document.querySelector('#bookings-section .btn-primary')?.addEventListener('click', () => {
    const rows = mockBookings.map(b => `${b.id},${b.customer},${b.vehicle},${b.checkIn},${b.checkOut},${b.amount},${b.status}`);
    const csv = 'Booking ID,Customer,Vehicle,Check-in,Check-out,Amount,Status\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Bookings exported successfully!', 'success');
});

document.getElementById('bookingSearch')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = mockBookings.filter(b => b.id.toLowerCase().includes(term) || b.customer.toLowerCase().includes(term));
    populateBookingsTable(filtered);
});
document.getElementById('statusFilter')?.addEventListener('change', (e) => {
    const status = e.target.value;
    populateBookingsTable(status ? mockBookings.filter(b => b.status === status) : mockBookings);
});

function populateVehiclesGrid(vehicles = mockVehicles) {
    vehiclesGrid.innerHTML = '';
    vehicles.forEach(vehicle => {
        const card = document.createElement('div');
        card.className = 'vehicle-card card-hover';
        card.innerHTML = `
            <div class="vehicle-image">${vehicle.image}</div>
            <div class="vehicle-content">
                <div class="vehicle-header">
                    <h3 class="vehicle-name">${vehicle.name}</h3>
                </div>
                <div class="vehicle-details">
                    <div class="detail-row"><span class="detail-label">Type:</span><span class="detail-value">${capitalize(vehicle.type)}</span></div>
                    <div class="detail-row"><span class="detail-label">Daily Rate:</span><span class="detail-value">₹${vehicle.dailyRate}</span></div>
                    <div class="detail-row"><span class="detail-label">Mileage:</span><span class="detail-value">${vehicle.mileage.toLocaleString()} km</span></div>
                    <div class="detail-row"><span class="detail-label">Year:</span><span class="detail-value">${vehicle.year}</span></div>
                    <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value"><span class="badge badge-${vehicle.status}">${capitalize(vehicle.status)}</span></span></div>
                </div>
                <div class="vehicle-actions">
                    <button class="btn-secondary">Edit</button>
                    <button class="btn-secondary">Delete</button>
                </div>
            </div>
        `;
        vehiclesGrid.appendChild(card);
    });
}

document.getElementById('vehicleSearch')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = mockVehicles.filter(v => v.name.toLowerCase().includes(term) || v.type.toLowerCase().includes(term));
    populateVehiclesGrid(filtered);
});
document.getElementById('typeFilter')?.addEventListener('change', applyVehicleFilters);
document.getElementById('statusVehicleFilter')?.addEventListener('change', applyVehicleFilters);

function applyVehicleFilters() {
    const type = document.getElementById('typeFilter').value;
    const status = document.getElementById('statusVehicleFilter').value;
    let filtered = mockVehicles;
    if (type) filtered = filtered.filter(v => v.type === type);
    if (status) filtered = filtered.filter(v => v.status === status);
    populateVehiclesGrid(filtered);
}

function openSlidePanel() {
    slidePanel.classList.add('active');
    panelOverlay.classList.add('active');
}
function closeSlidePanel() {
    slidePanel.classList.remove('active');
    panelOverlay.classList.remove('active');
}
document.querySelector('.slide-panel-close')?.addEventListener('click', closeSlidePanel);
panelOverlay?.addEventListener('click', closeSlidePanel);

document.addEventListener('DOMContentLoaded', () => {
    const vehiclesSection = document.getElementById('vehicles-section');
    const addBtn = vehiclesSection?.querySelector('.btn-primary');
    if (addBtn) addBtn.addEventListener('click', openSlidePanel);
});

function initializeCharts() {
    const bookingsCtx = document.getElementById('bookingsChart');
    const paymentCtx = document.getElementById('paymentChart');
    if (!bookingsCtx || !paymentCtx) return;

    if (bookingsChart) bookingsChart.destroy();
    if (paymentChart) paymentChart.destroy();

    bookingsChart = new Chart(bookingsCtx, {
        type: 'line',
        data: bookingsChartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, labels: { font: { family: "'Segoe UI'" }, boxWidth: 12, padding: 15 } }
            },
            scales: {
                y: { beginAtZero: true, ticks: { font: { family: "'Segoe UI'" } } },
                x: { ticks: { font: { family: "'Segoe UI'" } } }
            }
        }
    });

    paymentChart = new Chart(paymentCtx, {
        type: 'doughnut',
        data: paymentChartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, labels: { font: { family: "'Segoe UI'" }, boxWidth: 12, padding: 15 } }
            }
        }
    });
}

document.querySelectorAll('.section').forEach(section => {
    const tabBtns = section.querySelectorAll('.tab-btn');
    const tabContents = section.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.dataset.tab + '-tab';
            const target = section.querySelector('#' + targetId) || document.getElementById(targetId);
            if (target) target.classList.add('active');
        });
    });
});

function initializeRealCountdownTimers() {
    const countdownElements = document.querySelectorAll('.timer-display');
    countdownElements.forEach((element) => {
        const updateTimer = () => {
            const now = new Date();
            let today = new Date();
            today.setHours(18, 0, 0, 0);
            const remaining = today.getTime() - now.getTime();
            if (remaining > 0) {
                const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((remaining / (1000 * 60)) % 60);
                const seconds = Math.floor((remaining / 1000) % 60);
                const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                if (days > 0) {
                    element.textContent = `${days}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                } else {
                    element.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }
            } else {
                element.textContent = '00:00:00';
                element.closest('.countdown-timer')?.classList.add('overdue');
            }
        };
        updateTimer();
        setInterval(updateTimer, 1000);
    });
}

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    document.getElementById('timeDisplay').textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateTime, 60000);
updateTime();

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-content">${message}</div><button class="toast-close">&times;</button>`;
    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    });
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function populatePackagesTable(packages = mockPackages) {
    const body = document.getElementById('packagesTableBody');
    if (!body) return;
    body.innerHTML = '';
    packages.forEach(pkg => {
        body.innerHTML += `
            <tr>
                <td>${pkg.id}</td>
                <td>${pkg.name}</td>
                <td>${pkg.duration}</td>
                <td>₹${pkg.price.toLocaleString()}</td>
                <td>${pkg.vehicles}</td>
                <td>${pkg.bookings}</td>
                <td><span class="badge badge-${pkg.status === 'active' ? 'active' : 'pending'}">${capitalize(pkg.status)}</span></td>
                <td>
    <button class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick='openPackagePanel(${JSON.stringify(pkg)})'>Edit</button>
    <button class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="openModal('bookingDetailModal'); document.getElementById('bookingDetailBody').innerHTML='<p><strong>ID:</strong> ${pkg.id}</p><p><strong>Name:</strong> ${pkg.name}</p><p><strong>Duration:</strong> ${pkg.duration}</p><p><strong>Price:</strong> ₹${pkg.price.toLocaleString()}</p><p><strong>Vehicles:</strong> ${pkg.vehicles}</p><p><strong>Bookings:</strong> ${pkg.bookings}</p><p><strong>Status:</strong> ${pkg.status}</p>'">View</button>
</td>
            </tr>`;
    });
}
document.getElementById('packageSearch')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    populatePackagesTable(mockPackages.filter(p => p.id.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)));
});

function populateUsersTable(users = mockUsers) {
    const body = document.getElementById('usersTableBody');
    if (!body) return;
    body.innerHTML = '';
    users.forEach((user, idx) => {
        const statusClass = user.status === 'active' ? 'badge-active' : user.status === 'new' ? 'badge-pending' : 'badge-cancelled';
        body.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${formatDate(user.registered)}</td>
                <td>${user.bookings}</td>
                <td>₹${user.spent.toLocaleString()}</td>
                <td><span class="badge ${statusClass}">${capitalize(user.status)}</span></td>
                <td>
    <button class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="viewUser(${idx})">View</button>
    <button class="btn-secondary" style="padding:6px 10px;font-size:12px;${user.status === 'banned' ? 'background:var(--voyago-maroon);color:white;' : ''}" onclick="banUser(${idx})">${user.status === 'banned' ? 'Unban' : 'Ban'}</button>
</td>
            </tr>`;
    });
}
document.getElementById('userSearch')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const status = document.getElementById('userStatusFilter').value;
    let filtered = mockUsers.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    if (status) filtered = filtered.filter(u => u.status === status);
    populateUsersTable(filtered);
});
document.getElementById('userStatusFilter')?.addEventListener('change', (e) => {
    const term = document.getElementById('userSearch')?.value.toLowerCase() || '';
    const status = e.target.value;
    let filtered = mockUsers;
    if (term) filtered = filtered.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    if (status) filtered = filtered.filter(u => u.status === status);
    populateUsersTable(filtered);
});

function populatePaymentsTable(payments = mockPayments) {
    const body = document.getElementById('paymentsTableBody');
    if (!body) return;
    body.innerHTML = '';
    payments.forEach(p => {
        const statusClass = p.status === 'paid' ? 'badge-active' : p.status === 'failed' ? 'badge-cancelled' : 'badge-pending';
        body.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.bookingId}</td>
                <td>${p.customer}</td>
                <td>₹${p.amount.toLocaleString()}</td>
                <td>${p.method}</td>
                <td>${formatDate(p.date)}</td>
                <td><span class="badge ${statusClass}">${capitalize(p.status)}</span></td>
                <td><button class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="${p.status === 'paid' ? `viewReceipt('${p.id}')` : `retryPayment('${p.id}')`}">${p.status === 'paid' ? 'Receipt' : 'Retry'}</button></td>
            </tr>`;
    });
}
function viewReceipt(id) {
    const p = mockPayments.find(x => x.id === id);
    openModal('bookingDetailModal');
    document.getElementById('bookingDetailBody').innerHTML = `
        <p><strong>Payment ID:</strong> ${p.id}</p>
        <p><strong>Booking ID:</strong> ${p.bookingId}</p>
        <p><strong>Customer:</strong> ${p.customer}</p>
        <p><strong>Amount:</strong> ₹${p.amount.toLocaleString()}</p>
        <p><strong>Method:</strong> ${p.method}</p>
        <p><strong>Date:</strong> ${formatDate(p.date)}</p>
        <p><strong>Status:</strong> ${p.status}</p>
    `;
}

function retryPayment(id) {
    const idx = mockPayments.findIndex(x => x.id === id);
    if (idx === -1) return;
    mockPayments[idx].status = 'paid';
    populatePaymentsTable();
    showToast(`Payment ${id} retried successfully!`, 'success');
}

function initializePaymentMethodsChart() {
    const ctx = document.getElementById('paymentMethodsChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['UPI', 'Cash', 'Card', 'Online', 'Others'],
            datasets: [{
                data: [45, 25, 20, 8, 2],
                backgroundColor: ['#6E1F2B', '#FF7A00', '#D9A441', '#4A7C59', '#1976D2'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: true, labels: { boxWidth: 12, padding: 15 } } }
        }
    });
}

function openModal(modalId) {
    document.getElementById(modalId)?.classList.add('active');
}
function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
}
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal')?.classList.remove('active'));
});
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
});

function openNotificationPanel() {
    notificationPanel.classList.add('active');
    panelOverlay.classList.add('active');
}
function closeNotificationPanel() {
    notificationPanel.classList.remove('active');
    panelOverlay.classList.remove('active');
}
notifBell?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (notificationPanel.classList.contains('active')) {
        closeNotificationPanel();
    } else {
        openNotificationPanel();
    }
});
panelOverlay?.addEventListener('click', closeNotificationPanel);

const mockNotifications = [
    { type: 'booking', title: 'New Booking', description: 'Booking #BK123456 received from John Doe', color: '#4A7C59' },
    { type: 'payment', title: 'Payment Received', description: '₹5,000 payment received from customer', color: '#D9A441' },
    { type: 'expiry', title: 'Rental Expiring', description: '2 vehicles returning today by 6 PM', color: '#D32F2F' },
    { type: 'registration', title: 'New Registration', description: 'Jane Smith registered as new user', color: '#1976D2' },
    { type: 'completed', title: 'Booking Completed', description: 'Booking #BK123455 marked as completed', color: '#4A7C59' }
];

function populateNotifications() {
    const list = document.getElementById('notificationList');
    if (!list) return;
    list.innerHTML = '';
    mockNotifications.forEach(n => {
        list.innerHTML += `
            <div class="notification-item">
                <div class="notification-dot" style="background:${n.color};"></div>
                <div class="notification-content">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-desc">${n.description}</div>
                </div>
            </div>`;
    });
    if (!notifBell.querySelector('.notification-badge')) {
        const badge = document.createElement('div');
        badge.className = 'notification-badge';
        badge.textContent = mockNotifications.length;
        notifBell.style.position = 'relative';
        notifBell.appendChild(badge);
    }
}

document.getElementById('markAllRead')?.addEventListener('click', () => {
    const badge = notifBell.querySelector('.notification-badge');
    if (badge) badge.remove();
    closeNotificationPanel();
    showToast('All notifications marked as read');
});

document.querySelectorAll('#settings-section .btn-primary').forEach(btn => {
    btn.addEventListener('click', () => showToast('Settings saved successfully!', 'success'));
});

document.getElementById('profileMenuItem')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('profileModal');
});

document.getElementById('logoutMenuItem')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('logoutConfirmModal');
});

document.getElementById('confirmLogoutBtn')?.addEventListener('click', () => {
    closeModal('logoutConfirmModal');
    showToast('Logged out successfully', 'success');
    setTimeout(() => window.location.reload(), 1500);
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeSidebar();
});

function openPackagePanel(pkg = null) {
    document.getElementById('editPackageId').value = pkg ? pkg.id : '';
    document.getElementById('packagePanelTitle').textContent = pkg ? 'Edit Package' : 'Add Package';
    document.getElementById('pkgName').value = pkg ? pkg.name : '';
    document.getElementById('pkgDuration').value = pkg ? pkg.duration : '';
    document.getElementById('pkgPrice').value = pkg ? pkg.price : '';
    document.getElementById('pkgVehicles').value = pkg ? pkg.vehicles : '';
    document.getElementById('pkgStatus').value = pkg ? pkg.status : 'active';
    document.getElementById('packageSlidePanel').classList.add('active');
    document.getElementById('panelOverlay').classList.add('active');
}
function closePackagePanel() {
    document.getElementById('packageSlidePanel').classList.remove('active');
    document.getElementById('panelOverlay').classList.remove('active');
}
function savePackage() {
    const id = document.getElementById('editPackageId').value;
    const name = document.getElementById('pkgName').value.trim();
    const duration = document.getElementById('pkgDuration').value.trim();
    const price = parseInt(document.getElementById('pkgPrice').value);
    const vehicles = parseInt(document.getElementById('pkgVehicles').value);
    const status = document.getElementById('pkgStatus').value;
    if (!name || !duration || !price || !vehicles) {
        showToast('Please fill all fields!', 'error');
        return;
    }
    if (id) {
        const idx = mockPackages.findIndex(p => p.id === id);
        if (idx !== -1) {
            mockPackages[idx] = { ...mockPackages[idx], name, duration, price, vehicles, status };
            showToast(`Package ${id} updated successfully!`, 'success');
        }
    } else {
        const newId = 'PKG00' + (mockPackages.length + 1);
        mockPackages.push({ id: newId, name, duration, price, vehicles, bookings: 0, status });
        showToast(`New package "${name}" added!`, 'success');
    }
    populatePackagesTable();
    closePackagePanel();
}

function viewUser(idx) {
    const user = mockUsers[idx];
    openModal('bookingDetailModal');
    document.getElementById('bookingDetailBody').innerHTML = `
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>
        <p><strong>Registered:</strong> ${formatDate(user.registered)}</p>
        <p><strong>Total Bookings:</strong> ${user.bookings}</p>
        <p><strong>Total Spent:</strong> ₹${user.spent.toLocaleString()}</p>
        <p><strong>Status:</strong> ${user.status}</p>
    `;
}

function banUser(idx) {
    const user = mockUsers[idx];
    if (user.status === 'banned') {
        if (confirm(`Unban ${user.name}?`)) {
            mockUsers[idx].status = 'active';
            populateUsersTable();
            showToast(`${user.name} has been unbanned!`, 'success');
        }
    } else {
        if (confirm(`Are you sure you want to ban ${user.name}?`)) {
            mockUsers[idx].status = 'banned';
            populateUsersTable();
            showToast(`${user.name} has been banned!`, 'error');
        }
    }
}

window.addEventListener('load', () => {
    setTimeout(() => {
        initializeCharts();
        initializePaymentMethodsChart();
    }, 200);
});

document.addEventListener('DOMContentLoaded', () => {
    populateBookingsTable();
    populateVehiclesGrid();
    populatePackagesTable();
    populateUsersTable();
    populatePaymentsTable();
    populateNotifications();
    document.getElementById('addPackageBtn')?.addEventListener('click', () => openPackagePanel());
    initializeRealCountdownTimers();
    showToast('Dashboard loaded successfully');
});