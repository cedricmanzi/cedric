const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
exports.registerUser = async (req, res) => {
  try {
    const { username, password, role, email, fullName } = req.body;

    // Validate input data
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number and special character'
      });
    }

    // Prevent Admin role for public registration
    if (role === 'Admin') {
      return res.status(403).json({ message: 'Cannot register as Admin' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: role || 'Mechanic',
      email,
      fullName
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        fullName: newUser.fullName
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input data
    if (!username || !password) {
      return res.status(400).json({ message: 'Both username and password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username,
        fullName: user.fullName
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create mechanic user (Admin only)
exports.createMechanic = async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;

    // Validate input data
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({ message: 'Username, password, email, and full name are required' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number and special character'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create mechanic user
    const newMechanic = await User.create({
      username,
      password: hashedPassword,
      role: 'Mechanic',
      email,
      fullName
    });

    res.status(201).json({
      message: 'Mechanic user created successfully',
      user: {
        id: newMechanic.id,
        username: newMechanic.username,
        role: newMechanic.role,
        fullName: newMechanic.fullName
      },
    });
  } catch (error) {
    console.error('Error creating mechanic user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'fullName', 'createdAt']
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};