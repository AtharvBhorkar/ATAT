const Vehicle = require('../models/Vehicle');

function normalizeVehicleData(body) {
  const data = { ...body };

  if (data.fuel && !data.fuelType) {
    data.fuelType = data.fuel;
  }

  if (data.type) {
    data.type = data.type.toLowerCase().trim();
    if (data.type === 'motorcycle') data.type = 'bike';
  }

  if (data.fuelType) {
    data.fuelType = data.fuelType.toLowerCase().trim();
  }

  if (data.transmission) {
    data.transmission = data.transmission.toLowerCase().trim();
  }

  if (!data.slug && data.name) {
    const baseSlug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    data.slug = `${baseSlug}-${randomSuffix}`;
  }

  if (data.status) {
    data.available = data.status === 'active';
  }

  return data;
}

// @desc    Get all vehicles with filters and pagination
// @route   GET /api/vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const { type, brand, fuelType, transmission, available, search, sort, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (available !== undefined) query.available = available === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { pricePerDay: 1 };
    if (sort === 'price-high') sortOption = { pricePerDay: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'seats') sortOption = { seats: -1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Vehicle.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
exports.createVehicle = async (req, res) => {
  try {
    const normalizedData = normalizeVehicleData(req.body);
    const vehicle = await Vehicle.create(normalizedData);
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully.',
      data: vehicle
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    const normalizedData = normalizeVehicleData(req.body);
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      normalizedData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully.',
      data: vehicle
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle vehicle availability
// @route   PATCH /api/vehicles/:id/toggle
exports.toggleAvailability = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    vehicle.available = !vehicle.available;
    await vehicle.save();

    res.json({
      success: true,
      message: `Vehicle is now ${vehicle.available ? 'available' : 'unavailable'}.`,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};