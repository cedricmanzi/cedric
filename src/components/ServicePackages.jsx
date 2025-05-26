import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';

const ServicePackages = () => {
  const { isDarkMode } = useTheme();
  const [services, setServices] = useState([]);
  const [cars, setCars] = useState([]);
  const [packages, setPackages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ServiceDate: '',
    PlateNumber: '',
    PackageNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
    fetchCars();
    fetchPackages();
  }, []);

  const fetchServices = async () => {
    try {
      // Try localStorage first
      const storedServices = localStorage.getItem('services');
      if (storedServices) {
        setServices(JSON.parse(storedServices));
        return;
      }

      // Try backend if available
      const response = await axios.get('/api/service-packages');
      setServices(response.data);
    } catch (error) {
      console.log('Backend not available, using localStorage');
      const storedServices = localStorage.getItem('services');
      setServices(storedServices ? JSON.parse(storedServices) : []);
    }
  };

  const fetchCars = async () => {
    try {
      // Get cars from localStorage
      const storedCars = localStorage.getItem('cars');
      if (storedCars) {
        setCars(JSON.parse(storedCars));
        return;
      }

      // Try backend if available
      const response = await axios.get('/api/cars');
      setCars(response.data);
    } catch (error) {
      console.log('Cars not available from backend, using localStorage');
      setCars([]);
    }
  };

  const fetchPackages = async () => {
    try {
      // Get packages from localStorage
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        setPackages(JSON.parse(storedPackages));
        return;
      }

      // Try backend if available
      const response = await axios.get('/api/packages');
      setPackages(response.data);
    } catch (error) {
      console.log('Packages not available from backend, using localStorage');
      setPackages([]);
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
      // Get current services from localStorage
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
      const storedCars = JSON.parse(localStorage.getItem('cars') || '[]');
      const storedPackages = JSON.parse(localStorage.getItem('packages') || '[]');

      // Find car and package details
      const selectedCar = storedCars.find(car => car.PlateNumber === formData.PlateNumber);
      const selectedPackage = storedPackages.find(pkg => pkg.PackageNumber == formData.PackageNumber);

      if (!selectedCar) {
        setError('Selected car not found. Please add the car first.');
        setLoading(false);
        return;
      }

      if (!selectedPackage) {
        setError('Selected package not found. Please add the package first.');
        setLoading(false);
        return;
      }

      // Create new service record
      const newRecordNumber = Math.max(...storedServices.map(s => s.RecordNumber || 0), 0) + 1;
      const newService = {
        RecordNumber: newRecordNumber,
        ServiceDate: formData.ServiceDate,
        PlateNumber: formData.PlateNumber,
        PackageNumber: parseInt(formData.PackageNumber),
        DriverName: selectedCar.DriverName,
        CarType: selectedCar.CarType,
        PackageName: selectedPackage.PackageName,
        PackagePrice: selectedPackage.PackagePrice
      };

      const updatedServices = [...storedServices, newService];
      localStorage.setItem('services', JSON.stringify(updatedServices));
      setServices(updatedServices);

      // Try backend add as well
      try {
        await axios.post('/api/service-packages', formData);
      } catch (error) {
        console.log('Backend add failed, but localStorage updated');
      }

      resetForm();
    } catch (error) {
      setError('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordNumber) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      try {
        // Delete from localStorage
        const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
        const updatedServices = storedServices.filter(service => service.RecordNumber !== recordNumber);
        localStorage.setItem('services', JSON.stringify(updatedServices));
        setServices(updatedServices);

        // Try backend delete as well
        try {
          await axios.delete(`/api/service-packages/${recordNumber}`);
        } catch (error) {
          console.log('Backend delete failed, but localStorage updated');
        }
      } catch (error) {
        setError('Failed to delete service record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      ServiceDate: '',
      PlateNumber: '',
      PackageNumber: ''
    });
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
              Service Records
            </h1>
            <p className={`mt-1 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Track all car wash services
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isDarkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            Add Service
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Add New Service</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Date
                </label>
                <input
                  type="date"
                  name="ServiceDate"
                  value={formData.ServiceDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car (Plate Number)
                </label>
                <select
                  name="PlateNumber"
                  value={formData.PlateNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Car</option>
                  {cars.map((car) => (
                    <option key={car.PlateNumber} value={car.PlateNumber}>
                      {car.PlateNumber} - {car.DriverName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package
                </label>
                <select
                  name="PackageNumber"
                  value={formData.PackageNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.PackageNumber} value={pkg.PackageNumber}>
                      {pkg.PackageName} - {Number(pkg.PackagePrice).toLocaleString()} RWF
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3 flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Service'}
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
                  Record #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plate Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.RecordNumber}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.RecordNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(service.ServiceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.PlateNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.DriverName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.CarType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.PackageName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Number(service.PackagePrice).toLocaleString()} RWF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(service.RecordNumber)}
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

        {services.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No service records found. Add your first service to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePackages;
