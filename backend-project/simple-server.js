const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = 5001;

console.log('🚀 Starting Simple Backend Server...');

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'cwsms-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

console.log('✅ Middleware configured');

// In-memory user storage for testing
const users = [
    { id: 1, username: 'admin', password: 'admin123' }
];

// Test route
app.get('/api/test', (req, res) => {
    console.log('📡 Test endpoint called');
    res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username, password });

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = { id: user.id, username: user.username };
        console.log('✅ Login successful for:', username);
        res.json({ message: 'Login successful', user: req.session.user });
    } else {
        console.log('❌ Invalid credentials for:', username);
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Register route
app.post('/api/register', (req, res) => {
    const { username, password, confirmPassword } = req.body;

    console.log('📝 Registration attempt:', { username });

    // Validate input
    if (!username || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if username exists
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    // Add new user
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);

    console.log('✅ User registered:', username);
    res.json({ message: 'User registered successfully' });
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Check auth route
app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

app.listen(PORT, () => {
    console.log(`🎉 Server running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('  GET  /api/test');
    console.log('  POST /api/login');
    console.log('  POST /api/register');
    console.log('  POST /api/logout');
    console.log('  GET  /api/check-auth');
    console.log('🔄 Server is ready and waiting for requests...');
});

// Keep the process alive
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    process.exit(0);
});
