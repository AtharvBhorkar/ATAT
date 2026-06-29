const Contact = require('../models/Contact');

// @desc    Get all contacts with filters and pagination
// @route   GET /api/contacts
exports.getAllContacts = async (req, res) => {
  try {
    const { isRead, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Contact.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: contacts,
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

// @desc    Get single contact
// @route   GET /api/contacts/:id
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    // Auto-mark as read when viewed
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a contact message (public endpoint)
// @route   POST /api/contacts
exports.createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message.'
      });
    }

    const contact = await Contact.create({
      ...req.body,
      subject: subject || 'General Inquiry'
    });
    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: contact
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark as read
// @route   PATCH /api/contacts/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    contact.isRead = true;
    await contact.save();

    res.json({
      success: true,
      message: 'Marked as read.',
      data: contact
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark as unread
// @route   PATCH /api/contacts/:id/unread
exports.markAsUnread = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }

    contact.isRead = false;
    await contact.save();

    res.json({
      success: true,
      message: 'Marked as unread.',
      data: contact
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete all read contacts
// @route   DELETE /api/contacts/read/all
exports.deleteAllRead = async (req, res) => {
  try {
    const result = await Contact.deleteMany({ isRead: true });
    res.json({
      success: true,
      message: `${result.deletedCount} read messages deleted.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};