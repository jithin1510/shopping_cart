import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  // User is authenticated, render the children
  return children;
};

export default PrivateRoute;