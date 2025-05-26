import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    serviceCode: '',
    serviceName: '',
    servicePrice: ''
  });
  const [editingServiceCode, setEditingServiceCode] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/services');
      if (res.data) {
        // Sort services alphabetically by service name
        const sortedServices = [...res.data].sort((a, b) => a.serviceName.localeCompare(b.serviceName));
        setServices(sortedServices);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Unable to load services. Please try again.');
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
      // Validate form data
      if (!formData.serviceCode) {
        throw new Error('Please enter a service code');
      }
      if (!formData.serviceName) {
        throw new Error('Please enter a service name');
      }
      if (!formData.servicePrice || parseFloat(formData.servicePrice) <= 0) {
        throw new Error('Please enter a valid price');
      }

      if (editingServiceCode) {
        await api.put(`/api/services/${editingServiceCode}`, formData);
        setSuccess('Service updated successfully');
      } else {
        await api.post('/api/services', formData);
        setSuccess('Service added successfully');
      }

      setFormData({
        serviceCode: '',
        serviceName: '',
        servicePrice: ''
      });
      setEditingServiceCode(null);
      fetchServices();

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.message || 'Error saving service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service) => {
    setFormData({
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      servicePrice: service.servicePrice
    });
    setEditingServiceCode(service.serviceCode);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (serviceCode) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await api.delete(`/api/services/${serviceCode}`);
        setSuccess('Service deleted successfully');
        fetchServices();

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } catch (err) {
        console.error('Error deleting service:', err);
        setError('Error deleting service. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      serviceCode: '',
      serviceName: '',
      servicePrice: ''
    });
    setEditingServiceCode(null);
    setError(null);
    setSuccess(null);
  };

  // Only Admin can add/edit/delete services
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Service Management</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
          <p>{success}</p>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingServiceCode ? 'Edit Service' : 'Add New Service'}
            </h2>
            {editingServiceCode && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Editing: {editingServiceCode}
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Code</label>
                <input
                  type="text"
                  name="serviceCode"
                  value={formData.serviceCode}
                  onChange={handleChange}
                  disabled={editingServiceCode}
                  className={`w-full p-2.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    editingServiceCode ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Price (RWF)</label>
                <input
                  type="number"
                  name="servicePrice"
                  value={formData.servicePrice}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (editingServiceCode ? 'Updating...' : 'Saving...') : (editingServiceCode ? 'Update Service' : 'Add Service')}
              </button>
              {editingServiceCode && (
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
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Service List</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {services.length} {services.length === 1 ? 'service' : 'services'}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading services...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (RWF)</th>
                  {isAdmin && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? "4" : "3"} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-lg font-medium">No services found</p>
                      {isAdmin ? (
                        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg max-w-md mt-2">
                          <p className="font-medium mb-1">Service Information Guide:</p>
                          <ul className="list-disc list-inside text-left space-y-1 text-gray-600">
                            <li>Service Code: Unique identifier (e.g., OIL-CHG)</li>
                            <li>Service Name: Descriptive name (e.g., Oil Change)</li>
                            <li>Price: Cost of the service in RWF</li>
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No services have been added yet</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.serviceCode} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{service.serviceCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.serviceName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{Number(service.servicePrice).toLocaleString()} RWF</div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="space-x-2">
                          <button
                            onClick={() => handleEdit(service)}
                            disabled={submitting}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(service.serviceCode)}
                            disabled={submitting}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
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

export default Services;
