const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const { accountType, email, phone, password, fullname, agencyName, licenseNumber } = req.body;

    const errors = [];
    if (!email) errors.push({ field: 'email', message: 'Email is required.' });
    if (!password) errors.push({ field: 'password', message: 'Password is required.' });
    if (!phone || !phone.number) errors.push({ field: 'phone', message: 'Phone number is required.' });
    
    if (accountType === 'agent') {
      if (!agencyName) errors.push({ field: 'agencyName', message: 'Agency name is required.' });
      if (!licenseNumber) errors.push({ field: 'licenseNumber', message: 'License number is required.' });
    } else {
      if (!fullname) errors.push({ field: 'fullname', message: 'Full name is required.' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errors: [{ field: 'email', message: 'An account with this email already exists.' }]
      });
    }

    const user = await User.create({
      accountType,
      email,
      phone,
      password,
      fullname,
      agencyName,
      licenseNumber
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          accountType: user.accountType,
          email: user.email,
          fullname: user.fullname,
          agencyName: user.agencyName,
          agencyId: user.agencyId
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

exports.login = async (req, res) => {
  try {
    const { accountType, identifier, password } = req.body;

    const errors = [];
    if (!identifier) errors.push({ field: 'identifier', message: 'Identifier (email/phone/agency ID) is required.' });
    if (!password) errors.push({ field: 'password', message: 'Password is required.' });

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const query = {
      accountType,
      $or: [
        { email: identifier.toLowerCase().trim() },
        { agencyId: identifier.trim() },
        { 'phone.number': identifier.replace(/\D/g, '') }
      ]
    };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, phone number, agency ID or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, phone number, agency ID or password.'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          accountType: user.accountType,
          email: user.email,
          fullname: user.fullname,
          agencyName: user.agencyName,
          agencyId: user.agencyId
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
