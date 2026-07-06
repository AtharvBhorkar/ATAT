const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const verifyAdmin = require('../middleware/verifyAdmin');

// All settings routes are protected
router.use(verifyAdmin);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;
