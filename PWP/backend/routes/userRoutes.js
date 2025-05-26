const express = require('express');
const router = express.Router();
const { registerUser, loginUser, createMechanic, getAllUsers } = require('../controllers/userController');
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');

// Public routes for registration and login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (only accessible for Admins)
router.post('/create-mechanic', verifyToken, allowRoles('Admin'), createMechanic);
router.get('/', verifyToken, allowRoles('Admin'), getAllUsers);

module.exports = router;