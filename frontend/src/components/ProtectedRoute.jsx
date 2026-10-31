import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Checking authentication session..." />;
  }

  if (!isAuthenticated) {
    // If admin route, redirect to admin login, else regular login
    const isTargetAdmin = location.pathname.startsWith('/admin');
    return (
      <Navigate
        to={isTargetAdmin ? '/admin/login' : '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  return children;
}
