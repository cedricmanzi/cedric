import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Mechanics = () => {
  const [mechanics, setMechanics] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    specialization: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users');
      // Filter only mechanics
      const mechanicUsers = res.data.filter(user => user.role === 'Mechanic');
      setMechanics(mechanicUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching mechanics:', err);
      setError('Unable to load mechanics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a mechanic name already exists
  const checkNameExists = (name) => {
    if (!name) return false;
    const normalizedName = name.toLowerCase().trim();
    return mechanics.some(mechanic =>
      mechanic.fullName.toLowerCase().trim() === normalizedName
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate name in real-time
    if (name === 'fullName') {
      setNameError('');

      if (value) {
        // Check if name contains only letters and spaces
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(value)) {
          setNameError('Full name should contain only letters and spaces');
          return;
        }

        // Check if name already exists
        if (checkNameExists(value)) {
          setNameError('A mechanic with this name already exists');
          return;
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      if (!formData.username) {
        throw new Error('Please enter a username');
      }
      if (!formData.password || formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (!formData.fullName) {
        throw new Error('Please enter full name');
      }
      if (!formData.email) {
        throw new Error('Please enter email address');
      }

      // Check if the name contains only letters and spaces
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(formData.fullName)) {
        throw new Error('Full name should contain only letters and spaces');
      }

      // Check if mechanic name already exists
      if (!editingId && checkNameExists(formData.fullName)) {
        throw new Error('A mechanic with this name already exists');
      }

      // Add phone and specialization to the request
      const mechanicData = {
        ...formData,
        role: 'Mechanic'
      };

      await api.post('/api/users/create-mechanic', mechanicData);
      setSuccess('Mechanic created successfully');
      setFormData({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phone: '',
        specialization: ''
      });
      fetchMechanics();

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error creating mechanic:', err);
      setError(err.message || 'Error creating mechanic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Mechanics Management</h1>

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

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New Mechanic</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full p-2.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  nameError ? 'border-red-500' : ''
                }`}
                required
                disabled={submitting}
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength="8"
                disabled={submitting}
              />
              <small className="text-gray-500">
                Password must be at least 8 characters long
              </small>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={submitting || nameError !== ''}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Mechanic'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Mechanics List</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {mechanics.length} {mechanics.length === 1 ? 'mechanic' : 'mechanics'}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading mechanics...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mechanics.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-medium">No mechanics found</p>
                        <p className="text-sm text-gray-400 mb-2">Add a new mechanic to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mechanics.map((mechanic) => (
                    <tr key={mechanic.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{mechanic.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mechanic.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{mechanic.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{mechanic.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{mechanic.createdAt ? formatDate(mechanic.createdAt) : '-'}</div>
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

export default Mechanics;
