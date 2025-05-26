const express = require('express');
const router = express.Router();
const serviceRecordController = require('../controllers/serviceRecordController');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

// Service record routes
router.post('/', verifyToken, serviceRecordController.createServiceRecord);
router.get('/', verifyToken, serviceRecordController.getAllServiceRecords);
router.get('/:id', verifyToken, serviceRecordController.getServiceRecordById);
router.put('/:id', verifyToken, serviceRecordController.updateServiceRecord);
router.delete('/:id', verifyToken, serviceRecordController.deleteServiceRecord);
router.get('/:id/bill', verifyToken, serviceRecordController.generateBill);

module.exports = router;
