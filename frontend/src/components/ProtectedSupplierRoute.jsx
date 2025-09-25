import React from "react";
import { Navigate } from "react-router-dom";
import { useSupplierAuth } from "../context/supplierAuth";
import Loader from "./Loader";

const ProtectedSupplierRoute = ({ children }) => {
	const { user, loading } = useSupplierAuth();

	if (loading) return <Loader />;

	if (!user) {
		return <Navigate to="/supplier-login" replace />;
	}

	return children;
};

export default ProtectedSupplierRoute;
