const Vehicle = require('../models/Vehicle');
const Package = require('../models/Package');
const Booking = require('../models/Booking');

// @desc    Get public vehicles (active only)
exports.getVehicles = async (req, res) => {
  try {
    const { type, search, sort } = req.query;
    const query = { isActive: true };

    if (type) query.type = type;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } }
    ];

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { pricePerDay: 1 };
    if (sort === 'price-high') sortOption = { pricePerDay: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const vehicles = await Vehicle.find(query).sort(sortOption);
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single public vehicle
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, isActive: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get public packages (active only)
exports.getPackages = async (req, res) => {
  try {
    const { category, featured, sort } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const packages = await Package.find(query).sort(sortOption);
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single public package
exports.getPackage = async (req, res) => {
  try {
    const pkg = await Package.findOne({ slug: req.params.slug, isActive: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get public stats
exports.getStats = async (req, res) => {
  try {
    const [vehicles, packages, bookings] = await Promise.all([
      Vehicle.countDocuments({ isActive: true }),
      Package.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: { $in: ['confirmed', 'completed'] } })
    ]);

    res.json({
      success: true,
      data: { vehicles, packages, bookings }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};