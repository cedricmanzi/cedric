import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ setIsAuthenticated }) => {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('currentUser');
      console.log('✅ User logged out successfully');

      // Try backend logout as well
      await axios.post('/api/logout');
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Backend logout failed, but local logout successful');
      // Clear localStorage anyway and logout
      localStorage.removeItem('currentUser');
      setIsAuthenticated(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">CWSMS</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/cars"
                  className={`text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium ${isActive('/cars')}`}
                >
                  Cars
                </Link>
                <Link
                  to="/packages"
                  className={`text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium ${isActive('/packages')}`}
                >
                  Packages
                </Link>
                <Link
                  to="/services"
                  className={`text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium ${isActive('/services')}`}
                >
                  Services
                </Link>
                <Link
                  to="/payments"
                  className={`text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium ${isActive('/payments')}`}
                >
                  Payments
                </Link>
                <Link
                  to="/reports"
                  className={`text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium ${isActive('/reports')}`}
                >
                  Reports
                </Link>
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
