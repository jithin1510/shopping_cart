import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  if (!roles.includes(user.role)) {
    // User doesn't have the required role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // User has the required role, render the children
  return children;
};

export default RoleRoute;