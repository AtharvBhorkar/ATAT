const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true
    },
    bookingId: {
      type: String,
      ref: 'Booking',
      required: [true, 'Booking ID is required']
    },
    customer: {
      type: String,
      required: [true, 'Customer name is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required']
    },
    method: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['UPI', 'Cash', 'Card', 'Net Banking', 'Online', 'Others']
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['paid', 'failed', 'pending'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate payment ID before saving
paymentSchema.pre('save', function (next) {
  if (!this.paymentId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.paymentId = `PAY-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
