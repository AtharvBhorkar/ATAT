const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  dashboard,
  getMe
} = require('../controllers/adminAuthController');

const { protect } = require('../middleware/authMiddleware'); // adjust path if needed

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/dashboard', protect, dashboard);
router.get('/me', protect, getMe);

module.exports = router;