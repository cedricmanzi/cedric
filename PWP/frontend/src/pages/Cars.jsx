import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: '',
    model: '',
    manufacturingYear: '',
    driverPhone: '',
    mechanicName: ''
  });
  const [editingPlateNumber, setEditingPlateNumber] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cars');
      setCars(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Unable to load cars. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingPlateNumber) {
        await api.put(`/api/cars/${editingPlateNumber}`, formData);
        setSuccess('Car updated successfully');
      } else {
        await api.post('/api/cars', formData);
        setSuccess('Car added successfully');
      }

      setFormData({
        plateNumber: '',
        type: '',
        model: '',
        manufacturingYear: '',
        driverPhone: '',
        mechanicName: ''
      });
      setEditingPlateNumber(null);
      fetchCars();

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving car:', err);
      setError(err.response?.data?.message || 'Error saving car. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (car) => {
    setFormData({
      plateNumber: car.plateNumber,
      type: car.type,
      model: car.model,
      manufacturingYear: car.manufacturingYear,
      driverPhone: car.driverPhone,
      mechanicName: car.mechanicName
    });
    setEditingPlateNumber(car.plateNumber);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (plateNumber) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await api.delete(`/api/cars/${plateNumber}`);
        setSuccess('Car deleted successfully');
        fetchCars();

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } catch (err) {
        console.error('Error deleting car:', err);
        setError(err.response?.data?.message || 'Error deleting car. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      plateNumber: '',
      type: '',
      model: '',
      manufacturingYear: '',
      driverPhone: '',
      mechanicName: ''
    });
    setEditingPlateNumber(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Car Management</h1>
        <p className="text-gray-600">Add, edit and manage cars in the system</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p>{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingPlateNumber ? 'Edit Car Information' : 'Add New Car'}
          </h2>
          {editingPlateNumber && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Editing: {editingPlateNumber}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                disabled={editingPlateNumber}
                className={`w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  editingPlateNumber ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="e.g. RAD123A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Sedan, SUV, Truck"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Toyota Corolla"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Year</label>
              <input
                type="number"
                name="manufacturingYear"
                value={formData.manufacturingYear}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1900"
                max={new Date().getFullYear() + 1}
                placeholder={new Date().getFullYear().toString()}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Phone</label>
              <input
                type="text"
                name="driverPhone"
                value={formData.driverPhone}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 0789123456"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mechanic Name</label>
              <input
                type="text"
                name="mechanicName"
                value={formData.mechanicName}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. John Doe"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (editingPlateNumber ? 'Updating...' : 'Saving...') : (editingPlateNumber ? 'Update Car' : 'Add Car')}
            </button>
            {editingPlateNumber && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Car List</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {cars.length} {cars.length === 1 ? 'car' : 'cars'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading cars...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mechanic
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p className="text-lg font-medium">No cars found</p>
                        <p className="text-sm text-gray-400 mb-2">Add a new car to get started</p>
                        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg max-w-md">
                          <p className="font-medium mb-1">Car Information Guide:</p>
                          <ul className="list-disc list-inside text-left space-y-1 text-gray-600">
                            <li>Plate Number: Enter the vehicle's license plate</li>
                            <li>Type: Vehicle category (Sedan, SUV, Truck, etc.)</li>
                            <li>Model: Make and model (Toyota Corolla, Honda CR-V, etc.)</li>
                            <li>Driver Phone: Contact number of the vehicle owner</li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cars.map((car) => (
                    <tr key={car.plateNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{car.plateNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {car.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {car.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {car.manufacturingYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {car.driverPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {car.mechanicName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(car)}
                          disabled={submitting}
                          className="text-blue-600 hover:text-blue-900 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(car.plateNumber)}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;
