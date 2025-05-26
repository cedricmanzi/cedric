const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

// Report Routes
router.get('/daily', verifyToken, reportController.generateDailyReport);
router.get('/monthly', verifyToken, reportController.generateMonthlyReport);

module.exports = router;
