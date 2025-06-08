import React from 'react';
import { useAuth } from '../context/AuthContext';

// Renders children only if user has one of the specified roles
export default function RoleBasedUI({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) return null;
  const hasRole = user.roles.some(r => allowedRoles.includes(r));
  return hasRole ? <>{children}</> : null;
}
