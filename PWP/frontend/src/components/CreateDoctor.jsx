import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateDoctor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/users/create-doctor', formData);
      alert('Doctor user created successfully!');
      navigate('/doctors');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-amber-50 min-h-screen">
      <h2 className="text-3xl font-bold text-amber-700 mb-6 text-center">Create Doctor</h2>
      {error && <div className="text-red-600 mb-6 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 bg-white p-6 shadow-md rounded-lg border border-amber-200">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="border border-amber-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border border-amber-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border border-amber-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition font-semibold"
        >
          {loading ? 'Creating...' : 'Create Doctor'}
        </button>
      </form>
    </div>
  );
};

export default CreateDoctor;