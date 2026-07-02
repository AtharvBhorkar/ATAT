const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String
    },
    destination: {
      type: String,
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
      lowercase: true,
      trim: true,
      enum: ['adventure', 'pilgrimage', 'beach', 'hill-station', 'wildlife', 'heritage', 'honeymoon', 'family', 'cultural', 'mountain', 'city', '']
    },
    vehicles: {
      type: Number,
      default: 0
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
  if (this.name && !this.title) {
    this.title = this.name;
  } else if (this.title && !this.name) {
    this.name = this.title;
  }

  const slugSource = this.title || this.name || '';
  if (!this.slug && slugSource) {
    this.slug = slugSource
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Package', packageSchema);