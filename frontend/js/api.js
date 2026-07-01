/* ═══════════════════════════════════════════════
   VOYAGO — Shared API Utility
   Used by both admin dashboard and public pages
════════════════════════════════════════════════ */

const API = (() => {
  /* Change this to match your backend — include or exclude /admin/ prefix as needed */
  const BASE = window.location.origin + '/api';

  function getToken() {
    try {
      return localStorage.getItem('voyago_token') || sessionStorage.getItem('voyago_token');
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
    } catch (e) {
      /* storage full or blocked — ignore */
    }
  }

  function clearToken() {
    try {
      localStorage.removeItem('voyago_token');
      sessionStorage.removeItem('voyago_token');
    } catch (e) { /* ignore */ }
  }

  /* Core request — returns parsed JSON or error object */
  async function request(endpoint, options) {
    if (options === undefined) options = {};
    var url = endpoint.indexOf('http') === 0 ? endpoint : BASE + endpoint;
    var token = getToken();

    var config = {
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    /* Merge caller headers */
    if (options.headers) {
      var keys = Object.keys(options.headers);
      for (var i = 0; i < keys.length; i++) {
        config.headers[keys[i]] = options.headers[keys[i]];
      }
    }

    /* Attach auth token */
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }

    /* Serialize body (skip if already a string, e.g. FormData) */
    if (options.body !== undefined && options.body !== null) {
      if (typeof options.body === 'string') {
        config.body = options.body;
      } else if (options.body instanceof FormData) {
        config.body = options.body;
        delete config.headers['Content-Type']; /* let browser set multipart boundary */
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    try {
      var res = await fetch(url, config);

      /* 204 No Content */
      if (res.status === 204) {
        return { success: true };
      }

      /* Try to parse JSON */
      var data;
      var text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        if (res.ok) {
          return { success: true, raw: text };
        }
        return { success: false, message: 'Invalid server response (' + res.status + ')' };
      }

      /* If backend returns success flag, use it; otherwise infer from HTTP status */
      if (data.success === undefined) {
        data.success = res.ok;
      }

      /* 401 — session expired */
      if (res.status === 401) {
        clearToken();
        data.unauthenticated = true;
        if (window.location.pathname.indexOf('dashboard') !== -1) {
          setTimeout(function () {
            window.location.href = '/admin';
          }, 800);
        }
      }

      return data;

    } catch (err) {
      console.error('API Error:', endpoint, err);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  }

  /* ─── PUBLIC ENDPOINTS (no auth required) ─── */
  var publicApi = {
    getVehicles: function (params) {
      return request('/public/vehicles' + (params ? '?' + params : ''));
    },
    getVehicle: function (id) {
      return request('/public/vehicles/' + id);
    },
    getPackages: function (params) {
      return request('/public/packages' + (params ? '?' + params : ''));
    },
    getPackage: function (slug) {
      return request('/public/packages/' + slug);
    },
    getStats: function () {
      return request('/public/stats');
    },
    createBooking: function (data) {
      return request('/bookings', { method: 'POST', body: data });
    },
    createContact: function (data) {
      return request('/contacts', { method: 'POST', body: data });
    }
  };

  /* ─── ADMIN ENDPOINTS (auth required) ─── */
  var adminApi = {
    /* Auth */
    login: function (data) {
      return request('/admin/login', { method: 'POST', body: data });
    },
    getMe: function () {
      return request('/admin/me');
    },
    changePassword: function (data) {
      return request('/admin/change-password', { method: 'PUT', body: data });
    },

    /* Dashboard */
    getDashboard: function () {
      return request('/admin/dashboard');
    },

    /* Vehicles — adjust prefix if your backend uses /admin/vehicles */
    getVehicles: function (params) {
      return request('/vehicles' + (params ? '?' + params : ''));
    },
    getVehicle: function (id) {
      return request('/vehicles/' + id);
    },
    createVehicle: function (data) {
      return request('/vehicles', { method: 'POST', body: data });
    },
    updateVehicle: function (id, data) {
      return request('/vehicles/' + id, { method: 'PUT', body: data });
    },
    deleteVehicle: function (id) {
      return request('/vehicles/' + id, { method: 'DELETE' });
    },
    toggleVehicle: function (id) {
      return request('/vehicles/' + id + '/toggle', { method: 'PATCH' });
    },

    /* Packages */
    getPackages: function (params) {
      return request('/packages' + (params ? '?' + params : ''));
    },
    getPackage: function (id) {
      return request('/packages/' + id);
    },
    createPackage: function (data) {
      return request('/packages', { method: 'POST', body: data });
    },
    updatePackage: function (id, data) {
      return request('/packages/' + id, { method: 'PUT', body: data });
    },
    deletePackage: function (id) {
      return request('/packages/' + id, { method: 'DELETE' });
    },
    togglePackage: function (id) {
      return request('/packages/' + id + '/toggle', { method: 'PATCH' });
    },
    toggleFeatured: function (id) {
      return request('/packages/' + id + '/featured', { method: 'PATCH' });
    },

    /* Bookings */
    getBookings: function (params) {
      return request('/bookings' + (params ? '?' + params : ''));
    },
    getBooking: function (id) {
      return request('/bookings/' + id);
    },
    updateBooking: function (id, data) {
      return request('/bookings/' + id, { method: 'PUT', body: data });
    },
    updateBookingStatus: function (id, data) {
      return request('/bookings/' + id + '/status', { method: 'PATCH', body: data });
    },
    deleteBooking: function (id) {
      return request('/bookings/' + id, { method: 'DELETE' });
    },

    /* Contacts */
    getContacts: function (params) {
      return request('/contacts' + (params ? '?' + params : ''));
    },
    getContact: function (id) {
      return request('/contacts/' + id);
    },
    deleteContact: function (id) {
      return request('/contacts/' + id, { method: 'DELETE' });
    },
    markRead: function (id) {
      return request('/contacts/' + id + '/read', { method: 'PATCH' });
    },
    markUnread: function (id) {
      return request('/contacts/' + id + '/unread', { method: 'PATCH' });
    }
  };

  return {
    request: request,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    public: publicApi,
    admin: adminApi
  };
})();

window.API = API;