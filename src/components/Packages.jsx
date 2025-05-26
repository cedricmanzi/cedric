import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Packages = () => {
  const { isDarkMode } = useTheme();
  const [packages, setPackages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    PackageName: '',
    PackageDescription: '',
    PackagePrice: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      // Try localStorage first
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        setPackages(JSON.parse(storedPackages));
        return;
      }

      // Try backend if available
      const response = await axios.get('/api/packages');
      setPackages(response.data);
    } catch (error) {
      console.log('Backend not available, using localStorage');
      // Initialize with sample data if no stored packages
      const storedPackages = localStorage.getItem('packages');
      if (!storedPackages) {
        const samplePackages = [
          { PackageNumber: 1, PackageName: 'Basic Wash', PackageDescription: 'Exterior hand wash', PackagePrice: 5000 },
          { PackageNumber: 2, PackageName: 'Premium Wash', PackageDescription: 'Exterior + Interior cleaning', PackagePrice: 8000 },
          { PackageNumber: 3, PackageName: 'Deluxe Wash', PackageDescription: 'Full service with wax', PackagePrice: 12000 }
        ];
        localStorage.setItem('packages', JSON.stringify(samplePackages));
        setPackages(samplePackages);
      } else {
        setPackages(JSON.parse(storedPackages));
      }
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
      // Get current packages from localStorage
      const storedPackages = JSON.parse(localStorage.getItem('packages') || '[]');

      if (editingPackage) {
        // Update existing package
        const updatedPackages = storedPackages.map(pkg =>
          pkg.PackageNumber === editingPackage.PackageNumber
            ? { ...editingPackage, ...formData }
            : pkg
        );
        localStorage.setItem('packages', JSON.stringify(updatedPackages));
        setPackages(updatedPackages);

        // Try backend update as well
        try {
          await axios.put(`/api/packages/${editingPackage.PackageNumber}`, formData);
        } catch (error) {
          console.log('Backend update failed, but localStorage updated');
        }
      } else {
        // Add new package
        const newPackageNumber = Math.max(...storedPackages.map(p => p.PackageNumber || 0), 0) + 1;
        const newPackage = {
          ...formData,
          PackageNumber: newPackageNumber,
          PackagePrice: parseFloat(formData.PackagePrice)
        };
        const updatedPackages = [...storedPackages, newPackage];
        localStorage.setItem('packages', JSON.stringify(updatedPackages));
        setPackages(updatedPackages);

        // Try backend add as well
        try {
          await axios.post('/api/packages', formData);
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

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      PackageName: pkg.PackageName,
      PackageDescription: pkg.PackageDescription,
      PackagePrice: pkg.PackagePrice
    });
    setShowForm(true);
  };

  const handleDelete = async (packageNumber) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        // Delete from localStorage
        const storedPackages = JSON.parse(localStorage.getItem('packages') || '[]');
        const updatedPackages = storedPackages.filter(pkg => pkg.PackageNumber !== packageNumber);
        localStorage.setItem('packages', JSON.stringify(updatedPackages));
        setPackages(updatedPackages);

        // Try backend delete as well
        try {
          await axios.delete(`/api/packages/${packageNumber}`);
        } catch (error) {
          console.log('Backend delete failed, but localStorage updated');
        }
      } catch (error) {
        setError('Failed to delete package');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      PackageName: '',
      PackageDescription: '',
      PackagePrice: ''
    });
    setEditingPackage(null);
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
              Package Management
            </h1>
            <p className={`mt-1 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your service packages
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isDarkMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Add Package
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
              {editingPackage ? 'Edit Package' : 'Add New Package'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  name="PackageName"
                  value={formData.PackageName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Price (RWF)
                </label>
                <input
                  type="number"
                  name="PackagePrice"
                  value={formData.PackagePrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Description
                </label>
                <textarea
                  name="PackageDescription"
                  value={formData.PackageDescription}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2 flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingPackage ? 'Update' : 'Add')} Package
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.PackageNumber} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{pkg.PackageName}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.PackageNumber)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{pkg.PackageDescription}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {Number(pkg.PackagePrice).toLocaleString()} RWF
                </span>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No packages found. Add your first package to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Packages;
