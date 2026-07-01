const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const verifyAdmin = require('../middleware/verifyAdmin');

function mapPackage(p) {
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
    image: p.image || '',
    images: p.images || [],
    active: p.active !== false,
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

// Get all packages (public — no auth for listing)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, sort, page = 1, limit = 100, active } = req.query;
    const query = {};

    if (active !== undefined) query.active = active === 'true';
    else query.active = true;

    if (category && category !== 'all') query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
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
    const mapped = packages.map(mapPackage);

    res.json({ success: true, data: mapped, packages: mapped, total: mapped.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single package
router.get('/:slug', async (req, res) => {
  try {
    const pkg = await Package.findOne({
      $or: [{ _id: req.params.slug }, { slug: req.params.slug }]
    });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    res.json({ success: true, data: mapPackage(pkg) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create package (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, data: mapPackage(pkg) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Package slug already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update package (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    res.json({ success: true, data: mapPackage(pkg) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete package (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    res.json({ success: true, message: 'Package deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle active
router.patch('/:id/toggle', verifyAdmin, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    pkg.active = !pkg.active;
    await pkg.save();
    res.json({ success: true, data: mapPackage(pkg) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle featured
router.patch('/:id/featured', verifyAdmin, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    pkg.featured = !pkg.featured;
    await pkg.save();
    res.json({ success: true, data: mapPackage(pkg) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;