import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken } from '../services/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div
      className={`h-full bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 text-white flex flex-col justify-between fixed top-0 right-0 shadow-2xl transition-all duration-300 z-10 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-20 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 border-2 border-white/20"
      >
        {isCollapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Logo and title */}
      <div>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full shadow-lg">
              <span className="text-2xl">🚗</span>
            </div>
            {!isCollapsed && (
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">SmartPark</h3>
                <p className="text-sm text-white/80 mt-1">Car Repair System</p>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/20">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="bg-white/20 backdrop-blur-sm h-10 w-10 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">{user?.username?.substring(0, 2).toUpperCase() || 'US'}</span>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-semibold text-white">{user?.fullName || user?.username}</p>
                <p className="text-xs text-white/80">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  isActive('/dashboard')
                    ? 'bg-white/20 backdrop-blur-sm text-white font-semibold shadow-lg'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">📊</span>
                {!isCollapsed && <span className="text-sm">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/cars"
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  isActive('/cars')
                    ? 'bg-white/20 backdrop-blur-sm text-white font-semibold shadow-lg'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">🚗</span>
                {!isCollapsed && <span className="text-sm">Cars</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  isActive('/services')
                    ? 'bg-white/20 backdrop-blur-sm text-white font-semibold shadow-lg'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">🔧</span>
                {!isCollapsed && <span className="text-sm">Services</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/service-records"
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  isActive('/service-records')
                    ? 'bg-white/20 backdrop-blur-sm text-white font-semibold shadow-lg'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">📋</span>
                {!isCollapsed && <span className="text-sm">Records</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/reports"
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                  isActive('/reports')
                    ? 'bg-white/20 backdrop-blur-sm text-white font-semibold shadow-lg'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">📊</span>
                {!isCollapsed && <span className="text-sm">Reports</span>}
              </Link>
            </li>

            {user?.role === 'Admin' && (
              <li className={isCollapsed ? '' : 'mt-3 pt-3 border-t border-white/20'}>
                <Link
                  to="/mechanics"
                  className={`flex items-center py-3 px-4 rounded-xl transition-all duration-300 ${
                    isActive('/mechanics')
                      ? 'bg-white/20 backdrop-blur-sm text-white font-semibold shadow-lg'
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <span className="text-lg mr-3">👨‍🔧</span>
                  {!isCollapsed && <span className="text-sm">Mechanics</span>}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className={`flex items-center py-3 px-4 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <span className="text-lg mr-3">🚪</span>
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;