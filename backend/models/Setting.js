const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'Voyago Rentals'
    },
    address: {
      type: String,
      default: '123 Business Park, Mumbai'
    },
    phone: {
      type: String,
      default: '+91-1800-VOYAGO'
    },
    email: {
      type: String,
      default: 'admin@voyago.com'
    },
    gstNumber: {
      type: String,
      default: '18AABCO1234H1Z0'
    },
    lateReturnCharge: {
      type: Number,
      default: 500
    },
    gstPercentage: {
      type: Number,
      default: 18
    },
    securityDeposit: {
      type: Number,
      default: 5000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Setting', settingSchema);
