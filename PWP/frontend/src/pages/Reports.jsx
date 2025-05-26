import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import SignatureCanvas from 'react-signature-canvas';
import { FaPrint, FaSignature, FaSave, FaTimes } from 'react-icons/fa';

const Reports = () => {
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [signedBy, setSignedBy] = useState('');
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);

  const signatureRef = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => {
    if (reportType === 'daily') {
      fetchDailyReport();
    } else {
      fetchMonthlyReport();
    }
  }, [reportType]);

  const fetchDailyReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/reports/daily?date=${reportDate}`);

      if (res.data && typeof res.data === 'object') {
        setDailyReport(res.data);
        // Reset signature when a new report is generated
        setSignatureData('');
        setSignedBy('');
        setShowSignature(false);
      } else {
        throw new Error('Invalid report data received');
      }
    } catch (err) {
      console.error('Error fetching daily report:', err);
      setError(err.message || 'Error fetching daily report. Please try again.');
      setDailyReport(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/reports/monthly?month=${reportMonth}&year=${reportYear}`);

      if (res.data && typeof res.data === 'object') {
        setMonthlyReport(res.data);
        // Reset signature when a new report is generated
        setSignatureData('');
        setSignedBy('');
        setShowSignature(false);
      } else {
        throw new Error('Invalid report data received');
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
      setError(err.message || 'Error fetching monthly report. Please try again.');
      setMonthlyReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setReportDate(e.target.value);
  };

  const handleMonthChange = (e) => {
    setReportMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setReportYear(parseInt(e.target.value));
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
  };

  const handleGenerateReport = () => {
    if (reportType === 'daily') {
      fetchDailyReport();
    } else {
      fetchMonthlyReport();
    }
  };

  // Signature functions
  const handleShowSignature = () => {
    setShowSignature(true);
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData('');
    }
  };

  const handleSaveSignature = () => {
    if (signatureRef.current && signedBy.trim()) {
      const signatureImage = signatureRef.current.toDataURL('image/png');
      setSignatureData(signatureImage);
      setShowSignature(false);
    } else {
      setError('Please enter your name before saving the signature');
    }
  };

  // Print function
  const handlePrintReport = () => {
    const printContent = document.getElementById('report-to-print');
    const originalContents = document.body.innerHTML;

    if (printContent) {
      const printStyles = `
        <style>
          @media print {
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .report-header { text-align: center; margin-bottom: 20px; }
            .report-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .report-date { font-size: 16px; margin-bottom: 20px; }
            .report-logo { text-align: center; margin-bottom: 20px; }
            .report-logo img { max-width: 150px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .report-footer { margin-top: 30px; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-box { text-align: center; width: 45%; }
            .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }
            .no-print { display: none; }
            .print-only { display: block; }
            .company-info { text-align: center; margin-bottom: 20px; }
            .company-name { font-size: 18px; font-weight: bold; }
            .company-address { font-size: 14px; }
            .company-contact { font-size: 14px; }
            .page-break { page-break-after: always; }
            .summary-box { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; background-color: #f9f9f9; }
            .summary-title { font-weight: bold; margin-bottom: 10px; }
            .summary-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          }
        </style>
      `;

      document.body.innerHTML = printStyles + printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;

      // Re-initialize the signature canvas after printing
      if (signatureRef.current && signatureData) {
        setTimeout(() => {
          signatureRef.current.fromDataURL(signatureData);
        }, 0);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-amber-600 mb-6">Reports</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex mb-4">
          <button
            onClick={() => handleReportTypeChange('daily')}
            className={`px-4 py-2 rounded-l ${
              reportType === 'daily' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => handleReportTypeChange('monthly')}
            className={`px-4 py-2 rounded-r ${
              reportType === 'monthly' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Monthly Report
          </button>
        </div>

        {reportType === 'daily' ? (
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={reportDate}
                onChange={handleDateChange}
                className="p-2 border rounded"
              />
            </div>
            <button
              onClick={handleGenerateReport}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Month</label>
              <select
                value={reportMonth}
                onChange={handleMonthChange}
                className="p-2 border rounded"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Year</label>
              <select
                value={reportYear}
                onChange={handleYearChange}
                className="p-2 border rounded"
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerateReport}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading report data...</div>
      ) : reportType === 'daily' && dailyReport ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daily Report - {formatDate(dailyReport.date)}</h2>
          <div className="mb-4">
            <p className="text-lg">Total Records: {dailyReport.totalRecords}</p>
            <p className="text-lg font-semibold">Total Amount: {Number(dailyReport.totalAmount).toLocaleString()} RWF</p>
          </div>

          {dailyReport.services.map((service, index) => (
            <div key={index} className="mb-6 border-t pt-4">
              <h3 className="text-lg font-semibold">{service.serviceName}</h3>
              <p>Count: {service.count}</p>
              <p>Total Amount: {Number(service.totalAmount).toLocaleString()} RWF</p>

              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-amber-100 text-amber-800">
                      <th className="py-2 px-4 text-left">Record #</th>
                      <th className="py-2 px-4 text-left">Car</th>
                      <th className="py-2 px-4 text-left">Amount</th>
                      <th className="py-2 px-4 text-left">Received By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.records.map((record, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-4">{record.recordNumber}</td>
                        <td className="py-2 px-4">{record.plateNumber}</td>
                        <td className="py-2 px-4">{Number(record.amountPaid).toLocaleString()} RWF</td>
                        <td className="py-2 px-4">{record.receivedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="mt-4 text-right">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Print Report
            </button>
          </div>
        </div>
      ) : reportType === 'monthly' && monthlyReport ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Monthly Report - {new Date(0, monthlyReport.month - 1).toLocaleString('default', { month: 'long' })} {monthlyReport.year}
          </h2>
          <div className="mb-4">
            <p className="text-lg">Total Records: {monthlyReport.totalRecords}</p>
            <p className="text-lg font-semibold">Total Amount: {Number(monthlyReport.totalAmount).toLocaleString()} RWF</p>
          </div>

          {monthlyReport.days.map((day, index) => (
            <div key={index} className="mb-6 border-t pt-4">
              <h3 className="text-lg font-semibold">{formatDate(day.date)}</h3>
              <p>Count: {day.count}</p>
              <p>Total Amount: {Number(day.totalAmount).toLocaleString()} RWF</p>

              <div className="mt-2">
                <h4 className="font-medium">Services:</h4>
                <ul className="list-disc pl-5">
                  {day.services.map((service, idx) => (
                    <li key={idx}>
                      {service.serviceName}: {service.count} services - {Number(service.totalAmount).toLocaleString()} RWF
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div className="mt-4 text-right">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Print Report
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">No report data available. Please generate a report.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;