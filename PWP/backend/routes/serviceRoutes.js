const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

// Service routes
router.post('/', verifyToken, allowRoles('Admin'), serviceController.createService);
router.get('/', verifyToken, serviceController.getAllServices);
router.get('/:serviceCode', verifyToken, serviceController.getServiceByCode);
router.put('/:serviceCode', verifyToken, allowRoles('Admin'), serviceController.updateService);
router.delete('/:serviceCode', verifyToken, allowRoles('Admin'), serviceController.deleteService);

module.exports = router;
