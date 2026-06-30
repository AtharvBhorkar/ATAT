const Booking = require('../models/Booking');

// @desc    Get all bookings with filters and pagination
// @route   GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, bookingType, paymentStatus, search, from, to, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (bookingType) query.bookingType = bookingType;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('vehicleId', 'name type brand image')
        .populate('packageId', 'title destination image duration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicleId')
      .populate('packageId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a booking (public endpoint for customers)
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: booking
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a booking
// @route   PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully.',
      data: booking
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = status;
    if (status === 'cancelled' && cancelReason) {
      booking.cancelReason = cancelReason;
    }

    await booking.save();

    res.json({
      success: true,
      message: `Booking status updated to "${status}".`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};