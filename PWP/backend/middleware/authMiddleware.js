const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Token must be passed as: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info in req.user
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Role-based access middleware
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: role not allowed' });
    }
    next();
  };
};

module.exports = { verifyToken, allowRoles };
