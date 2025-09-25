import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, user }) => {
  // Fallback: get user from localStorage if not passed
  const currentUser = user || JSON.parse(localStorage.getItem("user"));

  if (!currentUser) {
    // Not logged in
    return <Navigate to="/staff-login" replace />;
  }

  if (allowedRoles) {
    // Check if user has at least one allowed role
    const userRoles = currentUser.roles?.map(role => role.name) || [];
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    if (!hasPermission) {
      return <Navigate to="/staff-login" replace />;
    }
  }

  // Always wrap children in a fragment
  return <>{children}</>;
};

export default ProtectedRoute;
