import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Reports = () => {
  const { isDarkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const generateReport = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get data from localStorage
      const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
      const storedPackages = JSON.parse(localStorage.getItem('packages') || '[]');

      // Filter payments for the selected date
      const selectedDateStr = selectedDate;
      const dailyPayments = storedPayments.filter(payment => {
        const paymentDate = payment.PaymentDate;
        return paymentDate === selectedDateStr;
      });

      // Create report data by combining payment, service, and package information
      const reportData = dailyPayments.map(payment => {
        const service = storedServices.find(s => s.RecordNumber === payment.RecordNumber);
        const packageInfo = storedPackages.find(p => p.PackageNumber === payment.RecordNumber) ||
                           storedPackages.find(p => p.PackageName === payment.PackageName);

        return {
          PlateNumber: payment.PlateNumber,
          PackageName: payment.PackageName,
          PackageDescription: packageInfo?.PackageDescription || 'Service package',
          AmountPaid: payment.AmountPaid,
          PaymentDate: payment.PaymentDate,
          DriverName: payment.DriverName
        };
      });

      setReportData(reportData);

      // Calculate total amount
      const total = reportData.reduce((sum, record) => sum + Number(record.AmountPaid), 0);
      setTotalAmount(total);

      // Try backend as well (if available)
      try {
        const response = await axios.get(`/api/reports/daily/${selectedDate}`);
        // If backend is available, you could merge or compare data here
        console.log('Backend report data also available:', response.data);
      } catch (error) {
        console.log('Backend not available, using localStorage data');
      }

    } catch (error) {
      setError('Failed to generate report');
      setReportData([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Plate Number', 'Package Name', 'Package Description', 'Amount Paid', 'Payment Date'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(record => [
        record.PlateNumber,
        `"${record.PackageName}"`,
        `"${record.PackageDescription}"`,
        record.AmountPaid,
        formatDate(record.PaymentDate)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `daily_report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pr-64 p-6">
      <div className={`shadow-lg rounded-xl p-6 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
      }`}>
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Daily Reports
          </h1>
          <p className={`mt-1 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Generate and view daily revenue reports
          </p>
        </div>

        {/* Date Selection */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {reportData.length > 0 && (
          <>
            {/* Report Header */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Daily Report for {formatDate(selectedDate)}
                  </h2>
                  <p className="text-gray-600">
                    Total Transactions: {reportData.length}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    Total Revenue: {totalAmount.toLocaleString()} RWF
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Print Report
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plate Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.PlateNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.PackageName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.PackageDescription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Number(record.AmountPaid).toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.PaymentDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-sm font-bold text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                      {totalAmount.toLocaleString()} RWF
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {reportData.length === 0 && selectedDate && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found for the selected date.</p>
          </div>
        )}

        {!selectedDate && (
          <div className="text-center py-8">
            <p className="text-gray-500">Please select a date to generate a report.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .space-y-6, .space-y-6 * {
            visibility: visible;
          }
          .space-y-6 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
          .bg-blue-50 {
            background-color: #f0f9ff !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
