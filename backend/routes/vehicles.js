const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  toggleAvailability
} = require('../controllers/vehicleController');
const verifyAdmin = require('../middleware/verifyAdmin');

// All routes protected
router.get('/', verifyAdmin, getAllVehicles);
router.get('/:id', verifyAdmin, getVehicleById);
router.post('/', verifyAdmin, createVehicle);
router.put('/:id', verifyAdmin, updateVehicle);
router.delete('/:id', verifyAdmin, deleteVehicle);
router.patch('/:id/toggle', verifyAdmin, toggleAvailability);

module.exports = router;