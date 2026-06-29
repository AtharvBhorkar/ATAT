const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: ['sedan', 'suv', 'hatchback', 'van', 'bus', 'tempo-traveller', 'bike', 'luxury']
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
    }
  },
  {
    timestamps: true
  }
);

vehicleSchema.pre('save', function (next) {
  if (this.dailyRate && !this.pricePerDay) {
    this.pricePerDay = this.dailyRate;
  } else if (this.pricePerDay && !this.dailyRate) {
    this.dailyRate = this.pricePerDay;
  }
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);