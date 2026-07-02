const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // ✓ Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // ✗ No token provided
    if (!token) {
      console.warn('🚫 No token in Authorization header');
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.'
      });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('🔴 CRITICAL: JWT_SECRET is not set in .env file');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Contact administrator.'
      });
    }

    // ✓ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✓ Token verified for admin ID:', decoded.id);
    } catch (jwtError) {
      console.warn('⚠️ JWT verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: jwtError.name === 'TokenExpiredError' 
          ? 'Token has expired. Please login again.' 
          : 'Invalid token.'
      });
    }

    // ✓ Find admin in database
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      console.warn('🚫 Admin not found in database for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Admin account not found.'
      });
    }

    console.log(`✓ Admin authenticated: ${admin.email}`);

    // ✓ Attach admin to request
    req.admin = admin;
    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optional: Middleware to check JWT_SECRET on startup
exports.checkJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    console.error('\n🔴 CRITICAL ERROR:');
    console.error('   JWT_SECRET is not defined in .env file');
    console.error('   Add this line to .env:');
    console.error('   JWT_SECRET=your_secret_key_here\n');
    process.exit(1);
  }
  console.log('✓ JWT_SECRET is configured');
};