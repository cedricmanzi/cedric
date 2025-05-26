import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalCars: 0,
    totalPackages: 0,
    servicesThisMonth: 0,
    revenueThisMonth: 0,
    servicesThisWeek: 0,
    revenueThisWeek: 0,
    recentServices: [],
    recentPayments: []
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const cars = JSON.parse(localStorage.getItem('cars') || '[]');
    const packages = JSON.parse(localStorage.getItem('packages') || '[]');
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');

    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter this month's data
    const thisMonthServices = services.filter(service => {
      const serviceDate = new Date(service.ServiceDate);
      return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear;
    });

    const thisMonthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.PaymentDate);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    // Filter this week's data
    const thisWeekServices = services.filter(service => {
      const serviceDate = new Date(service.ServiceDate);
      return serviceDate >= oneWeekAgo;
    });

    const thisWeekPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.PaymentDate);
      return paymentDate >= oneWeekAgo;
    });

    // Calculate revenue
    const monthlyRevenue = thisMonthPayments.reduce((sum, payment) => sum + Number(payment.AmountPaid), 0);
    const weeklyRevenue = thisWeekPayments.reduce((sum, payment) => sum + Number(payment.AmountPaid), 0);

    // Get recent services (last 5)
    const recentServices = services
      .sort((a, b) => new Date(b.ServiceDate) - new Date(a.ServiceDate))
      .slice(0, 5);

    // Get recent payments (last 5)
    const recentPayments = payments
      .sort((a, b) => new Date(b.PaymentDate) - new Date(a.PaymentDate))
      .slice(0, 5);

    setStats({
      totalCars: cars.length,
      totalPackages: packages.length,
      servicesThisMonth: thisMonthServices.length,
      revenueThisMonth: monthlyRevenue,
      servicesThisWeek: thisWeekServices.length,
      revenueThisWeek: weeklyRevenue,
      recentServices,
      recentPayments
    });
  };

  const StatCard = ({ title, value, color, subtitle }) => (
    <div className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${
      isDarkMode
        ? `bg-gray-800 border border-gray-700`
        : `bg-white border border-gray-100`
    }`}>
      <div>
        <p className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {title}
        </p>
        <p className={`text-3xl font-bold ${color} mt-2`}>
          {value}
        </p>
        {subtitle && (
          <p className={`text-xs mt-1 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : { username: 'User' };
  };

  const currentUser = getCurrentUser();

  return (
    <div className="space-y-6 pr-64 p-6">
      {/* Welcome Header */}
      <div className={`rounded-xl p-8 ${
        isDarkMode
          ? 'bg-gradient-to-r from-blue-900 to-purple-900'
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
      } text-white`}>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {currentUser.username}!
        </h1>
        <p className="text-xl opacity-90">
          Here's what's happening with your car wash business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Cars"
          value={stats.totalCars}
          color={isDarkMode ? 'text-blue-400' : 'text-blue-600'}
          subtitle="Registered vehicles"
        />
        <StatCard
          title="Service Packages"
          value={stats.totalPackages}
          color={isDarkMode ? 'text-green-400' : 'text-green-600'}
          subtitle="Available packages"
        />
        <StatCard
          title="This Week's Services"
          value={stats.servicesThisWeek}
          color={isDarkMode ? 'text-purple-400' : 'text-purple-600'}
          subtitle="Services completed"
        />
        <StatCard
          title="Weekly Revenue"
          value={`${stats.revenueThisWeek.toLocaleString()} RWF`}
          color={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}
          subtitle="Last 7 days"
        />
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard
          title="Monthly Services"
          value={stats.servicesThisMonth}
          color={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}
          subtitle="This month's total"
        />
        <StatCard
          title="Monthly Revenue"
          value={`${stats.revenueThisMonth.toLocaleString()} RWF`}
          color={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}
          subtitle="This month's earnings"
        />
      </div>
    </div>
  );
};

export default Dashboard;
