const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register a new admin (optional — for multi-admin setups)
// @route   POST /api/admin/register
// @access  Public (consider protecting this in production)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin with this email already exists.'
      });
    }

    // Create admin
    const admin = await Admin.create({ name, email, password });

    // Generate token
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully.',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Find admin (include password for comparison)
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.dashboard = async (req, res) => {
  try {
    const Vehicle = require('../models/Vehicle');
    const Package = require('../models/Package');
    const Booking = require('../models/Booking');
    const Contact = require('../models/Contact');

    // Count totals
    const [totalVehicles, totalPackages, totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, totalContacts, unreadContacts, totalRevenue] = await Promise.all([
      Vehicle.countDocuments(),
      Package.countDocuments({ active: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Contact.countDocuments(),
      Contact.countDocuments({ isRead: false }),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    // Recent bookings (last 5)
    const recentBookings = await Booking.find()
      .populate('vehicleId', 'name type brand')
      .populate('packageId', 'title destination')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent contacts (last 5)
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Bookings by type
    const vehicleBookings = await Booking.countDocuments({ bookingType: 'vehicle' });
    const packageBookings = await Booking.countDocuments({ bookingType: 'package' });

    // Revenue breakdown
    const vehicleRevenue = await Booking.aggregate([
      { $match: { bookingType: 'vehicle', status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const packageRevenue = await Booking.aggregate([
      { $match: { bookingType: 'package', status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Monthly bookings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalVehicles,
          totalPackages,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          totalContacts,
          unreadContacts,
          totalRevenue: totalRevenue[0]?.total || 0,
          vehicleBookings,
          packageBookings,
          vehicleRevenue: vehicleRevenue[0]?.total || 0,
          packageRevenue: packageRevenue[0]?.total || 0
        },
        recentBookings,
        recentContacts,
        monthlyBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/me
// @access  Private (Admin only)
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    res.json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Seed default admin from .env
// @access  Called at server startup
exports.seedDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      await Admin.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'superadmin'
      });
      console.log('Default admin seeded successfully.');
    } else {
      console.log('Default admin already exists.');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error.message);
  }
};