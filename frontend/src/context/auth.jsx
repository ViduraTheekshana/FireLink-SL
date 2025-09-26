import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const authUtils = {
	setTokens: ({ accessToken, user }) => {
		localStorage.setItem("token", accessToken);
		localStorage.setItem("user", JSON.stringify(user));
	},
	getAccessToken: () => localStorage.getItem("token"),
	clearTokens: () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},
	isAuthenticated: () => !!localStorage.getItem("token"),
};

const getInitialUser = () => {
	const userJson = localStorage.getItem("user");
	if (authUtils.isAuthenticated() && userJson) {
		return JSON.parse(userJson);
	}
	return null;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(getInitialUser);

	const logout = async () => {
		authUtils.clearTokens();
		setUser(null);
	};

	const value = {
		user,
		logout,
		checkRole: (r) => user?.position === r,
		isAuthenticated: authUtils.isAuthenticated(),
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
