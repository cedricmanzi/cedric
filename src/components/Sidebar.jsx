import React from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Sidebar = ({ currentPage, setCurrentPage, setIsAuthenticated }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'cars', name: 'Cars' },
    { id: 'packages', name: 'Packages' },
    { id: 'services', name: 'Services' },
    { id: 'payments', name: 'Payments' },
    { id: 'reports', name: 'Reports' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
  };

  const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : { username: 'User' };
  };

  const currentUser = getCurrentUser();

  return (
    <div className={`fixed right-0 top-0 h-full w-64 ${
      isDarkMode
        ? 'bg-gray-900 border-l border-gray-700'
        : 'bg-white border-l border-gray-200'
    } shadow-xl z-50 flex flex-col`}>

      {/* Header */}
      <div className={`p-4 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Car Wash MS
          </h2>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* User Info */}
        <div className={`flex items-center space-x-2 p-2 rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
          } text-white font-bold text-sm`}>
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={`font-medium text-sm ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {currentUser.username}
            </p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              User
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  currentPage === item.id
                    ? isDarkMode
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="font-medium text-sm">{item.name}</span>
                {currentPage === item.id && (
                  <span>
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center px-3 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          <span className="font-medium text-sm">Logout</span>
        </button>

        <div className={`mt-2 text-center text-xs ${
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          CWMS v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
