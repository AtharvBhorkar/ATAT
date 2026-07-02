
(function () {
    var $ = function (s) { return document.querySelector(s); };

    /* ═══════ NO SECRET KEY IN FRONTEND CODE ═══════
       The key is validated exclusively on the server
       via process.env.ADMIN_SECRET_KEY.             */

    // ── Toast ──
    function showToast(message, type) {
        type = type || 'info';
        var container = $('#toastContainer');
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        var icons = {
            success: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        toast.innerHTML = icons[type] + '<span>' + message + '</span><div class="toast-progress"></div>';
        container.appendChild(toast);
        setTimeout(function () { toast.classList.add('removing'); setTimeout(function () { toast.remove(); }, 300); }, 3500);
    }

    // ── Error helpers ──
    function setError(fieldId, msg) {
        document.getElementById(fieldId).closest('.field').classList.add('has-error');
        var errEl = document.getElementById(fieldId + '-error');
        if (errEl && msg) errEl.textContent = msg;
    }
    function clearError(fieldId) {
        var el = document.getElementById(fieldId);
        if (el) el.closest('.field').classList.remove('has-error');
    }

    // ── Password toggles ──
    function setupToggle(btnId, inputId, iconId) {
        $(btnId).addEventListener('click', function () {
            var input = $(inputId);
            var isPwd = input.type === 'password';
            input.type = isPwd ? 'text' : 'password';
            this.setAttribute('aria-pressed', String(isPwd));
            this.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
            $(iconId).innerHTML = isPwd
                ? '<path d="M3 3l18 18"/><path d="M10.6 6.1A10.6 10.6 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 4M6.2 7.7A17 17 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'
                : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
        });
    }
    setupToggle('#loginTogglePwd', '#loginPassword', '#loginEyeIcon');
    setupToggle('#regTogglePwd', '#regPassword', '#regEyeIcon');
    setupToggle('#regToggleConfirm', '#regConfirm', '#regConfirmEyeIcon');

    // ── Password strength ──
    var strengthBar = $('#strengthBar');
    var strengthLabel = $('#strengthLabel');
    $('#regPassword').addEventListener('input', function () {
        var val = this.value, score = 0;
        if (val.length >= 6) score++;
        if (val.length >= 10) score++;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
        if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;
        strengthBar.className = 'strength-bar';
        if (val.length === 0) { strengthLabel.innerHTML = '&nbsp;'; strengthLabel.style.color = 'var(--gray)'; return; }
        var labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        var colors = ['', 'var(--error)', '#e67e22', 'var(--gold)', 'var(--success)'];
        if (score > 0) { strengthBar.classList.add('s' + score); strengthLabel.textContent = labels[score]; strengthLabel.style.color = colors[score]; }
    });

    // ── Clear errors on input ──
    ['loginEmail', 'loginPassword', 'regName', 'regEmail', 'regPassword', 'regConfirm', 'regKey'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', function () { clearError(id); });
    });

    // ── Key auto-format (cosmetic only — real validation is server-side) ──
    $('#regKey').addEventListener('input', function () {
        clearError('regKey');
        var val = this.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        var f = '';
        for (var i = 0; i < val.length && i < 12; i++) { if (i > 0 && i % 4 === 0) f += '-'; f += val[i]; }
        this.value = f;
    });

    /* ═══════════════════════════════════════════════
       TOKEN KEY — must match js/api.js (voyago_token)
       Using a helper to stay DRY and prevent future drift
       ═══════════════════════════════════════════════ */
    var TOKEN_KEY = 'voyago_token';

    function storeToken(token, remember) {
        try {
            if (remember) {
                localStorage.setItem(TOKEN_KEY, token);
                sessionStorage.removeItem(TOKEN_KEY);
            } else {
                sessionStorage.setItem(TOKEN_KEY, token);
                localStorage.removeItem(TOKEN_KEY);
            }
        } catch (e) { /* storage blocked */ }
    }

    function retrieveToken() {
        try { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); }
        catch (e) { return null; }
    }

    function removeToken() {
        try { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); } catch (e) { }
    }

    // ── LOGIN ──
    $('#loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
    
        clearError('loginEmail');
        clearError('loginPassword');
    
        var email = $('#loginEmail').value.trim();
        var password = $('#loginPassword').value;
        var valid = true;
    
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('loginEmail', 'Please enter a valid admin email address.');
            valid = false;
        }
    
        if (!password || password.length < 6) {
            setError('loginPassword', 'Password must be at least 6 characters.');
            valid = false;
        }
    
        if (!valid) return;
    
        var btn = $('#loginBtn');
        btn.classList.add('loading');
        btn.disabled = true;
    
        fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        })
        .then(async function (res) {
            let data;
            try {
                data = await res.json();
            } catch (err) {
                throw new Error('Server returned invalid JSON');
            }
    
            console.log('LOGIN STATUS:', res.status);
            console.log('LOGIN RESPONSE:', data);
    
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Login failed');
            }
    
            // FIX: your API returns token + admin at top level
            storeToken(data.token, $('#remember').checked);
    
            showToast('Welcome back, ' + (data.admin?.name || 'Admin') + '!', 'success');
    
            setTimeout(function () {
                window.location.href = '/admin/dashboard';
            }, 800);
        })
        .catch(function (err) {
            console.error('Login error:', err);
            showToast(err.message || 'Login failed', 'error');
        })
        .finally(function () {
            btn.classList.remove('loading');
            btn.disabled = false;
        });
    });

    // ── REGISTER — key sent to server, validated server-side only ──
    $('#registerForm').addEventListener('submit', function (e) {
        e.preventDefault();
        ['regName', 'regEmail', 'regPassword', 'regConfirm', 'regKey'].forEach(clearError);
        var name = $('#regName').value.trim();
        var email = $('#regEmail').value.trim();
        var password = $('#regPassword').value;
        var confirm = $('#regConfirm').value;
        var key = $('#regKey').value.trim();
        var valid = true;
        if (!name) { setError('regName', 'Please enter your full name.'); valid = false; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('regEmail', 'Please enter a valid email address.'); valid = false; }
        if (!password || password.length < 6) { setError('regPassword', 'Password must be at least 6 characters.'); valid = false; }
        if (password !== confirm) { setError('regConfirm', 'Passwords do not match.'); valid = false; }
        if (!key || key.length < 11) { setError('regKey', 'Please enter a valid admin key.'); valid = false; }
        if (!valid) return;

        var btn = $('#regBtn');
        btn.classList.add('loading'); btn.disabled = true;

        fetch('/api/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password, secretKey: key })
        })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (!data.success) {
                    showToast(data.message || 'Registration failed.', 'error');
                    var msg = (data.message || '').toLowerCase();
                    if (msg.includes('key')) setError('regKey', data.message);
                    else if (msg.includes('email')) setError('regEmail', data.message);
                    else if (msg.includes('password')) setError('regPassword', data.message);
                    return;
                }
                showToast('Account created! You can now log in.', 'success');
                closeRegisterModal();
                $('#loginEmail').value = email;
                $('#loginPassword').focus();
            })
            .catch(function () { showToast('Network error. Is the server running?', 'error'); })
            .finally(function () { btn.classList.remove('loading'); btn.disabled = false; });
    });

    // ── Modal controls ──
    function openRegisterModal() {
        $('#registerModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(function () { $('#regName').focus(); }, 350);
    }
    function closeRegisterModal() {
        $('#registerModal').classList.remove('active');
        document.body.style.overflow = '';
        $('#registerForm').reset();
        ['regName', 'regEmail', 'regPassword', 'regConfirm', 'regKey'].forEach(clearError);
        strengthBar.className = 'strength-bar';
        strengthLabel.innerHTML = '&nbsp;'; strengthLabel.style.color = 'var(--gray)';
    }
    $('#openRegister').addEventListener('click', openRegisterModal);
    $('#closeRegister').addEventListener('click', closeRegisterModal);
    $('#backToLogin').addEventListener('click', closeRegisterModal);
    $('#registerModal').addEventListener('click', function (e) { if (e.target === this) closeRegisterModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#registerModal').classList.contains('active')) closeRegisterModal(); });

    // ── Auto-redirect if already logged in ──
    (function () {
        /* FIXED: use the SAME token key as api.js */
        var token = retrieveToken();
        if (!token) return;
        fetch('/api/admin/me', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.success) {
                    window.location.href = '/admin/dashboard';
                } else {
                    /* Token invalid — clear it so we don't loop */
                    removeToken();
                }
            })
            .catch(function () { /* stay on login */ });
    })();
})();
