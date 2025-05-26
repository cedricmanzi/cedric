import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle form data changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission (login)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For testing purposes, simulate a successful login
      // Comment this out when the backend is working
      const user = JSON.parse(localStorage.getItem('user')) || {
        id: 1,
        username: formData.username,
        role: 'Mechanic',
        fullName: formData.username
      };

      // Check if username is 'admin' for admin role
      if (formData.username === 'admin') {
        user.role = 'Admin';
        user.fullName = 'System Administrator';
      }

      // Generate a fake token
      const token = 'fake_token_' + Math.random().toString(36).substring(2);

      // Store token and user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set the authorization token in axios headers
      setAuthToken(token);

      // Redirect to dashboard
      navigate('/dashboard');

      // Uncomment this when the backend is working
      /*
      const res = await api.post('/api/users/login', formData);
      const { token, user } = res.data;

      // Store token and user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set the authorization token in axios headers
      setAuthToken(token);

      // Redirect to dashboard
      navigate('/dashboard');
      */
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Backend server might be down.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
          <p className="text-gray-500">Sign in to SmartPark Management System</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
            <input
              name="username"
              placeholder="Enter your username"
              onChange={handleChange}
              value={formData.username}
              required
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              onChange={handleChange}
              value={formData.password}
              required
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
