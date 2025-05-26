import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-amber-600 mb-4">Unauthorized</h2>
        <p className="text-lg mb-4">You do not have permission to access this page.</p>
        <Link to="/dashboard" className="text-amber-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;