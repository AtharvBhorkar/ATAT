/* ═══════════════════════════════════════════════
   VOYAGO — Shared API Utility
═══════════════════════════════════════════════ */

const API = (() => {
  const BASE = 'http://localhost:5000/api';
  const TOKEN_KEY = 'voyago_token';

  function getToken() {
    try {
      return (
        localStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem(TOKEN_KEY)
      );
    } catch (e) {
      console.error('Token read error:', e);
      return null;
    }
  }

  function setToken(token, remember = true) {
    try {
      if (!token) return;

      if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
        sessionStorage.removeItem(TOKEN_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Token save error:', e);
    }
  }

  function clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Token clear error:', e);
    }
  }

  async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : BASE + endpoint;
    const token = getToken();

    const config = {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    };

    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }

    if (options.body != null) {
      if (options.body instanceof FormData) {
        config.body = options.body;
      } else if (typeof options.body === 'string') {
        config.headers['Content-Type'] = 'application/json';
        config.body = options.body;
      } else {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(options.body);
      }
    }

    try {
      const res = await fetch(url, config);

      if (res.status === 204) {
        return { success: true, status: 204 };
      }

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      let data = {};
      if (text) {
        if (contentType.includes('application/json')) {
          data = JSON.parse(text);
        } else {
          return {
            success: false,
            status: res.status,
            message: 'Server returned non-JSON response.',
            raw: text
          };
        }
      }

      if (typeof data.success === 'undefined') {
        data.success = res.ok;
      }

      data.status = res.status;

      if (res.status === 401) {
        data.unauthenticated = true;
      }

      return data;
    } catch (err) {
      return {
        success: false,
        message: 'Network error. Is the backend server running on port 5000?',
        error: err.message
      };
    }
  }

  /* ── Public Endpoints ────────────────────── */
  const publicApi = {
    getVehicles: (p) => request('/public/vehicles' + (p ? '?' + p : '')),
    getVehicle: (id) => request('/public/vehicles/' + id),
    getPackages: (p) => request('/public/packages' + (p ? '?' + p : '')),
    getPackage: (slug) => request('/public/packages/' + slug),
    getStats: () => request('/public/stats'),
    createBooking: (d) => request('/bookings', { method: 'POST', body: d }),
    createContact: (d) => request('/contacts', { method: 'POST', body: d })
  };

  /* ── Admin Endpoints ─────────────────────── */
  const adminApi = {
    /* Auth */
    login: async (d, remember = true) => {
      const res = await request('/admin/login', {
        method: 'POST',
        body: d
      });
      if (res.success && res.token) {
        setToken(res.token, remember);
      }
      return res;
    },
    register: (d) => request('/admin/register', { method: 'POST', body: d }),
    getMe: () => request('/admin/me'),
    getDashboard: () => request('/admin/dashboard'),
    changePassword: (d) => request('/admin/change-password', { method: 'PUT', body: d }),

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
    updateBookingStatus: (id, d) => request('/bookings/' + id + '/status', { method: 'PATCH', body: d }),
    deleteBooking: (id) => request('/bookings/' + id, { method: 'DELETE' }),

    /* Contacts */
    getContacts: (p) => request('/contacts' + (p ? '?' + p : '')),
    getContact: (id) => request('/contacts/' + id),
    deleteContact: (id) => request('/contacts/' + id, { method: 'DELETE' }),
    markRead: (id) => request('/contacts/' + id + '/read', { method: 'PATCH' }),
    markUnread: (id) => request('/contacts/' + id + '/unread', { method: 'PATCH' })
  };

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
console.log('✅ API module loaded');