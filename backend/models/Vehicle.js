const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: ['sedan', 'suv', 'muv', 'tempo', 'bus', 'luxury', 'hatchback', 'van', 'bike']
    },
    brand: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    year: {
      type: Number
    },
    seats: {
      type: Number,
      default: 4
    },
    bags: {
      type: Number,
      default: 0
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng']
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic']
    },
    ac: {
      type: Boolean,
      default: true
    },
    pricePerDay: {
      type: Number
    },
    dailyRate: {
      type: Number
    },
    pricePerKm: {
      type: Number
    },
    image: {
      type: String
    },
    images: [{
      type: String
    }],
    features: [{
      type: String
    }],
    available: {
      type: Boolean,
      default: true
    },
    badge: {
      type: String,
      default: ''
    },
    badgeClass: {
      type: String,
      default: ''
    },
    description: {
      type: String
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalTrips: {
      type: Number,
      default: 0
    },
    totalKmLakhs: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);