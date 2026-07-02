const express = require('express');
const router = express.Router();

const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  downloadBookingPDF,
  sendBookingPDFByEmail
} = require('../controllers/bookingController');

// PUBLIC
router.post('/', createBooking);
router.get('/:id/pdf', downloadBookingPDF);
router.post('/send-pdf', sendBookingPDFByEmail);

// ADMIN / GENERAL
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;