import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Cars from './components/Cars.jsx';
import Packages from './components/Packages.jsx';
import ServicePackages from './components/ServicePackages.jsx';
import Payments from './components/Payments.jsx';
import Reports from './components/Reports.jsx';
import Sidebar from './components/Sidebar.jsx';
import './App.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5004';
axios.defaults.withCredentials = true;

const AppContent = () => {
  const { isDarkMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is logged in via localStorage first
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        console.log('Found existing user session:', JSON.parse(currentUser));
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Try backend auth check
      const response = await axios.get('/api/check-auth');
      setIsAuthenticated(response.data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'cars':
        return <Cars />;
      case 'packages':
        return <Packages />;
      case 'services':
        return <ServicePackages />;
      case 'payments':
        return <Payments />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Main Content */}
      <div className="min-h-screen">
        {renderCurrentPage()}
      </div>

      {/* Right Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setIsAuthenticated={setIsAuthenticated}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
