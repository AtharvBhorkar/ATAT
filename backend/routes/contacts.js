const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  getContactById,
  createContact,
  deleteContact,
  markAsRead,
  markAsUnread,
  deleteAllRead
} = require('../controllers/contactController');
const verifyAdmin = require('../middleware/verifyAdmin');

// Public route for visitors to submit contact form
router.post('/', createContact);

// Protected routes for admin
router.get('/', verifyAdmin, getAllContacts);
router.get('/:id', verifyAdmin, getContactById);
router.delete('/:id', verifyAdmin, deleteContact);
router.patch('/:id/read', verifyAdmin, markAsRead);
router.patch('/:id/unread', verifyAdmin, markAsUnread);
router.delete('/read/all', verifyAdmin, deleteAllRead);

module.exports = router;