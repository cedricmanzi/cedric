const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

// Car routes
router.post('/', verifyToken, carController.createCar);
router.get('/', verifyToken, carController.getAllCars);
router.get('/:plateNumber', verifyToken, carController.getCarByPlateNumber);
router.put('/:plateNumber', verifyToken, carController.updateCar);
router.delete('/:plateNumber', verifyToken, allowRoles('Admin'), carController.deleteCar);

module.exports = router;
