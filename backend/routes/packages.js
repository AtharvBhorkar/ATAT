const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  toggleActive,
  toggleFeatured
} = require('../controllers/packageController');
const verifyAdmin = require('../middleware/verifyAdmin');

// All routes protected
router.get('/', verifyAdmin, getAllPackages);
router.get('/:id', verifyAdmin, getPackageById);
router.post('/', verifyAdmin, createPackage);
router.put('/:id', verifyAdmin, updatePackage);
router.delete('/:id', verifyAdmin, deletePackage);
router.patch('/:id/toggle', verifyAdmin, toggleActive);
router.patch('/:id/featured', verifyAdmin, toggleFeatured);

module.exports = router;