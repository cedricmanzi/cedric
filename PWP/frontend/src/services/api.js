// frontend/services/api.js
import axios from 'axios';

// Mock data for testing when backend is not available
const mockData = {
  cars: [
    // Empty array for cars - you'll add your own
  ],
  services: [
    { serviceCode: 'ENG-REP', serviceName: 'Engine repair', servicePrice: 150000 },
    { serviceCode: 'TRANS-REP', serviceName: 'Transmission repair', servicePrice: 80000 },
    { serviceCode: 'OIL-CHG', serviceName: 'Oil Change', servicePrice: 60000 },
    { serviceCode: 'CHAIN-REP', serviceName: 'Chain replacement', servicePrice: 40000 },
    { serviceCode: 'DISC-REP', serviceName: 'Disc replacement', servicePrice: 400000 },
    { serviceCode: 'WHEEL-ALN', serviceName: 'Wheel alignment', servicePrice: 5000 },
  ],
  serviceRecords: [
    // Empty array for service records - you'll add your own
  ],
  users: [
    { id: 1, username: 'admin', fullName: 'Admin User', email: 'admin@smartpark.com', role: 'Admin' },
    {
      id: 2,
      username: 'mechanic1',
      fullName: 'John Doe',
      email: 'john@smartpark.com',
      phone: '0789123456',
      specialization: 'Engine Repair',
      role: 'Mechanic',
      createdAt: new Date().toISOString()
    },
  ],
  // Generate mock reports based on service records
  generateDailyReport: (date) => {
    const records = mockData.serviceRecords.filter(record =>
      record.paymentDate === date
    );

    // Group records by service
    const serviceMap = {};
    records.forEach(record => {
      const serviceCode = record.serviceCode;
      if (!serviceMap[serviceCode]) {
        serviceMap[serviceCode] = {
          serviceName: record.Service?.serviceName || 'Unknown Service',
          count: 0,
          totalAmount: 0,
          records: []
        };
      }

      serviceMap[serviceCode].count += 1;
      serviceMap[serviceCode].totalAmount += parseFloat(record.amountPaid || 0);
      serviceMap[serviceCode].records.push(record);
    });

    // Calculate totals
    let totalAmount = 0;
    records.forEach(record => {
      totalAmount += parseFloat(record.amountPaid || 0);
    });

    return {
      date: date,
      totalRecords: records.length,
      totalAmount: totalAmount,
      services: Object.values(serviceMap)
    };
  },

  // Generate monthly report
  generateMonthlyReport: (month, year) => {
    // Filter records for the given month and year
    const records = mockData.serviceRecords.filter(record => {
      const recordDate = new Date(record.paymentDate);
      return recordDate.getMonth() + 1 === month && recordDate.getFullYear() === year;
    });

    // Group records by day
    const dayMap = {};
    records.forEach(record => {
      const date = record.paymentDate;
      if (!dayMap[date]) {
        dayMap[date] = {
          date: date,
          count: 0,
          totalAmount: 0,
          services: {}
        };
      }

      dayMap[date].count += 1;
      dayMap[date].totalAmount += parseFloat(record.amountPaid || 0);

      // Group by service within each day
      const serviceCode = record.serviceCode;
      if (!dayMap[date].services[serviceCode]) {
        dayMap[date].services[serviceCode] = {
          serviceName: record.Service?.serviceName || 'Unknown Service',
          count: 0,
          totalAmount: 0
        };
      }

      dayMap[date].services[serviceCode].count += 1;
      dayMap[date].services[serviceCode].totalAmount += parseFloat(record.amountPaid || 0);
    });

    // Convert services object to array for each day
    Object.values(dayMap).forEach(day => {
      day.services = Object.values(day.services);
    });

    // Calculate totals
    let totalAmount = 0;
    records.forEach(record => {
      totalAmount += parseFloat(record.amountPaid || 0);
    });

    return {
      month: month,
      year: year,
      totalRecords: records.length,
      totalAmount: totalAmount,
      days: Object.values(dayMap).sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  }
};

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:6000', // Adjust if needed
  timeout: 5000, // 5 second timeout
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Add loading state or other logic here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor with mock data fallback
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if we should use mock data (when backend is not available)
    const useMockData = true; // Set to false when backend is working

    if (useMockData) {
      const { url, method } = error.config;
      console.log(`Using mock data for ${method} ${url}`);

      try {
        // Handle GET requests with mock data
        if (method === 'get') {
          if (url.includes('/api/cars')) {
            return Promise.resolve({ data: mockData.cars });
          }
          if (url.includes('/api/services')) {
            return Promise.resolve({ data: mockData.services });
          }
          if (url.includes('/api/service-records')) {
            return Promise.resolve({ data: mockData.serviceRecords });
          }
          if (url.includes('/api/users')) {
            return Promise.resolve({ data: mockData.users });
          }

          // Handle report requests
          if (url.includes('/api/reports/daily')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const date = urlParams.get('date');
            if (!date) {
              return Promise.reject(new Error('Date parameter is required'));
            }
            return Promise.resolve({ data: mockData.generateDailyReport(date) });
          }

          if (url.includes('/api/reports/monthly')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const month = parseInt(urlParams.get('month'));
            const year = parseInt(urlParams.get('year'));
            if (!month || !year) {
              return Promise.reject(new Error('Month and year parameters are required'));
            }
            return Promise.resolve({ data: mockData.generateMonthlyReport(month, year) });
          }
        }

        // Handle POST requests with mock data
        if (method === 'post') {
          if (url.includes('/api/cars')) {
            const newCar = JSON.parse(error.config.data || '{}');
            if (!newCar.plateNumber) {
              return Promise.reject(new Error('Plate number is required'));
            }
            mockData.cars.push(newCar);
            return Promise.resolve({ data: newCar });
          }
          if (url.includes('/api/services')) {
            const newService = JSON.parse(error.config.data || '{}');
            if (!newService.serviceCode) {
              return Promise.reject(new Error('Service code is required'));
            }
            mockData.services.push(newService);
            return Promise.resolve({ data: newService });
          }
          if (url.includes('/api/service-records')) {
            const newRecord = JSON.parse(error.config.data || '{}');
            newRecord.recordNumber = mockData.serviceRecords.length + 1;

            // Add related objects
            const car = mockData.cars.find(c => c.plateNumber === newRecord.plateNumber);
            const service = mockData.services.find(s => s.serviceCode === newRecord.serviceCode);

            newRecord.Car = car ? {
              plateNumber: car.plateNumber,
              type: car.type,
              model: car.model
            } : null;

            newRecord.Service = service ? {
              serviceName: service.serviceName,
              servicePrice: service.servicePrice
            } : null;

            mockData.serviceRecords.push(newRecord);
            return Promise.resolve({ data: newRecord });
          }

          if (url.includes('/api/users/create-mechanic')) {
            const newMechanic = JSON.parse(error.config.data || '{}');
            if (!newMechanic.username || !newMechanic.password || !newMechanic.fullName) {
              return Promise.reject(new Error('Username, password and full name are required'));
            }

            // Check if username already exists
            const existingUsername = mockData.users.find(u => u.username === newMechanic.username);
            if (existingUsername) {
              return Promise.reject(new Error('Username already exists'));
            }

            // Check if name already exists
            const existingName = mockData.users.find(u =>
              u.fullName.toLowerCase() === newMechanic.fullName.toLowerCase() &&
              u.role === 'Mechanic'
            );
            if (existingName) {
              return Promise.reject(new Error('A mechanic with this name already exists'));
            }

            // Create new mechanic
            const mechanic = {
              id: mockData.users.length + 1,
              username: newMechanic.username,
              fullName: newMechanic.fullName,
              email: newMechanic.email,
              phone: newMechanic.phone || '',
              specialization: newMechanic.specialization || '',
              role: 'Mechanic',
              createdAt: new Date().toISOString()
            };

            mockData.users.push(mechanic);
            return Promise.resolve({ data: mechanic });
          }
        }

        // Handle PUT requests with mock data
        if (method === 'put') {
          const urlParts = url.split('/');
          const id = urlParts[urlParts.length - 1];

          if (url.includes('/api/cars')) {
            const updatedCar = JSON.parse(error.config.data || '{}');
            const index = mockData.cars.findIndex(c => c.plateNumber === id);
            if (index !== -1) {
              mockData.cars[index] = { ...mockData.cars[index], ...updatedCar };
              return Promise.resolve({ data: mockData.cars[index] });
            }
          }

          if (url.includes('/api/services')) {
            const updatedService = JSON.parse(error.config.data || '{}');
            const index = mockData.services.findIndex(s => s.serviceCode === id);
            if (index !== -1) {
              mockData.services[index] = { ...mockData.services[index], ...updatedService };
              return Promise.resolve({ data: mockData.services[index] });
            }
          }

          if (url.includes('/api/service-records')) {
            const updatedRecord = JSON.parse(error.config.data || '{}');
            const index = mockData.serviceRecords.findIndex(r => r.recordNumber === parseInt(id));
            if (index !== -1) {
              mockData.serviceRecords[index] = { ...mockData.serviceRecords[index], ...updatedRecord };
              return Promise.resolve({ data: mockData.serviceRecords[index] });
            }
          }
        }

        // Handle DELETE requests with mock data
        if (method === 'delete') {
          const urlParts = url.split('/');
          const id = urlParts[urlParts.length - 1];

          if (url.includes('/api/cars')) {
            const index = mockData.cars.findIndex(c => c.plateNumber === id);
            if (index !== -1) {
              const deletedCar = mockData.cars[index];
              mockData.cars.splice(index, 1);
              return Promise.resolve({ data: deletedCar });
            }
          }

          if (url.includes('/api/services')) {
            const index = mockData.services.findIndex(s => s.serviceCode === id);
            if (index !== -1) {
              const deletedService = mockData.services[index];
              mockData.services.splice(index, 1);
              return Promise.resolve({ data: deletedService });
            }
          }

          if (url.includes('/api/service-records')) {
            const index = mockData.serviceRecords.findIndex(r => r.recordNumber === parseInt(id));
            if (index !== -1) {
              const deletedRecord = mockData.serviceRecords[index];
              mockData.serviceRecords.splice(index, 1);
              return Promise.resolve({ data: deletedRecord });
            }
          }
        }
      } catch (mockError) {
        console.error('Error in mock data handling:', mockError);
        return Promise.reject(new Error('Error processing mock data'));
      }
    }

    // If not using mock data or no mock data available for this request
    return Promise.reject(error);
  }
);

// Set JWT token for all requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
