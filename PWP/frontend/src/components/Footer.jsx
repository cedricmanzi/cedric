import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken } from '../services/api';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ||
           (location.pathname === '/' && path === '/dashboard');
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex-1 grid grid-cols-5">
            <Link
              to="/dashboard"
              className={`py-4 text-center transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'text-white font-medium border-t-2 border-white'
                  : 'text-blue-100 hover:text-white hover:bg-blue-700'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/cars"
              className={`py-4 text-center transition-all duration-200 ${
                isActive('/cars')
                  ? 'text-white font-medium border-t-2 border-white'
                  : 'text-blue-100 hover:text-white hover:bg-blue-700'
              }`}
            >
              Cars
            </Link>

            <Link
              to="/services"
              className={`py-4 text-center transition-all duration-200 ${
                isActive('/services')
                  ? 'text-white font-medium border-t-2 border-white'
                  : 'text-blue-100 hover:text-white hover:bg-blue-700'
              }`}
            >
              Services
            </Link>

            <Link
              to="/service-records"
              className={`py-4 text-center transition-all duration-200 ${
                isActive('/service-records')
                  ? 'text-white font-medium border-t-2 border-white'
                  : 'text-blue-100 hover:text-white hover:bg-blue-700'
              }`}
            >
              Records
            </Link>

            {role === 'Admin' ? (
              <Link
                to="/mechanics"
                className={`py-4 text-center transition-all duration-200 ${
                  isActive('/mechanics')
                    ? 'text-white font-medium border-t-2 border-white'
                    : 'text-blue-100 hover:text-white hover:bg-blue-700'
                }`}
              >
                Mechanics
              </Link>
            ) : (
              <Link
                to="/reports"
                className={`py-4 text-center transition-all duration-200 ${
                  isActive('/reports')
                    ? 'text-white font-medium border-t-2 border-white'
                    : 'text-blue-100 hover:text-white hover:bg-blue-700'
                }`}
              >
                Reports
              </Link>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="py-4 px-8 text-white bg-red-600 hover:bg-red-700 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
