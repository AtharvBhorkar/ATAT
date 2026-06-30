const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Package = require('../models/Package');

// ─── VEHICLES (Public) ───

// Get all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const { type, fuelType, transmission, available, search, sort, page = 1, limit = 100 } = req.query;
    const query = {};
    if (type && type !== 'all') query.type = type;
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (available !== undefined) query.available = available === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { pricePerKm: 1 };
    if (sort === 'price-high') sortOption = { pricePerKm: -1 };
    if (sort === 'seats-asc') sortOption = { seats: 1 };
    if (sort === 'seats-desc') sortOption = { seats: -1 };
    if (sort === 'popular') sortOption = { totalTrips: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const vehicles = await Vehicle.find(query).sort(sortOption).limit(parseInt(limit));
    res.json({ success: true, data: vehicles, total: vehicles.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single vehicle by ID or slug
router.get('/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }]
    });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    const similar = await Vehicle.find({
      type: vehicle.type,
      _id: { $ne: vehicle._id },
      available: true
    }).sort({ totalTrips: -1 }).limit(3);
    res.json({ success: true, data: vehicle, similar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PACKAGES (Public) ───

// Get all active packages
router.get('/packages', async (req, res) => {
  try {
    const { category, search, featured, sort, page = 1, limit = 100 } = req.query;
    const query = { active: true };
    if (category && category !== 'all') query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { totalBookings: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const packages = await Package.find(query).sort(sortOption).limit(parseInt(limit));
    res.json({ success: true, data: packages, total: packages.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single package by ID or slug
router.get('/packages/:slug', async (req, res) => {
  try {
    const pkg = await Package.findOne({
      $or: [{ _id: req.params.slug }, { slug: req.params.slug }]
    });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── STATS (Public) ───

router.get('/stats', async (req, res) => {
  try {
    const [vehicleCount, packageCount, activePackageCount] = await Promise.all([
      Vehicle.countDocuments({ available: true }),
      Package.countDocuments(),
      Package.countDocuments({ active: true })
    ]);
    const vehicles = await Vehicle.find({ available: true }).sort({ totalTrips: -1 }).limit(4);
    const packages = await Package.find({ active: true, featured: true }).sort({ totalBookings: -1 }).limit(6);
    res.json({
      success: true,
      data: { vehicleCount, packageCount, activePackageCount, featuredVehicles: vehicles, featuredPackages: packages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;