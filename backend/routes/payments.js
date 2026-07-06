const express = require('express');
const router = express.Router();
const { getAllPayments, createPayment, retryPayment } = require('../controllers/paymentsController');
const verifyAdmin = require('../middleware/verifyAdmin');

// All payment routes are protected
router.use(verifyAdmin);

router.route('/')
  .get(getAllPayments)
  .post(createPayment);

router.route('/:id/retry')
  .patch(retryPayment);

module.exports = router;
