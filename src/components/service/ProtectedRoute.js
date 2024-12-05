// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('authToken'); // Check if the user is authenticated
  return isAuthenticated ? element : <Navigate to="/" />;
};

export default ProtectedRoute;
