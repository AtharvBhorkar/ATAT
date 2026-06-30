const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    bookingType: {
      type: String,
      required: [true, 'Booking type is required'],
      enum: ['vehicle', 'package']
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      default: null
    },
    pickupDate: {
      type: Date
    },
    returnDate: {
      type: Date
    },
    pickupLocation: {
      type: String,
      trim: true
    },
    dropoffLocation: {
      type: String,
      trim: true
    },
    numberOfPeople: {
      type: Number,
      default: 1
    },
    numberOfDays: {
      type: Number
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required']
    },
    advancePaid: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    cancelReason: {
      type: String
    },
    notes: {
      type: String
    },
    gstNumber: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate booking ID before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingId = `VYG-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);