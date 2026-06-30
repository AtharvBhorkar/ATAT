const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Package title is required'],
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Duration is required']
    },
    durationDays: {
      type: Number
    },
    durationNights: {
      type: Number
    },
    price: {
      type: Number,
      required: [true, 'Price is required']
    },
    discountPrice: {
      type: Number
    },
    image: {
      type: String
    },
    images: [{
      type: String
    }],
    includes: [{
      type: String
    }],
    excludes: [{
      type: String
    }],
    itinerary: [{
      day: Number,
      title: String,
      description: String
    }],
    maxPeople: {
      type: Number,
      default: 10
    },
    minPeople: {
      type: Number,
      default: 1
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard'],
      default: 'easy'
    },
    category: {
      type: String,
      enum: ['adventure', 'pilgrimage', 'beach', 'hill-station', 'wildlife', 'heritage', 'honeymoon', 'family'],
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalBookings: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate slug before saving
packageSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Package', packageSchema);