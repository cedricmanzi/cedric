import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [stats, setStats] = useState({
    totalCars: 0,
    totalServices: 0,
    totalServiceRecords: 0,
    totalRevenue: 0,
    recentRecords: [],
    revenueByService: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUsername(user.username);
      setFullName(user.fullName || '');
      setRole(user.role);
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel for better performance
      const [carsRes, servicesRes, recordsRes] = await Promise.all([
        api.get('/api/cars'),
        api.get('/api/services'),
        api.get('/api/service-records')
      ]);

      // Calculate total revenue
      const totalRevenue = recordsRes.data.reduce(
        (sum, record) => sum + parseFloat(record.amountPaid || 0),
        0
      );

      // Get recent service records (last 5)
      const recentRecords = [...recordsRes.data]
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, 5);

      // Calculate revenue by service type
      const revenueByService = {};
      recordsRes.data.forEach(record => {
        const serviceName = record.Service?.serviceName || 'Unknown';
        if (!revenueByService[serviceName]) {
          revenueByService[serviceName] = 0;
        }
        revenueByService[serviceName] += parseFloat(record.amountPaid || 0);
      });

      setStats({
        totalCars: carsRes.data.length,
        totalServices: servicesRes.data.length,
        totalServiceRecords: recordsRes.data.length,
        totalRevenue,
        recentRecords,
        revenueByService
      });

      setError(null);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Unable to fetch dashboard data. Using cached data if available.');

      // Use cached data if available
      if (stats.totalCars === 0) {
        setStats({
          totalCars: 0,
          totalServices: 6,
          totalServiceRecords: 0,
          totalRevenue: 0,
          recentRecords: [],
          revenueByService: {}
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 px-4 sm:px-6 lg:px-8 mb-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">Welcome back, {fullName || username}! 👋</h2>
                <p className="mt-2 text-blue-100 text-lg">
                  SmartPark Car Repair Management Dashboard
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/30">
                  <p className="text-sm font-medium text-white">📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg" role="alert">
              <p className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-gray-600 text-lg">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap lg:flex-nowrap gap-6">
              {/* Main Content */}
              <div className="w-full lg:w-2/3">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-blue-100 uppercase tracking-wide">🚗 Total Cars</h3>
                        <p className="text-3xl font-bold text-white mt-2">{stats.totalCars || 0}</p>
                        <p className="text-xs text-blue-200 mt-1">Registered vehicles</p>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21c0 1.1-0.9 2-2 2H7c-1.1 0-2-0.9-2-2M5 16l-2-9h18l-2 9M17 6V5c0-1.7-1.3-3-3-3h-4c-1.7 0-3 1.3-3 3v1M7 16h10M7 13h10" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-emerald-100 uppercase tracking-wide">🔧 Total Services</h3>
                        <p className="text-3xl font-bold text-white mt-2">{stats.totalServices || 0}</p>
                        <p className="text-xs text-emerald-200 mt-1">Available services</p>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-purple-100 uppercase tracking-wide">📋 Service Records</h3>
                        <p className="text-3xl font-bold text-white mt-2">{stats.totalServiceRecords || 0}</p>
                        <p className="text-xs text-purple-200 mt-1">Completed repairs</p>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-amber-100 uppercase tracking-wide">💰 Total Revenue</h3>
                        <p className="text-3xl font-bold text-white mt-2">{Number(stats.totalRevenue || 0).toLocaleString()} RWF</p>
                        <p className="text-xs text-amber-200 mt-1">Total earnings</p>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    🚀 Quick Access
                  </h3>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      <Link
                        to="/cars"
                        className="group flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <span className="text-2xl">🚗</span>
                        </div>
                        <span className="text-sm font-medium">Cars</span>
                      </Link>

                      <Link
                        to="/services"
                        className="group flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <span className="text-2xl">🔧</span>
                        </div>
                        <span className="text-sm font-medium">Services</span>
                      </Link>

                      <Link
                        to="/service-records"
                        className="group flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <span className="text-2xl">📋</span>
                        </div>
                        <span className="text-sm font-medium">Records</span>
                      </Link>

                      <Link
                        to="/reports"
                        className="group flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <span className="text-2xl">📊</span>
                        </div>
                        <span className="text-sm font-medium">Reports</span>
                      </Link>

                      {role === 'Admin' && (
                        <Link
                          to="/mechanics"
                          className="group flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">👨‍🔧</span>
                          </div>
                          <span className="text-sm font-medium">Mechanics</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Revenue by Service */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    💰 Revenue by Service
                  </h3>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300">
                    {stats.revenueByService && Object.keys(stats.revenueByService).length > 0 ? (
                      <div className="space-y-6">
                        {Object.entries(stats.revenueByService).map(([service, amount], index) => {
                          // Calculate percentage of total revenue
                          const percentage = stats.totalRevenue ? (amount / stats.totalRevenue) * 100 : 0;

                          // Define colors for different services
                          const colors = [
                            'from-blue-500 to-blue-600',
                            'from-emerald-500 to-emerald-600',
                            'from-purple-500 to-purple-600',
                            'from-amber-500 to-orange-500',
                            'from-rose-500 to-pink-500',
                            'from-cyan-500 to-teal-500'
                          ];
                          const colorClass = colors[index % colors.length];

                          return (
                            <div key={service} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-lg font-semibold text-gray-800">{service}</span>
                                <span className="text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                                  {Number(amount || 0).toLocaleString()} RWF
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                <div
                                  className={`bg-gradient-to-r ${colorClass} h-3 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">0%</span>
                                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                                  {percentage.toFixed(1)}% of total
                                </span>
                                <span className="text-xs text-gray-500">100%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                          <span className="text-3xl">📊</span>
                        </div>
                        <p className="text-lg font-semibold mb-2 text-gray-700">No revenue data available</p>
                        <p className="text-sm text-gray-500 max-w-md text-center">Complete service records to see revenue breakdown and performance metrics</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Service Records */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      📋 Recent Service Records
                    </h3>
                    <Link
                      to="/service-records"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                    >
                      View all <span className="ml-1">→</span>
                    </Link>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-indigo-500 to-purple-600">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">📅 Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">🚗 Car</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">🔧 Service</th>
                            <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider">💰 Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {stats.recentRecords && stats.recentRecords.length > 0 ? (
                            stats.recentRecords.map((record, index) => (
                              <tr
                                key={record.recordNumber || `record-${Math.random()}`}
                                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg">
                                      {(record.Car?.plateNumber || record.plateNumber || 'N/A').substring(0, 2)}
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-semibold text-gray-900">{record.Car?.plateNumber || record.plateNumber || 'N/A'}</div>
                                      <div className="text-xs text-gray-500">{record.Car?.model || ''}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="px-3 py-1 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-medium shadow-lg">
                                    {record.Service?.serviceName || record.serviceCode || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-bold text-gray-900 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-full border border-amber-200">
                                    {Number(record.amountPaid || 0).toLocaleString()} RWF
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-4 py-12 text-center">
                                <div className="flex flex-col items-center">
                                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                    <span className="text-2xl">📋</span>
                                  </div>
                                  <p className="text-lg font-semibold mb-2 text-gray-700">No recent service records</p>
                                  <p className="text-sm text-gray-500 max-w-md text-center mb-4">Add service records to track repairs and generate reports</p>
                                  <Link
                                    to="/service-records"
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                  >
                                    Add Service Record
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Sidebar */}
              <div className="w-full lg:w-1/3">
                {/* System Status */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    🖥️ System Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <span className="text-emerald-100 text-sm font-medium">Server Status</span>
                      <span className="px-3 py-1 bg-green-400 text-green-900 rounded-full text-xs font-bold shadow-lg">🟢 Online</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <span className="text-emerald-100 text-sm font-medium">Database</span>
                      <span className="px-3 py-1 bg-green-400 text-green-900 rounded-full text-xs font-bold shadow-lg">🔗 Connected</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <span className="text-emerald-100 text-sm font-medium">Last Backup</span>
                      <span className="text-white text-sm font-semibold">📅 {new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <span className="text-emerald-100 text-sm font-medium">System Version</span>
                      <span className="text-white text-sm font-semibold">🏷️ v1.0.0</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-emerald-100 text-sm font-medium">System Health</span>
                        <span className="text-white text-sm font-bold">95%</span>
                      </div>
                      <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full shadow-sm" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    📈 Recent Activities
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-3 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">🚗</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">New car added</p>
                          <p className="text-xs text-gray-600">Today, 10:30 AM</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-l-4 border-emerald-500 rounded-lg p-3 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">✅</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Service completed</p>
                          <p className="text-xs text-gray-600">Yesterday, 3:45 PM</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg p-3 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">👨‍🔧</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">New mechanic added</p>
                          <p className="text-xs text-gray-600">May 20, 2023</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 rounded-lg p-3 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">💰</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Payment received</p>
                          <p className="text-xs text-gray-600">May 19, 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    View All Activities
                  </button>
                </div>

                {/* Quick Notes */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    📝 Quick Notes
                  </h3>
                  <textarea
                    className="w-full h-24 p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 resize-none text-sm text-white placeholder-white/70"
                    placeholder="Add a note here..."
                  ></textarea>
                  <button className="w-full mt-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 text-sm font-medium border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    💾 Save Note
                  </button>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    📅 Upcoming Appointments
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">🛢️</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Oil Change</p>
                            <p className="text-xs text-gray-600">Toyota Corolla - 2:30 PM</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold shadow-lg">Today</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">🔧</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Brake Repair</p>
                            <p className="text-xs text-gray-600">Honda Civic - 10:00 AM</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-xs font-bold shadow-lg">Tomorrow</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    📆 View Calendar
                  </button>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
