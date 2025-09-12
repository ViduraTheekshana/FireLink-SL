import axios from "axios";
import React, { createContext, useContext, useState } from "react";

const SupplierAuthContext = createContext(null);

export const useSupplierAuth = () => {
	const context = useContext(SupplierAuthContext);
	if (context === null) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const SupplierAuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	const login = async (email, password) => {
		const res = await axios.post("/api/v1/supplier/login", { email, password });

		const { success, user } = res.data;

		if (!success) {
			throw new Error(res.data.message || "Login failed");
		}
		setUser(user);
		return { success, user };
	};

	const logout = async () => {
		const res = await axios.get("/api/v1/supplier/logout");

		if (!res.data.success) {
			throw new Error(res.data.message || "Logout failed");
		}
		setUser(null);
	};

	const value = {
		user,
		login,
		logout,
	};

	return (
		<SupplierAuthContext.Provider value={value}>
			{children}
		</SupplierAuthContext.Provider>
	);
};
