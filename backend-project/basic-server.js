const http = require('http');
const url = require('url');

const PORT = 5004;

// Simple user storage
const users = [
    { username: 'admin', password: 'admin123' }
];

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    console.log(`${req.method} ${path}`);

    if (req.method === 'GET' && path === '/test') {
        console.log('Test endpoint called');
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Backend is working!', status: 'success' }));
        return;
    }

    if (req.method === 'POST' && path === '/api/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('Login attempt:', data);

                const { username, password } = data;
                const user = users.find(u => u.username === username && u.password === password);

                if (user) {
                    console.log('Login successful for:', username);
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        message: 'Login successful',
                        success: true,
                        user: { username: user.username }
                    }));
                } else {
                    console.log('Login failed for:', username);
                    res.writeHead(401);
                    res.end(JSON.stringify({ message: 'Invalid credentials', success: false }));
                }
            } catch (error) {
                console.error('Login error:', error);
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Invalid JSON', success: false }));
            }
        });
        return;
    }

    if (req.method === 'POST' && path === '/api/register') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('Registration attempt:', data);

                const { username, password, confirmPassword } = data;

                // Validation
                if (!username || !password || !confirmPassword) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'All fields are required', success: false }));
                    return;
                }

                if (password !== confirmPassword) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Passwords do not match', success: false }));
                    return;
                }

                if (password.length < 6) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Password must be at least 6 characters', success: false }));
                    return;
                }

                // Check if username exists
                if (users.find(u => u.username === username)) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Username already exists', success: false }));
                    return;
                }

                // Add new user
                users.push({ username, password });
                console.log('User registered:', username);

                res.writeHead(200);
                res.end(JSON.stringify({ message: 'Registration successful', success: true }));
            } catch (error) {
                console.error('Registration error:', error);
                res.writeHead(400);
                res.end(JSON.stringify({ message: 'Invalid JSON', success: false }));
            }
        });
        return;
    }

    // 404 for other routes
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Not found' }));
});

server.listen(PORT, () => {
    console.log(`Basic HTTP server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET /test');
    console.log('  POST /api/login');
    console.log('  POST /api/register');
    console.log('Server is ready!');
});

server.on('error', (error) => {
    console.error('Server error:', error);
});
