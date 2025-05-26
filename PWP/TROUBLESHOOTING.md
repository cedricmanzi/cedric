# Troubleshooting Login and Registration Issues

If you're experiencing issues with login and registration in the SmartPark Car Repair Management System, follow these steps to resolve them:

## Backend Issues

### 1. Check Database Connection

Make sure your MySQL database is running and accessible with the credentials in your `.env` file:

```
DB_HOST=localhost
DB_NAME=crpms
DB_USER=root
DB_PASSWORD=your_password
```

### 2. Create the Database

If the database doesn't exist, create it:

```sql
CREATE DATABASE crpms;
```

### 3. Initialize the Database

Run the database initialization script:

```
cd backend
node scripts/initDb.js
```

### 4. Check Backend Dependencies

Make sure all required dependencies are installed:

```
cd backend
npm install
```

### 5. Start the Backend Server

Start the backend server:

```
cd backend
npm run dev
```

## Frontend Issues

### 1. Check API Configuration

Make sure the API service is pointing to the correct backend URL:

In `frontend/src/services/api.js`, ensure the baseURL is correct:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:6000', // Your backend API URL
});
```

### 2. Install Frontend Dependencies

Make sure all required dependencies are installed:

```
cd frontend
npm install
```

### 3. Start the Frontend Server

Start the frontend development server:

```
cd frontend
npm run dev
```

## Temporary Workaround

If you're still experiencing issues, you can use the temporary workaround implemented in the code:

1. For registration, the system will simulate a successful registration without actually connecting to the backend.
2. For login, you can use any username and password. If you use "admin" as the username, you'll be logged in as an admin.

This workaround allows you to test the system's functionality without a working backend.

## Default Admin Account

After initializing the database, you can log in with the following admin credentials:

- Username: admin
- Password: Admin@123

## Common Issues and Solutions

### CORS Issues

If you're experiencing CORS issues, make sure the backend has CORS enabled:

```javascript
const cors = require('cors');
app.use(cors());
```

### Database Connection Issues

If you're having trouble connecting to the database, check:

1. MySQL is running
2. The database exists
3. The user has the correct permissions
4. The password is correct

### JWT Issues

If you're experiencing JWT issues, make sure the JWT_SECRET is set in your .env file:

```
JWT_SECRET=smartpark_secret_key_for_jwt_authentication
```

### Password Validation Issues

The system requires strong passwords with:
- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Example of a valid password: `Password@123`
