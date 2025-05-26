const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user storage for testing
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$rrCvVFQxB5gn9/xLOKRYTuWL2X3aMVQYMlQoM/JxZdT.LKy4UQcfq', // Admin@123
    role: 'Admin',
    email: 'admin@smartpark.com',
    fullName: 'System Administrator'
  }
];

// Register endpoint
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password, email, fullName, role } = req.body;

    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role: role || 'Mechanic',
      email,
      fullName
    };

    // Add to users array
    users.push(newUser);

    // Return success
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
});

// Login endpoint
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = users.find(user => user.username === username);
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
      'smartpark_secret_key_for_jwt_authentication',
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
});

// Get all users endpoint
app.get('/api/users', (req, res) => {
  // Return users without passwords
  const safeUsers = users.map(({ password, ...user }) => user);
  res.status(200).json(safeUsers);
});

// Start server
const PORT = 6000;
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
});

console.log('Available users:');
console.log(users.map(({ password, ...user }) => user));
