import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
	const currentUser = JSON.parse(localStorage.getItem("user"));

	if (!currentUser) {
		return <Navigate to="/staff-login" replace />;
	}

	if (allowedRoles) {
		const hasPermission = allowedRoles.some(
			(role) => role === currentUser.position
		);
		if (!hasPermission) {
			return <Navigate to="/staff-login" replace />;
		}
	}

	return <>{children}</>;
};

export default ProtectedRoute;
