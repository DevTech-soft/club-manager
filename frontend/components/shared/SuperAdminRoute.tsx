import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SuperAdminRouteProps {
  children: ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated || userType !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
