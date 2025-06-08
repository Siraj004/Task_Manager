import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 
                            rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gray-800">ProjectHub</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-600">Hello, {user.username}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                             hover:bg-blue-700 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium" to="/login">
                  Login
                </Link>
                <Link className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                 transition-colors font-medium" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
