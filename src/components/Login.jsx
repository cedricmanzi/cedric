import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';
import Register from './Register.jsx';

const Login = ({ setIsAuthenticated }) => {
  const { isDarkMode } = useTheme();
  const [showRegister, setShowRegister] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting login with:', credentials); // Debug log

    // Get registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    // Check credentials against stored users
    const user = registeredUsers.find(u =>
      u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      console.log('✅ Login successful for:', credentials.username);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Try backend if available
    try {
      const response = await axios.post('/api/login', credentials);
      console.log('Login response:', response.data); // Debug log
      if (response.data.message === 'Login successful' || response.data.success) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Backend login failed...', error);
    }

    // If we get here, login failed
    setError('Invalid username or password. Please register a new account if you don\'t have one.');
    setLoading(false);
  };

  if (showRegister) {
    return <Register setShowRegister={setShowRegister} />;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`w-full max-w-md ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-md border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className={`text-xl font-semibold text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Sign In
          </h1>
          <p className={`text-sm text-center mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Car Wash Management System
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className={`p-3 rounded text-sm ${
                isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-50 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t text-center ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className={`font-medium ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
