const express = require('express');
const router = express.Router();

const adminAuthController = require('../controllers/adminAuthController');
const { protect } = require('../middleware/authMiddleware');

console.log('register:', typeof adminAuthController.register);
console.log('login:', typeof adminAuthController.login);
console.log('logout:', typeof adminAuthController.logout);
console.log('dashboard:', typeof adminAuthController.dashboard);
console.log('getMe:', typeof adminAuthController.getMe);
console.log('protect:', typeof protect);

// Public routes
router.post('/register', adminAuthController.register);
router.post('/login', adminAuthController.login);
router.post('/logout', adminAuthController.logout);

// Protected routes
router.get('/dashboard', protect, adminAuthController.dashboard);
router.get('/me', protect, adminAuthController.getMe);

module.exports = router;