import React from "react";
import { Navigate } from "react-router-dom";

// props: children, allowedRoles
const ProtectedRoute = ({ children, allowedRoles, user }) => {
  if (!user) {
    // Not logged in
    return <Navigate to="/staff-login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.position)) {
    // Logged in but role not allowed
    return <Navigate to="/staff-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
