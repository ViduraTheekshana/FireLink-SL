import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authUtils } from "./auth";

const SupplierAuthContext = createContext(null);

const api = axios.create({ withCredentials: true });

export const useSupplierAuth = () => {
	const context = useContext(SupplierAuthContext);
	if (context === null) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const SupplierAuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await api.get("/api/v1/supplier/profile");
				if (res.data.success) {
					setUser(res.data.supplier);
				}
			} catch (err) {
				setUser(null);
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, []);

	const login = async (email, password) => {
		setLoading(true);
		const res = await api.post("/api/v1/supplier/login", { email, password });

		const { success, user } = res.data;

		if (!success) {
			throw new Error(res.data.message || "Login failed");
		}
		authUtils.clearTokens();
		setUser(user);
		setLoading(false);
		return { success, user };
	};

	const logout = async () => {
		setLoading(true);
		const res = await api.get("/api/v1/supplier/logout");

		if (!res.data.success) {
			throw new Error(res.data.message || "Logout failed");
		}
		setUser(null);
		setLoading(false);
	};

	const value = {
		user,
		login,
		logout,
		loading,
	};

	return (
		<SupplierAuthContext.Provider value={value}>
			{children}
		</SupplierAuthContext.Provider>
	);
};
