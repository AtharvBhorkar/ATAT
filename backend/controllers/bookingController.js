const Booking = require('../models/Booking');
const {
  sendAllNotifications,
  sendStatusUpdateNotifications,
  sendUserEmail
} = require('../utils/notifications');


/* ─────────────────────────────────────────────────────────────
   GET ALL BOOKINGS
───────────────────────────────────────────────────────────── */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicleId')
      .populate('packageId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('❌ getAllBookings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET BOOKING BY ID / BOOKING ID
───────────────────────────────────────────────────────────── */
exports.getBookingById = async (req, res) => {
  try {
    const id = req.params.id;
    let booking = null;

    // Try Mongo ObjectId first
    if (/^[a-f\d]{24}$/i.test(id)) {
      booking = await Booking.findById(id)
        .populate('vehicleId')
        .populate('packageId');
    }

    // If not found, try bookingId
    if (!booking) {
      booking = await Booking.findOne({ bookingId: id })
        .populate('vehicleId')
        .populate('packageId');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('❌ getBookingById error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   CREATE BOOKING — WITH ASYNC NOTIFICATIONS
───────────────────────────────────────────────────────────── */
// Add this at the top of the file


// Replace the entire createBooking function with this:
exports.createBooking = async (req, res) => {
  try {
    console.log('📝 Creating booking...');
    
    const booking = await Booking.create(req.body);
    console.log('✅ Booking created:', booking.bookingId);

    // Send notifications in background
    setImmediate(async () => {
      try {
        const populated = await Booking.findById(booking._id)
          .populate('vehicleId', 'name type model brand image seats luggage')
          .populate('packageId', 'title destination image duration');

        if (!populated) return;

        console.log('📨 Sending notifications...');
        await sendAllNotifications(populated);
        console.log('✅ Notifications sent');
      } catch (notifErr) {
        console.error('❌ Notification error:', notifErr.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created. Confirmation email being sent...',
      data: {
        _id: booking._id,
        bookingId: booking.bookingId,
        email: booking.email,  // ← EXPLICITLY RETURN EMAIL
        name: booking.name,
        phone: booking.phone,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation
      }
    });

  } catch (error) {
    console.error('❌ createBooking error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   UPDATE BOOKING
───────────────────────────────────────────────────────────── */
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('vehicleId')
      .populate('packageId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully.',
      data: booking
    });
  } catch (error) {
    console.error('❌ updateBooking error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE BOOKING
───────────────────────────────────────────────────────────── */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully.'
    });
  } catch (error) {
    console.error('❌ deleteBooking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   UPDATE BOOKING STATUS — WITH STATUS NOTIFICATIONS
───────────────────────────────────────────────────────────── */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const id = req.params.id;

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    let booking = null;

    if (/^[a-f\d]{24}$/i.test(id)) {
      booking = await Booking.findById(id);
    }

    if (!booking) {
      booking = await Booking.findOne({ bookingId: id });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const previousStatus = booking.status;

    booking.status = status;
    if (status === 'cancelled' && cancelReason) {
      booking.cancelReason = cancelReason;
    }

    await booking.save();

    if (previousStatus !== status) {
      console.log(`📢 Status changed: ${previousStatus} → ${status} for ${booking.bookingId}`);

      setImmediate(async () => {
        try {
          const populated = await Booking.findById(booking._id)
            .populate('vehicleId', 'name type model brand image seats luggage')
            .populate('packageId', 'title destination image duration');

          if (!populated) {
            console.error('❌ Could not find booking for status notifications');
            return;
          }

          console.log('📨 Sending status update notifications for:', booking.bookingId);
          await sendStatusUpdateNotifications(populated);
          console.log('✅ Status notification batch complete');
        } catch (notifErr) {
          console.warn('⚠️ Status notification error:', notifErr.message);
        }
      });
    }

    res.json({
      success: true,
      message: `Booking status updated to "${status}".`,
      data: booking
    });
  } catch (error) {
    console.error('❌ updateBookingStatus error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   DOWNLOAD BOOKING PDF
   (temporary safe placeholder so routes don't crash)
───────────────────────────────────────────────────────────── */
exports.downloadBookingPDF = async (req, res) => {
  try {
    const id = req.params.id;
    let booking = null;

    if (/^[a-f\d]{24}$/i.test(id)) {
      booking = await Booking.findById(id).populate('vehicleId').populate('packageId');
    }

    if (!booking) {
      booking = await Booking.findOne({ bookingId: id })
        .populate('vehicleId')
        .populate('packageId');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Replace this with real PDF generation later
    res.status(200).json({
      success: true,
      message: 'PDF download endpoint working. Add PDF generation logic here.',
      data: booking
    });
  } catch (error) {
    console.error('❌ downloadBookingPDF error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   SEND BOOKING PDF BY EMAIL
   (temporary safe placeholder so routes don't crash)
───────────────────────────────────────────────────────────── */
exports.sendBookingPDFByEmail = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId is required.'
      });
    }

    const booking = await Booking.findOne({ bookingId })
      .populate('vehicleId')
      .populate('packageId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // You can later replace this with actual PDF attachment logic
    const emailResult = await sendUserEmail(booking, false);

    if (emailResult?.success) {
      return res.status(200).json({
        success: true,
        message: `Booking email sent successfully to ${booking.email}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send booking email.'
    });
  } catch (error) {
    console.error('❌ sendBookingPDFByEmail error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ─────────────────────────────────────────────────────────────
   OPTIONAL: RESEND CONFIRMATION EMAIL
───────────────────────────────────────────────────────────── */
exports.resendConfirmationEmail = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId is required.'
      });
    }

    const booking = await Booking.findOne({ bookingId })
      .populate('vehicleId')
      .populate('packageId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const emailResult = await sendUserEmail(booking, false);

    if (emailResult.success) {
      res.json({
        success: true,
        message: `Confirmation email sent to ${booking.email}`,
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Email failed: ${emailResult.error || emailResult.reason}`
      });
    }
  } catch (error) {
    console.error('❌ resendConfirmationEmail error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};