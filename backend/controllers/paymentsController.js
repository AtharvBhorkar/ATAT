const Payment = require('../models/Payment');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { paymentId: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } },
        { customer: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(query).sort({ date: -1 }).skip(skip).limit(limitNum),
      Payment.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a payment record
// @route   POST /api/payments
// @access  Private (Admin only)
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Payment record created successfully.',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Retry payment
// @route   PATCH /api/payments/:id/retry
// @access  Private (Admin only)
exports.retryPayment = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    let payment;
    
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      payment = await Payment.findOne({
        $or: [{ _id: req.params.id }, { paymentId: req.params.id }]
      });
    } else {
      payment = await Payment.findOne({ paymentId: req.params.id });
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.'
      });
    }

    payment.status = 'paid';
    payment.date = new Date();
    await payment.save();

    res.json({
      success: true,
      message: `Payment ${payment.paymentId} retried successfully!`,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
