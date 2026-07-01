/* ═══════════════════════════════════════════════
   VOYAGO — Shared API Utility (FIXED)
═══════════════════════════════════════════════ */

const API = (() => {

const BASE = window.location.origin + '/api';

/* ───────── TOKEN HELPERS ───────── */

function getToken() {
    try {
        return localStorage.getItem('voyago_token') ||
               sessionStorage.getItem('voyago_token');
    } catch (e) {
        return null;
    }
}

function setToken(token, remember) {
    try {
        if (remember) {
            localStorage.setItem('voyago_token', token);
            sessionStorage.removeItem('voyago_token');
        } else {
            sessionStorage.setItem('voyago_token', token);
            localStorage.removeItem('voyago_token');
        }
    } catch (e) {}
}

function clearToken() {
    try {
        localStorage.removeItem('voyago_token');
        sessionStorage.removeItem('voyago_token');
    } catch (e) {}
}

/* ───────── CORE REQUEST ───────── */

async function request(endpoint, options = {}) {

    const url = endpoint.startsWith('http')
        ? endpoint
        : BASE + endpoint;

    const token = getToken();

    const config = {
        method: options.method || 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    /* custom headers */
    if (options.headers) {
        Object.assign(config.headers, options.headers);
    }

    /* auth header */
    if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
    }

    /* body handling */
    if (options.body != null) {
        if (options.body instanceof FormData) {
            config.body = options.body;
            delete config.headers['Content-Type'];
        } else if (typeof options.body === 'string') {
            config.body = options.body;
        } else {
            config.body = JSON.stringify(options.body);
        }
    }

    try {
        const res = await fetch(url, config);

        /* 204 */
        if (res.status === 204) {
            return { success: true };
        }

        const text = await res.text();
        let data;

        try {
            data = JSON.parse(text);
        } catch (e) {
            return res.ok
                ? { success: true, raw: text }
                : { success: false, message: 'Invalid response (' + res.status + ')' };
        }

        if (data.success === undefined) {
            data.success = res.ok;
        }

        /* ❌ IMPORTANT FIX: NO REDIRECT HERE (prevents loop) */
        if (res.status === 401) {
            clearToken();
            data.unauthenticated = true;
        }

        return data;

    } catch (err) {
        console.error('API Error:', endpoint, err);
        return {
            success: false,
            message: 'Network error'
        };
    }
}

/* ───────── PUBLIC API ───────── */

const publicApi = {
    getVehicles: (p) => request('/public/vehicles' + (p ? '?' + p : '')),
    getVehicle: (id) => request('/public/vehicles/' + id),
    getPackages: (p) => request('/public/packages' + (p ? '?' + p : '')),
    getPackage: (slug) => request('/public/packages/' + slug),
    getStats: () => request('/public/stats'),
    createBooking: (d) => request('/bookings', { method: 'POST', body: d }),
    createContact: (d) => request('/contacts', { method: 'POST', body: d })
};

/* ───────── ADMIN API ───────── */

const adminApi = {

    login: (d) => request('/admin/login', { method: 'POST', body: d }),
    getMe: () => request('/admin/me'),

    changePassword: (d) =>
        request('/admin/change-password', { method: 'PUT', body: d }),

    getDashboard: () => request('/admin/dashboard'),

    /* Vehicles */
    getVehicles: (p) => request('/vehicles' + (p ? '?' + p : '')),
    getVehicle: (id) => request('/vehicles/' + id),
    createVehicle: (d) => request('/vehicles', { method: 'POST', body: d }),
    updateVehicle: (id, d) => request('/vehicles/' + id, { method: 'PUT', body: d }),
    deleteVehicle: (id) => request('/vehicles/' + id, { method: 'DELETE' }),
    toggleVehicle: (id) => request('/vehicles/' + id + '/toggle', { method: 'PATCH' }),

    /* Packages */
    getPackages: (p) => request('/packages' + (p ? '?' + p : '')),
    getPackage: (id) => request('/packages/' + id),
    createPackage: (d) => request('/packages', { method: 'POST', body: d }),
    updatePackage: (id, d) => request('/packages/' + id, { method: 'PUT', body: d }),
    deletePackage: (id) => request('/packages/' + id, { method: 'DELETE' }),
    togglePackage: (id) => request('/packages/' + id + '/toggle', { method: 'PATCH' }),
    toggleFeatured: (id) => request('/packages/' + id + '/featured', { method: 'PATCH' }),

    /* Bookings */
    getBookings: (p) => request('/bookings' + (p ? '?' + p : '')),
    getBooking: (id) => request('/bookings/' + id),
    updateBooking: (id, d) => request('/bookings/' + id, { method: 'PUT', body: d }),
    updateBookingStatus: (id, d) =>
        request('/bookings/' + id + '/status', { method: 'PATCH', body: d }),
    deleteBooking: (id) => request('/bookings/' + id, { method: 'DELETE' }),

    /* Contacts */
    getContacts: (p) => request('/contacts' + (p ? '?' + p : '')),
    getContact: (id) => request('/contacts/' + id),
    deleteContact: (id) => request('/contacts/' + id, { method: 'DELETE' }),
    markRead: (id) => request('/contacts/' + id + '/read', { method: 'PATCH' }),
    markUnread: (id) => request('/contacts/' + id + '/unread', { method: 'PATCH' })
};

/* ───────── EXPORT ───────── */

return {
    request,
    getToken,
    setToken,
    clearToken,
    public: publicApi,
    admin: adminApi
};

})();

window.API = API;