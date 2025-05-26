import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cars from './pages/Cars';
import Services from './pages/Services';
import ServiceRecords from './pages/ServiceRecords';
import Reports from './pages/Reports';
import Mechanics from './pages/Mechanics';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoutes';
import { setAuthToken } from './services/api';

const App = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes with Sidebar */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Mechanic']} />}>
            <Route
              path="/*"
              element={
                <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                  <div className="flex-grow pr-0 lg:pr-64 transition-all duration-300">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/cars" element={<Cars />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/service-records" element={<ServiceRecords />} />
                      <Route path="/reports" element={<Reports />} />
                      {/* Admin-Only Route */}
                      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                        <Route path="/mechanics" element={<Mechanics />} />
                      </Route>
                      {/* Default redirect to dashboard */}
                      <Route path="/" element={<Dashboard />} />
                    </Routes>
                  </div>
                  <Sidebar />
                </div>
              }
            />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;