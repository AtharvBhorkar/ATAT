const express = require('express');
const router = express.Router();
const { register, login, dashboard, getMe } = require('../controllers/adminAuthController');
const verifyAdmin = require('../middleware/verifyAdmin');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyAdmin, getMe);
router.get('/dashboard', verifyAdmin, dashboard);

module.exports = router;