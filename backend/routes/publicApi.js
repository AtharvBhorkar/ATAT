const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const { getImageUrl } = require('../utils/imageUtils');

function mapVehicle(v) {
  let primaryImage = v.image;
  if (!primaryImage || primaryImage === 'undefined') {
    primaryImage = (v.images && v.images.length > 0) ? v.images[0] : '';
  }

  return {
    _id: v._id,
    name: v.name || '',
    type: v.type || '',
    brand: v.brand || '',
    model: v.model || '',
    year: v.year || null,
    seats: v.seats || 4,
    luggage: v.luggage || v.bags || 2,
    fuel: v.fuel || v.fuelType || '',
    transmission: v.transmission || '',
    mileage: v.mileage || '',
    ac: v.ac !== false,
    pricePerKm: v.pricePerKm || 0,
    pricePerDay: v.pricePerDay || v.dailyRate || 0,
    minFare: v.minFare || 0,
    rating: v.rating || 0,
    totalTrips: v.totalTrips || 0,
    image: getImageUrl(primaryImage),
    images: (v.images || []).map(img => getImageUrl(img)),
    features: v.features || [],
    description: v.description || '',
    note: v.note || v.description || '',
    availability: v.available !== undefined ? v.available : true,
    isActive: v.status ? v.status === 'active' : v.available !== false,
    status: v.status || (v.available !== false ? 'active' : 'disabled'),
    badge: v.badge || '',
    badgeClass: v.badgeClass || '',
    featured: v.featured || false,
    slug: v.slug || '',
    createdAt: v.createdAt,
    updatedAt: v.updatedAt
  };
}

function mapPackage(p) {
  let primaryImage = p.image;
  if (!primaryImage || primaryImage === 'undefined') {
    primaryImage = (p.images && p.images.length > 0) ? p.images[0] : '';
  }

  return {
    _id: p._id,
    title: p.title || p.name || '',
    name: p.name || p.title || '',
    slug: p.slug || '',
    category: p.category || '',
    destination: p.destination || '',
    state: p.state || '',
    duration: p.duration || '',
    durationNights: p.durationNights || p.durationDays || 1,
    price: p.price || 0,
    originalPrice: p.originalPrice || p.discountPrice || null,
    discountPrice: p.discountPrice || p.originalPrice || null,
    description: p.description || '',
    includes: p.includes || [],
    excludes: p.excludes || [],
    image: getImageUrl(primaryImage),
    images: (p.images || []).map(img => getImageUrl(img)),
    active: p.active !== false,
    isActive: p.active !== false,
    status: p.active !== false ? 'active' : 'disabled',
    featured: p.featured || false,
    rating: p.rating || 0,
    totalBookings: p.totalBookings || 0,
    maxPeople: p.maxPeople || 10,
    minPeople: p.minPeople || 1,
    difficulty: p.difficulty || 'easy',
    itinerary: p.itinerary || [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  };
}

/* ═══ STATS ═══ */
router.get('/stats', async (req, res) => {
  try {
    const [totalBookings, totalVehicles, totalPackages, totalContacts, availableVehicles] = await Promise.all([
      Booking.countDocuments(),
      Vehicle.countDocuments(),
      Package.countDocuments(),
      Contact.countDocuments(),
      Vehicle.countDocuments({ available: true })
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBookings = await Booking.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const featuredVehicles = await Vehicle.find({ available: true })
      .sort({ totalTrips: -1 })
      .limit(4);
    const featuredPackages = await Package.find({ active: true, featured: true })
      .sort({ totalBookings: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        totalBookings,
        totalVehicles,
        totalPackages,
        totalContacts,
        availableVehicles,
        recentBookings,
        featuredVehicles: featuredVehicles.map(mapVehicle),
        featuredPackages: featuredPackages.map(mapPackage)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══ VEHICLES ═══ */
router.get('/vehicles', async (req, res) => {
  try {
    const { available, limit, type, sort, search } = req.query;
    const query = {};

    if (available === 'true') {
      query.available = true;
    } else if (available === 'false') {
      query.available = false;
    }

    if (type) {
      query.type = { $regex: type, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    let vehicleQuery = Vehicle.find(query);

    if (sort === 'price-low') {
      vehicleQuery = vehicleQuery.sort({ pricePerKm: 1 });
    } else if (sort === 'price-high') {
      vehicleQuery = vehicleQuery.sort({ pricePerKm: -1 });
    } else if (sort === 'seats') {
      vehicleQuery = vehicleQuery.sort({ seats: 1 });
    } else if (sort === 'popular') {
      vehicleQuery = vehicleQuery.sort({ totalTrips: -1 });
    } else if (sort === 'rating') {
      vehicleQuery = vehicleQuery.sort({ rating: -1 });
    } else {
      vehicleQuery = vehicleQuery.sort({ createdAt: -1 });
    }

    if (limit) {
      vehicleQuery = vehicleQuery.limit(parseInt(limit));
    }

    const vehicles = await vehicleQuery;
    const mapped = vehicles.map(mapVehicle);

    res.json({
      success: true,
      vehicles: mapped,
      data: mapped
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══ PACKAGES ═══ */
router.get('/packages', async (req, res) => {
  try {
    const { limit, destination, active, sort, category, search, minPrice, maxPrice } = req.query;
    const query = {};

    if (active === 'true') {
      query.active = true;
    } else if (active === 'false') {
      query.active = false;
    } else {
      query.active = true;
    }

    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }

    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }
    if (maxPrice) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    let packageQuery = Package.find(query);

    if (sort === 'price-low') {
      packageQuery = packageQuery.sort({ price: 1 });
    } else if (sort === 'price-high') {
      packageQuery = packageQuery.sort({ price: -1 });
    } else if (sort === 'duration') {
      packageQuery = packageQuery.sort({ durationNights: 1 });
    } else if (sort === 'popular') {
      packageQuery = packageQuery.sort({ totalBookings: -1 });
    } else if (sort === 'rating') {
      packageQuery = packageQuery.sort({ rating: -1 });
    } else {
      packageQuery = packageQuery.sort({ createdAt: -1 });
    }

    if (limit) {
      packageQuery = packageQuery.limit(parseInt(limit));
    }

    const packages = await packageQuery;
    const mapped = packages.map(mapPackage);

    res.json({
      success: true,
      packages: mapped,
      data: mapped
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══ SINGLE VEHICLE ═══ */
router.get('/vehicles/:id', async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const vehicle = await Vehicle.findOne(
      isObjectId
        ? { $or: [{ _id: req.params.id }, { slug: req.params.id }] }
        : { slug: req.params.id }
    );

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.json({ success: true, data: mapVehicle(vehicle) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══ SINGLE PACKAGE ═══ */
router.get('/packages/:id', async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const pkg = await Package.findOne(
      isObjectId
        ? { $or: [{ _id: req.params.id }, { slug: req.params.id }] }
        : { slug: req.params.id }
    );

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    res.json({ success: true, data: mapPackage(pkg) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;