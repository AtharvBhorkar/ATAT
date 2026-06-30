/* ═══════════════════════════════════════════════
   VOYAGO — Shared API Utility
   Used by both admin dashboard and public pages
════════════════════════════════════════════════ */

const API = (() => {
  const BASE = window.location.origin + '/api';

  function getToken() {
    try { return localStorage.getItem('voyago_token') || sessionStorage.getItem('voyago_token'); } catch { return null; }
  }

  function setToken(token, remember = false) {
    try {
      if (remember) {
        localStorage.setItem('voyago_token', token);
        sessionStorage.removeItem('voyago_token');
      } else {
        sessionStorage.setItem('voyago_token', token);
        localStorage.removeItem('voyago_token');
      }
    } catch {}
  }

  function clearToken() {
    try { localStorage.removeItem('voyago_token'); sessionStorage.removeItem('voyago_token'); } catch {}
  }

  async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : BASE + endpoint;
    const token = getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': 'Bearer ' + token }),
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const res = await fetch(url, config);

      /* 204 No Content — e.g. successful delete */
      if (res.status === 204) return { success: true };

      const data = await res.json();

      if (res.status === 401) {
        clearToken();
        if (window.location.pathname.includes('dashboard')) {
          window.location.href = '/admin';
        }
        return { success: false, message: 'Session expired. Please login again.', unauthenticated: true };
      }

      return data;
    } catch (err) {
      console.error('API Error:', err);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  }

  /* ─── PUBLIC ENDPOINTS (no auth) ─── */
  const publicApi = {
    getVehicles:   (params = '') => request('/public/vehicles'  + (params ? '?' + params : '')),
    getVehicle:    (id)         => request('/public/vehicles/'  + id),
    getPackages:   (params = '') => request('/public/packages'  + (params ? '?' + params : '')),
    getPackage:    (slug)       => request('/public/packages/'  + slug),
    getStats:      ()           => request('/public/stats'),
    createBooking: (data)       => request('/bookings', { method: 'POST', body: data }),
    createContact: (data)       => request('/contacts', { method: 'POST', body: data })
  };

  /* ─── ADMIN ENDPOINTS (auth required) ─── */
  const adminApi = {
    /* Auth */
    login:          (data) => request('/admin/login', { method: 'POST', body: data }),
    getMe:          ()     => request('/admin/me'),
    getProfile:     ()     => request('/admin/me'),       /* FIXED: was /admin/profile which doesn't exist */
    changePassword: (data) => request('/admin/change-password', { method: 'PUT', body: data }),

    /* Dashboard */
    getDashboard:   ()     => request('/admin/dashboard'), /* ADDED: was missing entirely */

    /* Vehicles */
    getVehicles:   (params = '') => request('/vehicles' + (params ? '?' + params : '')),
    getVehicle:    (id)         => request('/vehicles/' + id),
    createVehicle: (data)       => request('/vehicles', { method: 'POST', body: data }),
    updateVehicle: (id, data)   => request('/vehicles/' + id, { method: 'PUT', body: data }),
    deleteVehicle: (id)         => request('/vehicles/' + id, { method: 'DELETE' }),
    toggleVehicle: (id)         => request('/vehicles/' + id + '/toggle', { method: 'PATCH' }),

    /* Packages */
    getPackages:    (params = '') => request('/packages' + (params ? '?' + params : '')),
    getPackage:     (id)         => request('/packages/' + id),
    createPackage:  (data)       => request('/packages', { method: 'POST', body: data }),
    updatePackage:  (id, data)   => request('/packages/' + id, { method: 'PUT', body: data }),
    deletePackage:  (id)         => request('/packages/' + id, { method: 'DELETE' }),
    togglePackage:  (id)         => request('/packages/' + id + '/toggle', { method: 'PATCH' }),
    toggleFeatured: (id)         => request('/packages/' + id + '/featured', { method: 'PATCH' }),

    /* Bookings */
    getBookings:         (params = '') => request('/bookings' + (params ? '?' + params : '')),
    getBooking:          (id)         => request('/bookings/' + id),
    updateBooking:       (id, data)   => request('/bookings/' + id, { method: 'PUT', body: data }),
    updateBookingStatus: (id, data)   => request('/bookings/' + id + '/status', { method: 'PATCH', body: data }),
    deleteBooking:       (id)         => request('/bookings/' + id, { method: 'DELETE' }),

    /* Contacts */
    getContacts:   (params = '') => request('/contacts' + (params ? '?' + params : '')),
    getContact:    (id)         => request('/contacts/' + id),
    deleteContact: (id)         => request('/contacts/' + id, { method: 'DELETE' }),
    markRead:      (id)         => request('/contacts/' + id + '/read', { method: 'PATCH' }),
    markUnread:    (id)         => request('/contacts/' + id + '/unread', { method: 'PATCH' }),
    deleteAllRead: ()           => request('/contacts/read/all', { method: 'DELETE' })
  };

  return { request, getToken, setToken, clearToken, public: publicApi, admin: adminApi };
})();

window.API = API;