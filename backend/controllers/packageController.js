const Package = require('../models/Package');

// @desc    Get all packages with filters and pagination
// @route   GET /api/packages
exports.getAllPackages = async (req, res) => {
  try {
    const { category, difficulty, featured, active, destination, search, sort, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (featured !== undefined) query.featured = featured === 'true';
    if (active !== undefined) query.active = active === 'true';
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { title: 1 };
    if (sort === 'popular') sortOption = { totalBookings: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [packages, total] = await Promise.all([
      Package.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Package.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: packages,
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

// @desc    Get single package
// @route   GET /api/packages/:id
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }]
    });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a package
// @route   POST /api/packages
exports.createPackage = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Package created successfully.',
      data: pkg
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a package
// @route   PUT /api/packages/:id
exports.updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    res.json({
      success: true,
      message: 'Package updated successfully.',
      data: pkg
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a package
// @route   DELETE /api/packages/:id
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    res.json({
      success: true,
      message: 'Package deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle package active status
// @route   PATCH /api/packages/:id/toggle
exports.toggleActive = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    pkg.active = !pkg.active;
    await pkg.save();

    res.json({
      success: true,
      message: `Package is now ${pkg.active ? 'active' : 'inactive'}.`,
      data: pkg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/packages/:id/featured
exports.toggleFeatured = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    pkg.featured = !pkg.featured;
    await pkg.save();

    res.json({
      success: true,
      message: `Package is now ${pkg.featured ? 'featured' : 'unfeatured'}.`,
      data: pkg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};