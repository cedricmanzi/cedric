import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Register = ({ setShowRegister }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('Attempting registration with:', { ...formData, password: '***', confirmPassword: '***' }); // Debug log

    // Client-side validation
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Get existing users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    // Check if username already exists
    if (registeredUsers.find(u => u.username === formData.username)) {
      setError('Username already exists. Please choose a different username.');
      setLoading(false);
      return;
    }

    // Add new user to localStorage
    const newUser = {
      id: Date.now(), // Simple ID generation
      username: formData.username,
      password: formData.password,
      registeredAt: new Date().toISOString()
    };

    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    console.log('✅ User registered successfully:', formData.username);
    setSuccess(`Registration successful! You can now login with username: ${formData.username}`);

    // Try backend as well (if available)
    try {
      const response = await axios.post('/api/register', formData);
      console.log('Backend registration also successful:', response.data);
    } catch (error) {
      console.log('Backend not available, but client-side registration completed');
    }

    setFormData({
      username: '',
      password: '',
      confirmPassword: ''
    });

    // Redirect to login after 2 seconds
    setTimeout(() => {
      setShowRegister(false);
    }, 2000);

    setLoading(false);
  };

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
            Create Account
          </h1>
          <p className={`text-sm text-center mt-1 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join Car Wash Management System
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
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Choose a username"
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
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Create a password"
              />
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Confirm your password"
              />
            </div>

            {error && (
              <div className={`p-3 rounded text-sm ${
                isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-50 text-red-700'
              }`}>
                {error}
              </div>
            )}

            {success && (
              <div className={`p-3 rounded text-sm ${
                isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-50 text-green-700'
              }`}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded font-medium transition-colors ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              className={`font-medium ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
