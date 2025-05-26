import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ServiceRecords = () => {
  const [serviceRecords, setServiceRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    plateNumber: '',
    serviceCode: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    receivedBy: '',
    userId: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServiceRecords();
    fetchCars();
    fetchServices();

    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(prev => ({
        ...prev,
        userId: parsedUser.id,
        receivedBy: parsedUser.fullName
      }));
    }
  }, []);

  const fetchServiceRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/service-records');
      if (res.data) {
        // Sort records by recordNumber in descending order (newest first)
        const sortedRecords = [...res.data].sort((a, b) => b.recordNumber - a.recordNumber);
        setServiceRecords(sortedRecords);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching service records:', err);
      setError('Unable to load service records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await api.get('/api/cars');
      if (res.data) {
        // Sort cars alphabetically by plate number
        const sortedCars = [...res.data].sort((a, b) => a.plateNumber.localeCompare(b.plateNumber));
        setCars(sortedCars);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Unable to load cars. Please try again.');
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/api/services');
      if (res.data) {
        // Sort services alphabetically by service name
        const sortedServices = [...res.data].sort((a, b) => a.serviceName.localeCompare(b.serviceName));
        setServices(sortedServices);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Unable to load services. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'serviceCode' && value) {
      const selectedService = services.find(service => service.serviceCode === value);
      if (selectedService) {
        setFormData({
          ...formData,
          [name]: value,
          amountPaid: selectedService.servicePrice
        });
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form data
      if (!formData.plateNumber) {
        throw new Error('Please select a car');
      }
      if (!formData.serviceCode) {
        throw new Error('Please select a service');
      }
      if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (editingId) {
        await api.put(`/api/service-records/${editingId}`, formData);
        setSuccess('Service record updated successfully');
      } else {
        await api.post('/api/service-records', formData);
        setSuccess('Service record added successfully');
      }

      resetForm();
      fetchServiceRecords();

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving service record:', err);
      setError(err.message || 'Error saving service record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setFormData({
      plateNumber: record.plateNumber,
      serviceCode: record.serviceCode,
      amountPaid: record.amountPaid,
      paymentDate: new Date(record.paymentDate).toISOString().split('T')[0],
      receivedBy: record.receivedBy,
      userId: record.userId
    });
    setEditingId(record.recordNumber);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await api.delete(`/api/service-records/${id}`);
        setSuccess('Service record deleted successfully');
        fetchServiceRecords();

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } catch (err) {
        console.error('Error deleting service record:', err);
        setError('Error deleting service record. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      plateNumber: '',
      serviceCode: '',
      amountPaid: '',
      paymentDate: new Date().toISOString().split('T')[0],
      receivedBy: user?.fullName || '',
      userId: user?.id || ''
    });
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const generateBill = async (id) => {
    setSubmitting(true);
    setError(null);

    try {
      // Find the record in our existing data
      const record = serviceRecords.find(r => r.recordNumber === id);

      if (!record) {
        throw new Error('Service record not found');
      }

      // Find the car and service details
      const car = cars.find(c => c.plateNumber === record.plateNumber) ||
                 { plateNumber: record.plateNumber, type: 'Unknown', model: 'Unknown' };

      const service = services.find(s => s.serviceCode === record.serviceCode) ||
                     { serviceName: 'Unknown Service', servicePrice: record.amountPaid };

      // Generate a bill
      const bill = {
        billNumber: `BILL-${id}-${Date.now().toString().slice(-4)}`,
        date: record.paymentDate,
        car: {
          plateNumber: car.plateNumber,
          type: car.type,
          model: car.model
        },
        service: {
          name: service.serviceName,
          price: service.servicePrice
        },
        amountPaid: record.amountPaid,
        receivedBy: record.receivedBy,
        mechanicName: car.mechanicName || 'Not specified'
      };

      setCurrentBill(bill);
      setShowBill(true);
    } catch (err) {
      console.error('Error generating bill:', err);
      setError('Error generating bill. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Service Records</h1>

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

      {showBill && currentBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-xl w-full" id="bill-to-print">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">SmartPark Repair Bill</h2>
              <button
                onClick={() => setShowBill(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none print:hidden"
              >
                X
              </button>
            </div>

            <div className="mb-4 border-b pb-2">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-500">Bill #: {currentBill.billNumber}</p>
                  <p className="text-gray-500">Date: {formatDate(currentBill.date)}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Car Details</h3>
              <p>Plate Number: {currentBill.car.plateNumber}</p>
              <p>Type: {currentBill.car.type}</p>
              <p>Model: {currentBill.car.model}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Service Details</h3>
              <p>Service: {currentBill.service.name}</p>
              <p>Price: {Number(currentBill.service.price).toLocaleString()} RWF</p>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Payment Details</h3>
              <p>Amount Paid: {Number(currentBill.amountPaid).toLocaleString()} RWF</p>
              <p>Received By: {currentBill.receivedBy}</p>
              <p>Mechanic: {currentBill.mechanicName}</p>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-center text-sm text-gray-500">Thank you for choosing SmartPark!</p>
            </div>

            <div className="mt-4 flex justify-end space-x-3 print:hidden">
              <button
                onClick={() => setShowBill(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingId ? 'Edit Service Record' : 'Add New Service Record'}
          </h2>
          {editingId && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Editing Record #{editingId}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Car</label>
              <select
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              >
                <option value="">Select Car</option>
                {cars.map(car => (
                  <option key={car.plateNumber} value={car.plateNumber}>
                    {car.plateNumber} - {car.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                name="serviceCode"
                value={formData.serviceCode}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              >
                <option value="">Select Service</option>
                {services.map(service => (
                  <option key={service.serviceCode} value={service.serviceCode}>
                    {service.serviceName} - {Number(service.servicePrice).toLocaleString()} RWF
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (RWF)</label>
              <input
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update Record' : 'Add Record')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Service Record List</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {serviceRecords.length} {serviceRecords.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No service records found</p>
                        <p className="text-sm text-gray-400 mb-2">Add a new service record to get started</p>
                        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg max-w-md">
                          <p className="font-medium mb-1">Getting Started:</p>
                          <ol className="list-decimal list-inside text-left space-y-1 text-gray-600">
                            <li>First add cars using the Cars page</li>
                            <li>Then create service records by selecting a car and service</li>
                            <li>Generate bills for completed services</li>
                          </ol>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  serviceRecords.map((record) => (
                    <tr key={record.recordNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">#{record.recordNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.Car?.plateNumber || record.plateNumber}</div>
                        <div className="text-xs text-gray-500">{record.Car?.model || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.Service?.serviceName || record.serviceCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{Number(record.amountPaid || 0).toLocaleString()} RWF</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(record.paymentDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{record.receivedBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="space-x-2">
                          <button
                            onClick={() => generateBill(record.recordNumber)}
                            disabled={submitting}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Bill
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            disabled={submitting}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.recordNumber)}
                            disabled={submitting}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
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

export default ServiceRecords;
