const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const verifyAdmin = require('../middleware/verifyAdmin');

function mapVehicle(v) {
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
    image: v.image || '',
    images: v.images || [],
    features: v.features || [],
    description: v.description || '',
    note: v.note || v.description || '',
    availability: v.available !== undefined ? v.available : true,
    badge: v.badge || '',
    badgeClass: v.badgeClass || '',
    featured: v.featured || false,
    slug: v.slug || '',
    createdAt: v.createdAt,
    updatedAt: v.updatedAt
  };
}

// ✅ PUBLIC — booking page needs this without auth
router.get('/', async (req, res) => {
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
    const mapped = vehicles.map(mapVehicle);

    res.json({ success: true, data: mapped, vehicles: mapped, total: mapped.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
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
    res.json({ success: true, data: mapVehicle(vehicle), similar: similar.map(mapVehicle) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ PROTECTED — admin-only write operations
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: mapVehicle(vehicle) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Vehicle slug already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    res.json({ success: true, data: mapVehicle(vehicle) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    res.json({ success: true, message: 'Vehicle deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;