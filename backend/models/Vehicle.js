const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    stars: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
    },
  },
  { _id: false }
);

// ===============================
// TYPE NORMALIZATION
// Accepts any casing ("suv", "Suv", "SUV", " suv ")
// and maps it to the canonical enum value below.
// This fixes "`suv` is not a valid enum value" errors
// caused by legacy lowercase data or inconsistent
// casing from different parts of the frontend.
// ===============================
const VEHICLE_TYPES = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Van",
  "Luxury",
  "Electric",
  "Hybrid",
  "MUV",
  "Mini Bus",
];

const TYPE_ALIAS_MAP = {
  sedan: "Sedan",
  suv: "SUV",
  hatchback: "Hatchback",
  van: "Van",
  luxury: "Luxury",
  electric: "Electric",
  hybrid: "Hybrid",
  muv: "MUV",
  "mini bus": "Mini Bus",
  minibus: "Mini Bus",
  "mini-bus": "Mini Bus",
  bus: "Mini Bus",
};

function normalizeVehicleType(value) {
  if (value === null || value === undefined) return value;
  var raw = String(value).trim();
  if (!raw) return raw;
  // Already an exact canonical match — pass through untouched
  if (VEHICLE_TYPES.indexOf(raw) !== -1) return raw;
  var key = raw.toLowerCase();
  return TYPE_ALIAS_MAP[key] || raw; // fall through so enum still reports unknown values clearly
}

const vehicleSchema = new mongoose.Schema(
  {
    // ===============================
    // BASIC DETAILS
    // ===============================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
      trim: true,
      set: normalizeVehicleType,
    },

    brand: String,

    model: String,

    year: Number,

    // ===============================
    // SPECIFICATIONS
    // ===============================

    seats: {
      type: Number,
      default: 4,
    },

    bags: {
      type: Number,
      default: 2,
    },

    fuelType: String,

    transmission: {
      type: String,
    },

    mileage: String,

    ac: {
      type: Boolean,
      default: true,
    },

    // ===============================
    // PRICING
    // ===============================

    pricePerKm: {
      type: Number,
      required: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
    },

    minimumFare: {
      type: Number,
      default: 0,
    },

    advance: {
      type: Number,
      default: 0,
    },

    advancePercentage: {
      type: Number,
      default: 10,
    },

    driverCharges: {
      type: String,
      default: "Included",
    },

    tollParking: {
      type: String,
      default: "Extra",
    },

    balanceDue: {
      type: String,
      default: "Journey Day",
    },

    // ===============================
    // IMAGES
    // ===============================

    image: String,

    images: [
      {
        type: String,
      },
    ],

    // ===============================
    // ROUTES
    // (was missing — admin UI "Available Routes"
    // field had nowhere to persist to before this)
    // ===============================

    routes: [
      {
        type: String,
      },
    ],

    // ===============================
    // CONTENT
    // ===============================

    description: String,

    whyChoose: String,

    // ===============================
    // FEATURES
    // ===============================

    features: [
      {
        type: String,
      },
    ],

    amenities: [
      {
        type: String,
      },
    ],

    highlights: [
      {
        type: String,
      },
    ],

    idealFor: [
      {
        type: String,
      },
    ],

    // ===============================
    // POLICY
    // ===============================

    cancellationPolicy: {
      type: String,
      default: "Free cancellation up to 24 hours before pickup.",
    },

    // ===============================
    // REVIEW
    // ===============================

    reviews: [reviewSchema],

    // ===============================
    // STATUS
    // ===============================

    available: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "maintenance", "disabled"],
      default: "active",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    badge: {
      type: String,
      default: "",
    },

    badgeClass: {
      type: String,
      default: "",
    },

    // ===============================
    // STATS
    // ===============================

    rating: {
      type: Number,
      default: 0,
    },

    totalTrips: {
      type: Number,
      default: 0,
    },

    totalKmLakhs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);