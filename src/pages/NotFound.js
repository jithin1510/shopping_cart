import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <FaExclamationTriangle className="mx-auto text-6xl text-yellow-500 mb-6" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300"
        >
          <FaHome className="mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;