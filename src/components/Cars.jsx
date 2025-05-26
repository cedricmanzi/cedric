import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Cars = () => {
  const { isDarkMode } = useTheme();
  const [cars, setCars] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    PlateNumber: '',
    CarType: '',
    CarSize: '',
    DriverName: '',
    PhoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      // Try localStorage first
      const storedCars = localStorage.getItem('cars');
      if (storedCars) {
        setCars(JSON.parse(storedCars));
        return;
      }

      // Try backend if available
      const response = await axios.get('/api/cars');
      setCars(response.data);
    } catch (error) {
      console.log('Backend not available, using localStorage');
      // Initialize with empty array if no stored cars
      const storedCars = localStorage.getItem('cars');
      setCars(storedCars ? JSON.parse(storedCars) : []);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get current cars from localStorage
      const storedCars = JSON.parse(localStorage.getItem('cars') || '[]');

      if (editingCar) {
        // Update existing car
        const updatedCars = storedCars.map(car =>
          car.PlateNumber === editingCar.PlateNumber ? { ...formData } : car
        );
        localStorage.setItem('cars', JSON.stringify(updatedCars));
        setCars(updatedCars);

        // Try backend update as well
        try {
          await axios.put(`/api/cars/${editingCar.PlateNumber}`, {
            CarType: formData.CarType,
            CarSize: formData.CarSize,
            DriverName: formData.DriverName,
            PhoneNumber: formData.PhoneNumber
          });
        } catch (error) {
          console.log('Backend update failed, but localStorage updated');
        }
      } else {
        // Add new car
        // Check if plate number already exists
        if (storedCars.find(car => car.PlateNumber === formData.PlateNumber)) {
          setError('Plate number already exists');
          setLoading(false);
          return;
        }

        const newCar = { ...formData, id: Date.now() };
        const updatedCars = [...storedCars, newCar];
        localStorage.setItem('cars', JSON.stringify(updatedCars));
        setCars(updatedCars);

        // Try backend add as well
        try {
          await axios.post('/api/cars', formData);
        } catch (error) {
          console.log('Backend add failed, but localStorage updated');
        }
      }

      resetForm();
    } catch (error) {
      setError('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData(car);
    setShowForm(true);
  };

  const handleDelete = async (plateNumber) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        // Delete from localStorage
        const storedCars = JSON.parse(localStorage.getItem('cars') || '[]');
        const updatedCars = storedCars.filter(car => car.PlateNumber !== plateNumber);
        localStorage.setItem('cars', JSON.stringify(updatedCars));
        setCars(updatedCars);

        // Try backend delete as well
        try {
          await axios.delete(`/api/cars/${plateNumber}`);
        } catch (error) {
          console.log('Backend delete failed, but localStorage updated');
        }
      } catch (error) {
        setError('Failed to delete car');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      PlateNumber: '',
      CarType: '',
      CarSize: '',
      DriverName: '',
      PhoneNumber: ''
    });
    setEditingCar(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 pr-64 p-6">
      <div className={`shadow-lg rounded-xl p-6 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Car Management
            </h1>
            <p className={`mt-1 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your fleet of vehicles
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Add Car
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-4">
              {editingCar ? 'Edit Car' : 'Add New Car'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  name="PlateNumber"
                  value={formData.PlateNumber}
                  onChange={handleInputChange}
                  disabled={editingCar}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Type
                </label>
                <input
                  type="text"
                  name="CarType"
                  value={formData.CarType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Size
                </label>
                <select
                  name="CarSize"
                  value={formData.CarSize}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Size</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="DriverName"
                  value={formData.DriverName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2 flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingCar ? 'Update' : 'Add')} Car
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plate Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cars.map((car) => (
                <tr key={car.PlateNumber}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {car.PlateNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {car.CarType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {car.CarSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {car.DriverName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {car.PhoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(car)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(car.PlateNumber)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cars;
