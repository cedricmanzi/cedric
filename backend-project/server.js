const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting Car Wash Management System Backend...');

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'cwsms-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

console.log('Middleware configured...');

// Database connection
console.log('Attempting to connect to MySQL database...');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Change this to your MySQL password
    database: 'CWSMS'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Please make sure:');
        console.error('1. MySQL is running');
        console.error('2. CWSMS database exists');
        console.error('3. Run: mysql -u root -p < backend-project/database.sql');
        // Don't return, continue without database for now
    } else {
        console.log('✅ Connected to MySQL database successfully');
    }
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Authentication required' });
    }
};

// Routes

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Test database connection
app.get('/api/test-db', (req, res) => {
    const query = 'SELECT COUNT(*) as userCount FROM User';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database test error:', err);
            return res.status(500).json({ message: 'Database connection failed', error: err.message });
        }
        res.json({ message: 'Database connection successful', userCount: results[0].userCount });
    });
});

// Authentication routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    console.log('Login attempt:', { username, password }); // Debug log

    const query = 'SELECT * FROM User WHERE Username = ? AND Password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error: ' + err.message });
        }

        console.log('Query results:', results); // Debug log

        if (results.length > 0) {
            req.session.user = { id: results[0].UserID, username: results[0].Username };
            console.log('Login successful for user:', username);
            res.json({ message: 'Login successful', user: req.session.user });
        } else {
            console.log('Invalid credentials for user:', username);
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { username, password, confirmPassword } = req.body;

    console.log('Registration attempt:', { username, password: '***', confirmPassword: '***' }); // Debug log

    // Validate input
    if (!username || !password || !confirmPassword) {
        console.log('Validation failed: Missing fields');
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        console.log('Validation failed: Passwords do not match');
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
        console.log('Validation failed: Password too short');
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if username already exists
    const checkQuery = 'SELECT * FROM User WHERE Username = ?';
    db.query(checkQuery, [username], (err, results) => {
        if (err) {
            console.error('Database error during username check:', err);
            return res.status(500).json({ message: 'Database error: ' + err.message });
        }

        console.log('Username check results:', results.length);

        if (results.length > 0) {
            console.log('Username already exists:', username);
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Insert new user
        const insertQuery = 'INSERT INTO User (Username, Password) VALUES (?, ?)';
        db.query(insertQuery, [username, password], (err, results) => {
            if (err) {
                console.error('Database error during user creation:', err);
                return res.status(500).json({ message: 'Database error: ' + err.message });
            }

            console.log('User registered successfully:', username);
            res.json({ message: 'User registered successfully' });
        });
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

// Package routes
app.get('/api/packages', requireAuth, (req, res) => {
    const query = 'SELECT * FROM Package';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/packages', requireAuth, (req, res) => {
    const { PackageName, PackageDescription, PackagePrice } = req.body;
    const query = 'INSERT INTO Package (PackageName, PackageDescription, PackagePrice) VALUES (?, ?, ?)';

    db.query(query, [PackageName, PackageDescription, PackagePrice], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Package created successfully', id: results.insertId });
    });
});

app.put('/api/packages/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { PackageName, PackageDescription, PackagePrice } = req.body;
    const query = 'UPDATE Package SET PackageName = ?, PackageDescription = ?, PackagePrice = ? WHERE PackageNumber = ?';

    db.query(query, [PackageName, PackageDescription, PackagePrice, id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Package updated successfully' });
    });
});

app.delete('/api/packages/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Package WHERE PackageNumber = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Package deleted successfully' });
    });
});

// Car routes
app.get('/api/cars', requireAuth, (req, res) => {
    const query = 'SELECT * FROM Car';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/cars', requireAuth, (req, res) => {
    const { PlateNumber, CarType, CarSize, DriverName, PhoneNumber } = req.body;
    const query = 'INSERT INTO Car (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [PlateNumber, CarType, CarSize, DriverName, PhoneNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Car registered successfully' });
    });
});

app.put('/api/cars/:plateNumber', requireAuth, (req, res) => {
    const { plateNumber } = req.params;
    const { CarType, CarSize, DriverName, PhoneNumber } = req.body;
    const query = 'UPDATE Car SET CarType = ?, CarSize = ?, DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?';

    db.query(query, [CarType, CarSize, DriverName, PhoneNumber, plateNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Car updated successfully' });
    });
});

app.delete('/api/cars/:plateNumber', requireAuth, (req, res) => {
    const { plateNumber } = req.params;
    const query = 'DELETE FROM Car WHERE PlateNumber = ?';

    db.query(query, [plateNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Car deleted successfully' });
    });
});

// ServicePackage routes
app.get('/api/service-packages', requireAuth, (req, res) => {
    const query = `
        SELECT sp.*, c.DriverName, c.CarType, p.PackageName, p.PackagePrice
        FROM ServicePackage sp
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package p ON sp.PackageNumber = p.PackageNumber
        ORDER BY sp.ServiceDate DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/service-packages', requireAuth, (req, res) => {
    const { ServiceDate, PlateNumber, PackageNumber } = req.body;
    const query = 'INSERT INTO ServicePackage (ServiceDate, PlateNumber, PackageNumber) VALUES (?, ?, ?)';

    db.query(query, [ServiceDate, PlateNumber, PackageNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Service package created successfully', id: results.insertId });
    });
});

app.delete('/api/service-packages/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM ServicePackage WHERE RecordNumber = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Service package deleted successfully' });
    });
});

// Payment routes
app.get('/api/payments', requireAuth, (req, res) => {
    const query = `
        SELECT p.*, sp.ServiceDate, sp.PlateNumber, c.DriverName, pkg.PackageName
        FROM Payment p
        JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package pkg ON sp.PackageNumber = pkg.PackageNumber
        ORDER BY p.PaymentDate DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/payments', requireAuth, (req, res) => {
    const { AmountPaid, PaymentDate, RecordNumber } = req.body;
    const query = 'INSERT INTO Payment (AmountPaid, PaymentDate, RecordNumber) VALUES (?, ?, ?)';

    db.query(query, [AmountPaid, PaymentDate, RecordNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Payment recorded successfully', id: results.insertId });
    });
});

// Get unpaid service packages
app.get('/api/unpaid-services', requireAuth, (req, res) => {
    const query = `
        SELECT sp.*, c.DriverName, c.CarType, p.PackageName, p.PackagePrice
        FROM ServicePackage sp
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package p ON sp.PackageNumber = p.PackageNumber
        LEFT JOIN Payment pay ON sp.RecordNumber = pay.RecordNumber
        WHERE pay.RecordNumber IS NULL
        ORDER BY sp.ServiceDate DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

// Bill generation
app.get('/api/bill/:recordNumber', requireAuth, (req, res) => {
    const { recordNumber } = req.params;
    const query = `
        SELECT sp.*, c.*, p.*, pay.AmountPaid, pay.PaymentDate, pay.PaymentNumber
        FROM ServicePackage sp
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package p ON sp.PackageNumber = p.PackageNumber
        JOIN Payment pay ON sp.RecordNumber = pay.RecordNumber
        WHERE sp.RecordNumber = ?
    `;

    db.query(query, [recordNumber], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.json(results[0]);
    });
});

// Reports
app.get('/api/reports/daily/:date', requireAuth, (req, res) => {
    const { date } = req.params;
    const query = `
        SELECT sp.PlateNumber, p.PackageName, p.PackageDescription, pay.AmountPaid, pay.PaymentDate
        FROM ServicePackage sp
        JOIN Package p ON sp.PackageNumber = p.PackageNumber
        JOIN Payment pay ON sp.RecordNumber = pay.RecordNumber
        WHERE DATE(pay.PaymentDate) = ?
        ORDER BY pay.PaymentDate DESC
    `;

    db.query(query, [date], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
