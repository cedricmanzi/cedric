const fs = require('fs');
const path = require('path');

const envContent = `DB_NAME=crms
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
PORT=6000
JWT_SECRET=smartpark_secret_key_for_jwt_authentication
NODE_ENV=development`;

const envPath = path.join(__dirname, '.env');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('.env file created successfully!');
} catch (error) {
    console.error('Error creating .env file:', error);
}