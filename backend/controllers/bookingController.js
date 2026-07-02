const Booking = require('../models/Booking');
const { sendAllNotifications, sendUserEmail } = require('../utils/notifications');
const PDFDocument = require('pdfkit');

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
async function populateForNotification(booking) {
  return await Booking.findById(booking._id)
    .populate('vehicleId', 'name type model brand image seats luggage pricePerKm')
    .populate('packageId', 'title destination image duration');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatCurrency(n) {
  if (n == null) return '—';
  return '₹ ' + Number(n).toLocaleString('en-IN');
}

function parseNotes(notes) {
  if (!notes) return {};
  const parts = notes.split('|').map(s => s.trim());
  const result = {};
  parts.forEach(p => {
    const idx = p.indexOf(':');
    if (idx > -1) {
      const key = p.substring(0, idx).trim();
      const value = p.substring(idx + 1).trim();
      result[key] = value;
    }
  });
  return result;
}

/* ─────────────────────────────────────────────
   GET ALL BOOKINGS
───────────────────────────────────────────── */
exports.getAllBookings = async (req, res) => {
  try {
    const {
      status,
      bookingType,
      paymentStatus,
      search,
      page = 1,
      limit = 10
    } = req.query;

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

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('vehicleId', 'name type brand image model seats luggage')
        .populate('packageId', 'title destination image duration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
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
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────
   GET BOOKING BY ID / BOOKING ID
───────────────────────────────────────────── */
exports.getBookingById = async (req, res) => {
  try {
    const id = req.params.id;

    let booking = null;

    // If Mongo ObjectId length looks valid, try _id first
    if (/^[a-f\d]{24}$/i.test(id)) {
      booking = await Booking.findById(id)
        .populate('vehicleId')
        .populate('packageId');
    }

    // fallback: bookingId string
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

    const mapped = booking.toObject();
    mapped.type = booking.bookingType;
    mapped.fullName = booking.name;
    mapped.vehicleName = booking.vehicleId ? booking.vehicleId.name : null;
    mapped.packageName = booking.packageId ? (booking.packageId.title || booking.packageId.name) : null;

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────
   CREATE BOOKING
───────────────────────────────────────────── */
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

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
    console.error('createBooking error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────
   UPDATE BOOKING
───────────────────────────────────────────── */
exports.updateBooking = async (req, res) => {
  try {
    const id = req.params.id;

    let booking = null;

    if (/^[a-f\d]{24}$/i.test(id)) {
      booking = await Booking.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
    }

    if (!booking) {
      booking = await Booking.findOneAndUpdate(
        { bookingId: id },
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully.',
      data: booking
    });
  } catch (error) {
    console.error('updateBooking error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────
   DELETE BOOKING
───────────────────────────────────────────── */
exports.deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;

    let booking = null;

    if (/^[a-f\d]{24}$/i.test(id)) {
      booking = await Booking.findByIdAndDelete(id);
    }

    if (!booking) {
      booking = await Booking.findOneAndDelete({ bookingId: id });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully.'
    });
  } catch (error) {
    console.error('deleteBooking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────
   UPDATE BOOKING STATUS
───────────────────────────────────────────── */
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
      try {
        const populated = await populateForNotification(booking);
        sendAllNotifications(populated).catch(e =>
          console.warn('Status update notification failed:', e.message)
        );
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
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────
   DOWNLOAD BOOKING PDF
   GET /api/bookings/:id/pdf
   Supports Mongo _id OR bookingId
───────────────────────────────────────────── */
exports.downloadBookingPDF = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('📄 Downloading itinerary for booking:', id);

    let booking = null;

    if (/^[a-f\d]{24}$/i.test(id)) {
      booking = await Booking.findById(id)
        .populate('vehicleId')
        .populate('packageId');
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

    const notes = parseNotes(booking.notes);
    const vehicleName = booking.vehicleId?.name || 'N/A';
    const vehicleModel = booking.vehicleId?.model || booking.vehicleId?.type || '';

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="booking-${booking.bookingId}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#6E1F2B').text('VOYAGO TOURS & TRAVELS', {
      align: 'center'
    });
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor('#111').text('Booking Confirmation', {
      align: 'center'
    });
    doc.moveDown();

    // Booking ref
    doc.fontSize(12).fillColor('#666').text('Booking Reference');
    doc.fontSize(16).fillColor('#6E1F2B').text(booking.bookingId);
    doc.moveDown();

    // Customer
    doc.fontSize(14).fillColor('#111').text('Customer Details', { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(11).fillColor('#222');
    doc.text(`Name: ${booking.name}`);
    doc.text(`Email: ${booking.email}`);
    doc.text(`Phone: ${booking.phone}`);
    if (booking.gstNumber) doc.text(`GST Number: ${booking.gstNumber}`);
    doc.moveDown();

    // Trip
    doc.fontSize(14).text('Trip Details', { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(11);
    doc.text(`Pickup: ${booking.pickupLocation || '—'}`);
    doc.text(`Drop-off: ${booking.dropoffLocation || '—'}`);
    doc.text(`Pickup Date: ${formatDate(booking.pickupDate)}`);
    if (booking.returnDate) doc.text(`Return Date: ${formatDate(booking.returnDate)}`);
    doc.text(`Trip Type: ${notes['Trip Type'] || booking.bookingType || '—'}`);
    doc.text(`Time: ${notes['Time'] || '—'}`);
    doc.text(`Distance: ${notes['Distance'] || '—'}`);
    doc.text(`Duration: ${notes['Duration'] || '—'}`);
    doc.text(`Passengers: ${booking.numberOfPeople || '—'}`);
    doc.text(`Luggage: ${notes['Luggage'] || '—'}`);
    if (notes['Special Instructions']) {
      doc.text(`Special Instructions: ${notes['Special Instructions']}`);
    }
    doc.moveDown();

    // Vehicle
    doc.fontSize(14).text('Vehicle Details', { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(11);
    doc.text(`Vehicle: ${vehicleName}${vehicleModel ? ' - ' + vehicleModel : ''}`);
    doc.text(`Seats: ${booking.vehicleId?.seats || '—'}`);
    doc.text(`Bags: ${booking.vehicleId?.luggage || '—'}`);
    doc.moveDown();

    // Fare
    doc.fontSize(14).text('Fare Details', { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(11);
    if (notes['Base Fare']) doc.text(`Base Fare: ${notes['Base Fare']}`);
    if (notes['Distance Charge']) doc.text(`Distance Charge: ${notes['Distance Charge']}`);
    if (notes['Driver Allowance']) doc.text(`Driver Allowance: ${notes['Driver Allowance']}`);
    if (notes['Toll & Parking']) doc.text(`Toll & Parking: ${notes['Toll & Parking']}`);
    if (notes['Taxes & Fees']) doc.text(`Taxes & Fees: ${notes['Taxes & Fees']}`);
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#6E1F2B').text(`Estimated Total: ${formatCurrency(booking.totalPrice)}`);

    doc.moveDown(2);
    doc.fontSize(10).fillColor('#666').text(
      'Thank you for choosing Voyago Tours & Travels.',
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('downloadBookingPDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

/* ─────────────────────────────────────────────
   SEND BOOKING PDF / EMAIL
   POST /api/bookings/send-pdf
   body: { bookingId, email }
───────────────────────────────────────────── */
exports.sendBookingPDFByEmail = async (req, res) => {
  try {
    const { bookingId, email } = req.body;

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

    if (email) booking.email = email;

    await sendUserEmail(booking);

    return res.json({
      success: true,
      message: `Booking email sent successfully to ${booking.email}`
    });
  } catch (error) {
    console.error('sendBookingPDFByEmail error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};