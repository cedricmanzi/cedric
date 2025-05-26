const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
    console.log('Test endpoint hit!');
    res.json({ message: 'Server is working!' });
});

// Simple login endpoint
app.post('/api/login', (req, res) => {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
        res.json({ message: 'Login successful', success: true });
    } else {
        res.status(401).json({ message: 'Invalid credentials', success: false });
    }
});

// Simple register endpoint
app.post('/api/register', (req, res) => {
    console.log('Register request received:', req.body);
    const { username, password, confirmPassword } = req.body;
    
    if (!username || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields required', success: false });
    }
    
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match', success: false });
    }
    
    res.json({ message: 'Registration successful', success: true });
});

app.listen(PORT, () => {
    console.log(`Minimal server running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  GET /test');
    console.log('  POST /api/login');
    console.log('  POST /api/register');
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
});

console.log('Server script loaded, starting...');
