# SmartPark Car Repair Management System (CRPMS)

A digital system for SmartPark garage in Rubavu District to manage car repairs, track payments, and generate reports.

## Features

- User authentication with role-based access control (Admin and Mechanic roles)
- Car management (add, edit, view cars)
- Service management (predefined repair services with prices)
- Service record management (track repairs and payments)
- Bill generation for repaired cars
- Daily and monthly reports

## Repair Services

The system includes the following predefined repair services:

| Service | Price (RWF) |
|---------|-------------|
| Engine repair | 150,000 |
| Transmission repair | 80,000 |
| Oil Change | 60,000 |
| Chain replacement | 40,000 |
| Disc replacement | 400,000 |
| Wheel alignment | 5,000 |

## Database Structure

The system uses a MySQL database with the following tables:

- **Users**: Stores user authentication information
- **Services**: Stores repair service types and prices
- **Cars**: Stores car information
- **ServiceRecords**: Stores repair records and payment information

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd crpms
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following content:
   ```
   DB_NAME=crpms
   DB_USER=<your-mysql-username>
   DB_PASSWORD=<your-mysql-password>
   DB_HOST=localhost
   DB_PORT=3306
   PORT=6000
   JWT_SECRET=<your-secret-key>
   NODE_ENV=development
   ```

5. Initialize the database:
   ```
   cd ../backend
   npm run init-db
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

### Default Admin Account

After initializing the database, you can log in with the following admin credentials:

- Username: admin
- Password: Admin@123

## Usage

1. **Login/Register**: Users can log in with their credentials or register a new account.
2. **Dashboard**: View summary statistics of cars, services, and revenue.
3. **Cars**: Manage car information.
4. **Services**: View available repair services and their prices.
5. **Service Records**: Record repairs, track payments, and generate bills.
6. **Reports**: Generate daily and monthly reports.

## License

This project is licensed under the MIT License.
