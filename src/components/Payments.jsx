import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';
import Bill from './Bill.jsx';

const Payments = () => {
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [unpaidServices, setUnpaidServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [billData, setBillData] = useState(null);
  const [formData, setFormData] = useState({
    AmountPaid: '',
    PaymentDate: '',
    RecordNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchUnpaidServices();
  }, []);

  const fetchPayments = async () => {
    try {
      // Try localStorage first
      const storedPayments = localStorage.getItem('payments');
      if (storedPayments) {
        setPayments(JSON.parse(storedPayments));
        return;
      }

      // Try backend if available
      const response = await axios.get('/api/payments');
      setPayments(response.data);
    } catch (error) {
      console.log('Backend not available, using localStorage');
      const storedPayments = localStorage.getItem('payments');
      setPayments(storedPayments ? JSON.parse(storedPayments) : []);
    }
  };

  const fetchUnpaidServices = async () => {
    try {
      // Get services and payments from localStorage
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
      const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');

      // Find services that haven't been paid for
      const paidRecordNumbers = storedPayments.map(payment => payment.RecordNumber);
      const unpaid = storedServices.filter(service =>
        !paidRecordNumbers.includes(service.RecordNumber)
      );

      setUnpaidServices(unpaid);
    } catch (error) {
      console.error('Failed to fetch unpaid services');
      setUnpaidServices([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Auto-fill amount when service is selected
    if (name === 'RecordNumber') {
      const selectedService = unpaidServices.find(service => service.RecordNumber == value);
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          AmountPaid: selectedService.PackagePrice
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get current data from localStorage
      const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');

      // Find the service being paid for
      const selectedService = storedServices.find(service =>
        service.RecordNumber == formData.RecordNumber
      );

      if (!selectedService) {
        setError('Selected service not found');
        setLoading(false);
        return;
      }

      // Create new payment record
      const newPaymentNumber = Math.max(...storedPayments.map(p => p.PaymentNumber || 0), 0) + 1;
      const newPayment = {
        PaymentNumber: newPaymentNumber,
        RecordNumber: parseInt(formData.RecordNumber),
        AmountPaid: parseFloat(formData.AmountPaid),
        PaymentDate: formData.PaymentDate,
        ServiceDate: selectedService.ServiceDate,
        PlateNumber: selectedService.PlateNumber,
        DriverName: selectedService.DriverName,
        PackageName: selectedService.PackageName,
        PackagePrice: selectedService.PackagePrice
      };

      // Save payment to localStorage
      const updatedPayments = [...storedPayments, newPayment];
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
      setPayments(updatedPayments);

      // Create bill data
      const billData = {
        PaymentNumber: newPaymentNumber,
        ServiceDate: selectedService.ServiceDate,
        PaymentDate: formData.PaymentDate,
        PlateNumber: selectedService.PlateNumber,
        DriverName: selectedService.DriverName,
        CarType: selectedService.CarType,
        PackageName: selectedService.PackageName,
        PackagePrice: selectedService.PackagePrice,
        AmountPaid: parseFloat(formData.AmountPaid)
      };

      setBillData(billData);
      setShowBill(true);

      // Try backend as well
      try {
        await axios.post('/api/payments', formData);
      } catch (error) {
        console.log('Backend payment failed, but localStorage updated');
      }

      fetchUnpaidServices();
      resetForm();
    } catch (error) {
      setError('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      AmountPaid: '',
      PaymentDate: '',
      RecordNumber: ''
    });
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const viewBill = async (recordNumber) => {
    try {
      // Get payment and service data from localStorage
      const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');

      // Find the payment for this record
      const payment = storedPayments.find(p => p.RecordNumber === recordNumber);
      const service = storedServices.find(s => s.RecordNumber === recordNumber);

      if (!payment || !service) {
        setError('Bill data not found');
        return;
      }

      // Create bill data
      const billData = {
        PaymentNumber: payment.PaymentNumber,
        ServiceDate: service.ServiceDate,
        PaymentDate: payment.PaymentDate,
        PlateNumber: service.PlateNumber,
        DriverName: service.DriverName,
        CarType: service.CarType,
        PackageName: service.PackageName,
        PackagePrice: service.PackagePrice,
        AmountPaid: payment.AmountPaid
      };

      setBillData(billData);
      setShowBill(true);
    } catch (error) {
      setError('Failed to fetch bill');
    }
  };

  const deletePayment = async (paymentNumber) => {
    if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return;
    }

    try {
      // Get current payments from localStorage
      const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');

      // Remove the payment with the specified payment number
      const updatedPayments = storedPayments.filter(payment => payment.PaymentNumber !== paymentNumber);

      // Save updated payments back to localStorage
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
      setPayments(updatedPayments);

      // Refresh unpaid services since deleting a payment makes the service unpaid again
      fetchUnpaidServices();

      // Try to delete from backend as well (if available)
      try {
        await axios.delete(`/api/payments/${paymentNumber}`);
      } catch (error) {
        console.log('Backend delete failed, but localStorage updated');
      }

      setError('');
    } catch (error) {
      setError('Failed to delete payment');
    }
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
              Payment Management
            </h1>
            <p className={`mt-1 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Process payments and generate bills
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isDarkMode
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            Process Payment
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Process Payment</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Record
                </label>
                <select
                  name="RecordNumber"
                  value={formData.RecordNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Service</option>
                  {unpaidServices.map((service) => (
                    <option key={service.RecordNumber} value={service.RecordNumber}>
                      #{service.RecordNumber} - {service.PlateNumber} - {service.PackageName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid (RWF)
                </label>
                <input
                  type="number"
                  name="AmountPaid"
                  value={formData.AmountPaid}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="PaymentDate"
                  value={formData.PaymentDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-3 flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Process Payment'}
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
          <table className={`min-w-full divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Payment #
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Service Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Plate Number
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Driver Name
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Package
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Amount Paid
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Payment Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode
                ? 'bg-gray-800 divide-gray-700'
                : 'bg-white divide-gray-200'
            }`}>
              {payments.map((payment) => (
                <tr key={payment.PaymentNumber}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {payment.PaymentNumber}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {formatDate(payment.ServiceDate)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {payment.PlateNumber}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {payment.DriverName}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {payment.PackageName}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {Number(payment.AmountPaid).toLocaleString()} RWF
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {formatDate(payment.PaymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewBill(payment.RecordNumber)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        View Bill
                      </button>
                      <button
                        onClick={() => deletePayment(payment.PaymentNumber)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          isDarkMode
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No payments found. Process your first payment to get started.</p>
          </div>
        )}
      </div>

      {showBill && billData && (
        <Bill
          billData={billData}
          onClose={() => setShowBill(false)}
        />
      )}
    </div>
  );
};

export default Payments;
