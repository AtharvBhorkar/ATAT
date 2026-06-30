const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus
} = require('../controllers/bookingController');
const verifyAdmin = require('../middleware/verifyAdmin');

// Public route for customers to create bookings
router.post('/', createBooking);

// Protected routes for admin
router.get('/', verifyAdmin, getAllBookings);
router.get('/:id', verifyAdmin, getBookingById);
router.put('/:id', verifyAdmin, updateBooking);
router.delete('/:id', verifyAdmin, deleteBooking);
router.patch('/:id/status', verifyAdmin, updateBookingStatus);

module.exports = router;