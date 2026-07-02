const Booking = require('../models/Booking');
const { sendAllNotifications } = require('../utils/notifications');

/* ─── Helper: populate vehicle/package for notifications ─── */
async function populateForNotification(booking) {
  return await Booking.findById(booking._id)
    .populate('vehicleId', 'name type model brand image seats luggage pricePerKm')
    .populate('packageId', 'title destination image duration');
}


exports.getAllBookings = async (req, res) => {
  try {
    const { status, bookingType, paymentStatus, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (bookingType) query.bookingType = bookingType;
    if (paymentStatus) query.paymentStatus = paymentStatus;
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
        .sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Booking.countDocuments(query)
    ]);

    const mapped = bookings.map(b => {
      const obj = b.toObject();
      obj.type = b.bookingType;
      obj.fullName = b.name;
      obj.vehicleName = b.vehicleId ? b.vehicleId.name : null;
      obj.packageName = b.packageId ? (b.packageId.title || b.packageId.name) : null;
      return obj;
    });

    res.json({
      success: true,
      data: mapped,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum), limit: limitNum }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicleId')
      .populate('packageId');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const mapped = booking.toObject();
    mapped.type = booking.bookingType;
    mapped.fullName = booking.name;
    mapped.vehicleName = booking.vehicleId ? booking.vehicleId.name : null;
    mapped.packageName = booking.packageId ? (booking.packageId.title || booking.packageId.name) : null;

    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    /* ─── Send notifications (non-blocking but LOGGED) ─── */
    try {
      const populated = await populateForNotification(booking);
      console.log('📧 Sending notifications for booking:', booking.bookingId);
      
      sendAllNotifications(populated).catch(err => {
        console.error('❌ Notification batch error:', err.message);
      });
    } catch (notifErr) {
      console.error('❌ Could not populate for notifications:', notifErr.message);
    }

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

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, message: 'Booking updated successfully.', data: booking });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.json({ success: true, message: 'Booking deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const previousStatus = booking.status;
    booking.status = status;
    if (status === 'cancelled' && cancelReason) booking.cancelReason = cancelReason;
    await booking.save();

    if (previousStatus !== status) {
      try {
        const populated = await populateForNotification(booking);
        sendAllNotifications(populated).catch(e => console.warn('Status update notification failed:', e.message));
      } catch (e) {
        console.warn('Could not send status update notification:', e.message);
      }
    }

    res.json({
      success: true,
      message: `Booking status updated to "${status}".`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};