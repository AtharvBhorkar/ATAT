const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const verifyAdmin = require('../middleware/verifyAdmin');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');
const { processImage, deleteImage } = require('../utils/imageUtils');

// ✅ IMAGE URL HELPER - Ensures all images have proper paths
function getImageUrl(imagePath) {
  if (!imagePath) return '/images/no-image.jpg';
  if (imagePath.startsWith('http')) return imagePath; // External URL
  if (imagePath.startsWith('/')) return imagePath; // Already has leading slash
  return '/' + imagePath; // Add leading slash
}

// ✅ VEHICLE MAPPER - Transforms database vehicle to API response
function mapVehicle(v) {
  let primaryImage = v.image;
  if (!primaryImage || primaryImage === 'undefined') {
    primaryImage = (v.images && v.images.length > 0) ? v.images[0] : '';
  }

  return {
    _id: v._id,
    slug: v.slug || '',
    name: v.name || '',
    type: v.type || '',
    brand: v.brand || '',
    model: v.model || '',
    year: v.year || null,
    seats: v.seats || 4,
    bags: v.bags || 2,
    luggage: v.luggage || v.bags || 2,
    fuelType: v.fuelType || '',
    fuel: v.fuel || v.fuelType || '',
    transmission: v.transmission || '',
    mileage: v.mileage || '',
    ac: v.ac !== false,
    pricePerDay: v.pricePerDay || 0,
    dailyRate: v.dailyRate || v.pricePerDay || 0,
    pricePerKm: v.pricePerKm || 0,
    minFare: v.minFare || v.minimumFare || 0,
    minimumFare: v.minimumFare || v.minFare || 0,
    rating: v.rating || 0,
    totalTrips: v.totalTrips || 0,
    totalKmLakhs: v.totalKmLakhs || 0,
    // ✅ IMAGES - Always return proper URLs
    image: getImageUrl(primaryImage),
    images: (v.images || []).map(img => getImageUrl(img)).filter(Boolean),
    features: v.features || [],
    amenities: v.amenities || [],
    highlights: v.highlights || [],
    description: v.description || '',
    whyChoose: v.whyChoose || '',
    idealFor: v.idealFor || [],
    cancellationPolicy: v.cancellationPolicy || '',
    reviews: v.reviews || [],
    note: v.description || '',
    availability: v.available !== undefined ? v.available : true,
    isActive: v.status ? v.status === 'active' : v.available !== false,
    status: v.status || (v.available !== false ? 'active' : 'disabled'),
    badge: v.badge || '',
    badgeClass: v.badgeClass || '',
    featured: v.featured || false,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt
  };
}

// ✅ NORMALIZE REQUEST DATA
function normalizeVehicleData(body) {
  const data = { ...body };

  if (data.fuel && !data.fuelType) data.fuelType = data.fuel;
  if (data.type) {
    data.type = data.type.toLowerCase().trim();
    if (data.type === 'motorcycle') data.type = 'bike';
  }
  if (data.fuelType) data.fuelType = data.fuelType.toLowerCase().trim();
  if (data.transmission) data.transmission = data.transmission.toLowerCase().trim();

  if (!data.slug && data.name) {
    const baseSlug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    data.slug = `${baseSlug}-${randomSuffix}`;
  }

  if (data.status) data.available = data.status === 'active';

  // Handle array fields from strings
  ['features', 'amenities', 'highlights', 'idealFor', 'routes'].forEach(field => {
    if (typeof data[field] === 'string') {
      try { data[field] = JSON.parse(data[field]); } 
      catch(e) { data[field] = data[field].split(',').map(s => s.trim()).filter(Boolean); }
    }
  });

  // Handle images array
  if (data.images && typeof data.images === 'string') {
    try { data.images = JSON.parse(data.images); }
    catch(e) { data.images = data.images.split(',').map(s => s.trim()).filter(Boolean); }
  }

  return data;
}

// ═════════════════════════════════════════════════════════════════
// ✅ PUBLIC ROUTES
// ═════════════════════════════════════════════════════════════════

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const { type, fuelType, transmission, available, status, search, sort, page = 1, limit = 100 } = req.query;
    const query = {};

    if (type && type !== 'all') {
      let normalizedType = type.toLowerCase().trim();
      if (normalizedType === 'motorcycle') normalizedType = 'bike';
      query.type = normalizedType;
    }
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (status) query.status = status;
    else if (available !== undefined) query.available = available === 'true';
    
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
    if (sort === 'popular') sortOption = { totalTrips: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const vehicles = await Vehicle.find(query)
      .sort(sortOption)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: vehicles.map(mapVehicle),
      vehicles: vehicles.map(mapVehicle),
      total: vehicles.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single vehicle by ID or slug
router.get('/:id', async (req, res) => {
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

    const similar = await Vehicle.find({
      type: vehicle.type,
      _id: { $ne: vehicle._id },
      available: true
    })
      .sort({ totalTrips: -1 })
      .limit(3);

    res.json({
      success: true,
      data: mapVehicle(vehicle),
      similar: similar.map(mapVehicle)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═════════════════════════════════════════════════════════════════
// ✅ ADMIN ROUTES (Protected)
// ═════════════════════════════════════════════════════════════════

// CREATE vehicle with image
router.post('/',
  verifyAdmin,
  uploadSingle,
  handleUploadError,
  async (req, res) => {
    try {
      const normalizedData = normalizeVehicleData(req.body);

      // Handle uploaded image
      if (req.file) {
        try {
          const processed = await processImage(req.file.path, req.file.path.replace(/\.[^.]+$/, '.webp'));
          normalizedData.image = processed.original;
        } catch (imgErr) {
          console.error('Image processing failed:', imgErr);
          normalizedData.image = req.file.path;
        }
      } else if (req.body.imageUrl) {
        normalizedData.image = req.body.imageUrl;
      }

      const vehicle = await Vehicle.create(normalizedData);
      res.status(201).json({ success: true, data: mapVehicle(vehicle) });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Vehicle slug already exists.' });
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// UPDATE vehicle with image
router.put('/:id',
  verifyAdmin,
  uploadSingle,
  handleUploadError,
  async (req, res) => {
    try {
      const normalizedData = normalizeVehicleData(req.body);
      const oldVehicle = await Vehicle.findById(req.params.id);

      if (!oldVehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }

      // Handle new image
      if (req.file) {
        try {
          const processed = await processImage(req.file.path, req.file.path.replace(/\.[^.]+$/, '.webp'));
          if (oldVehicle.image && !oldVehicle.image.startsWith('http')) {
            deleteImage(oldVehicle.image);
          }
          normalizedData.image = processed.original;
        } catch (imgErr) {
          console.error('Image processing failed:', imgErr);
          normalizedData.image = req.file.path;
        }
      } else if (req.body.imageUrl) {
        if (oldVehicle.image && !oldVehicle.image.startsWith('http')) {
          deleteImage(oldVehicle.image);
        }
        normalizedData.image = req.body.imageUrl;
      } else if (req.body.removeImage === 'true') {
        if (oldVehicle.image && !oldVehicle.image.startsWith('http')) {
          deleteImage(oldVehicle.image);
        }
        normalizedData.image = '';
      }

      const vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        normalizedData,
        { new: true, runValidators: true }
      );

      res.json({ success: true, data: mapVehicle(vehicle) });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// UPLOAD gallery images
router.post('/:id/gallery',
  verifyAdmin,
  uploadMultiple,
  handleUploadError,
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found.' });
      }

      const newImages = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const processed = await processImage(file.path, file.path.replace(/\.[^.]+$/, '.webp'));
            newImages.push(processed.original);
          } catch (err) {
            newImages.push(file.path);
          }
        }
      }

      vehicle.images = [...(vehicle.images || []), ...newImages];
      await vehicle.save();

      res.json({
        success: true,
        data: mapVehicle(vehicle),
        newImages: newImages.map(img => getImageUrl(img))
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// DELETE gallery image
router.delete('/:id/gallery/:index', verifyAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const index = parseInt(req.params.index);
    if (index >= 0 && index < (vehicle.images || []).length) {
      const imageToDelete = vehicle.images[index];
      if (!imageToDelete.startsWith('http')) {
        deleteImage(imageToDelete);
      }
      vehicle.images.splice(index, 1);
      await vehicle.save();
    }

    res.json({ success: true, data: mapVehicle(vehicle) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// TOGGLE availability
router.patch('/:id/toggle', verifyAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    vehicle.available = !vehicle.available;
    vehicle.status = vehicle.available ? 'active' : 'disabled';
    await vehicle.save();

    res.json({ success: true, data: mapVehicle(vehicle) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE vehicle
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Delete associated images
    if (vehicle.image && !vehicle.image.startsWith('http')) {
      deleteImage(vehicle.image);
    }
    if (vehicle.images) {
      vehicle.images.forEach(img => {
        if (!img.startsWith('http')) deleteImage(img);
      });
    }

    res.json({ success: true, message: 'Vehicle deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
