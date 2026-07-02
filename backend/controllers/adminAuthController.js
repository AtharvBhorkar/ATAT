const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
}

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const cleanKey = (secretKey || '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();

    const cleanEnvKey = (process.env.ADMIN_SECRET_KEY || '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();

    if (!cleanKey || cleanKey !== cleanEnvKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired admin registration key.'
      });
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin with this email already exists.'
      });
    }

    const admin = await Admin.create({
      name,
      email,
      password
    });

    const token = generateToken(admin._id);

    return res.status(201).json({
      success: true,
      message: 'Admin registered successfully.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateToken(admin._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};


// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private/Public
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private
exports.dashboard = async (req, res) => {
  try {
    const Vehicle = require('../models/Vehicle');
    const Package = require('../models/Package');
    const Booking = require('../models/Booking');
    const Contact = require('../models/Contact');
    const Payment = require('../models/Payment');

    const uniqueEmails = await Booking.distinct('email');
    const totalUsersCount = uniqueEmails.length;

    const [
      totalVehicles,
      availableVehicles,
      totalPackages,
      activePackages,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      activeRentals,
      totalContacts,
      unreadContacts,
      revenueAggregation,
      pendingPaymentsAggregation
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ available: true }),
      Package.countDocuments(),
      Package.countDocuments({ active: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ status: 'in-progress' }),
      Contact.countDocuments(),
      Contact.countDocuments({ isRead: false }),
      Booking.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'completed'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ]),
      Booking.aggregate([
        {
          $match: {
            paymentStatus: { $ne: 'paid' },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $subtract: ['$totalPrice', '$advancePaid']
              }
            }
          }
        }
      ])
    ]);

    const recentBookings = await Booking.find()
      .populate('vehicleId', 'name type brand')
      .populate('packageId', 'title destination')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const vehicleBookings = await Booking.countDocuments({ bookingType: 'vehicle' });
    const packageBookings = await Booking.countDocuments({ bookingType: 'package' });

    const vehicleRevenue = await Booking.aggregate([
      { $match: { bookingType: 'vehicle', status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const packageRevenue = await Booking.aggregate([
      { $match: { bookingType: 'package', status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          cancellations: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const paymentMethodsStats = await Payment.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 } } }
    ]);

    const [recentBookingsList, recentPaymentsList, recentVehiclesList] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).limit(3),
      Payment.find().sort({ date: -1 }).limit(3),
      Vehicle.find().sort({ createdAt: -1 }).limit(3)
    ]);

    const recentActivity = [];

    recentBookingsList.forEach(b => {
      recentActivity.push({
        type: 'booking',
        title: `Booking ${b.status === 'confirmed' ? 'Confirmed' : b.status === 'completed' ? 'Completed' : 'Created'}`,
        description: `Booking #${b.bookingId || b._id} for customer ${b.name}`,
        time: b.createdAt
      });
    });

    recentPaymentsList.forEach(p => {
      recentActivity.push({
        type: 'payment',
        title: `Payment ${p.status === 'paid' ? 'Received' : 'Failed'}`,
        description: `₹${p.amount} from customer ${p.customer}`,
        time: p.date
      });
    });

    recentVehiclesList.forEach(v => {
      recentActivity.push({
        type: 'vehicle',
        title: 'Vehicle Added',
        description: `${v.name} added to fleet`,
        time: v.createdAt
      });
    });

    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivityFeed = recentActivity.slice(0, 5);

    return res.json({
      success: true,
      data: {
        totalVehicles,
        availableVehicles,
        activeVehicles: availableVehicles,
        totalPackages,
        activePackages,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        activeRentals,
        totalContacts,
        unreadContacts,
        totalRevenue: revenueAggregation[0]?.total || 0,
        pendingPayments: pendingPaymentsAggregation[0]?.total || 0,
        totalUsers: totalUsersCount,
        vehicleBookings,
        packageBookings,
        vehicleRevenue: vehicleRevenue[0]?.total || 0,
        packageRevenue: packageRevenue[0]?.total || 0,
        recentBookings,
        recentContacts,
        monthlyBookings,
        paymentMethodsStats,
        recentActivityFeed
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found.'
      });
    }

    return res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Seed default admin from .env
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