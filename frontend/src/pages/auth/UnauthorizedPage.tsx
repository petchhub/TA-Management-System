import React from 'react';
import { Link } from 'react-router-dom';

/**
 * UnauthorizedPage component
 * Displayed when user tries to access a route without proper permissions
 */
export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please check with your administrator if you believe this is an error.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
