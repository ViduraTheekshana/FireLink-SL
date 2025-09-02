import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
export const saveToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");

const AuthContext = createContext();

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.baseURL = API_BASE_URL;

// Token helpers (localStorage instead of memory)
const TOKEN_KEY = "fire_access_token";
const REFRESH_KEY = "fire_refresh_token";

export const authUtils = {
	setTokens: ({ accessToken, refreshToken }) => {
		localStorage.setItem(TOKEN_KEY, accessToken);
		localStorage.setItem(REFRESH_KEY, refreshToken);
	},
	getAccessToken: () => localStorage.getItem(TOKEN_KEY),
	getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
	clearTokens: () => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(REFRESH_KEY);
	},
	isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
	refreshAccessToken: async () => {
		const refreshToken = authUtils.getRefreshToken();
		if (!refreshToken) throw new Error("No refresh token");
		const res = await axios.post("/api/auth/refresh", { refreshToken });
		if (res.data.success) {
			authUtils.setTokens({
				accessToken: res.data.data.accessToken,
				refreshToken,
			});
			return res.data.data.accessToken;
		} else {
			authUtils.clearTokens();
			throw new Error("Refresh failed");
		}
	},
	setupAxiosInterceptors: (onLogout) => {
		axios.interceptors.request.use((config) => {
			const token = authUtils.getAccessToken();
			if (token && !config.headers.Authorization) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		axios.interceptors.response.use(
			(res) => res,
			async (error) => {
				const original = error.config;
				if (
					error.response?.status === 401 &&
					error.response?.data?.code === "TOKEN_EXPIRED" &&
					!original._retry
				) {
					original._retry = true;
					try {
						const newToken = await authUtils.refreshAccessToken();
						original.headers.Authorization = `Bearer ${newToken}`;
						return axios(original);
					} catch (err) {
						onLogout();
						return Promise.reject(err);
					}
				}
				return Promise.reject(error);
			}
		);
	},
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		authUtils.setupAxiosInterceptors(logout);
		if (authUtils.isAuthenticated()) {
			getCurrentUser();
		} else {
			setLoading(false);
		}
	}, []);

	const login = async (email, password) => {
		const res = await axios.post("/api/v1/auth/login", { email, password });
		if (res.data.success) {
			const { user, accessToken, refreshToken } = res.data.data;
			authUtils.setTokens({ accessToken, refreshToken });
			setUser(user);
			return { success: true, user };
		}
		throw new Error(res.data.message || "Login failed");
	};

	const logout = async () => {
		try {
			const refreshToken = authUtils.getRefreshToken();
			if (refreshToken) {
				await axios.post("/api/v1/auth/logout", { refreshToken });
			}
		} catch (err) {
			console.error("Logout error", err);
		} finally {
			authUtils.clearTokens();
			setUser(null);
		}
	};

	const getCurrentUser = async () => {
		try {
			const res = await axios.get("/api/v1/auth/me");
			if (res.data.success) {
				setUser(res.data.data.user);
			} else {
				throw new Error("Failed to get user");
			}
		} catch (err) {
			authUtils.clearTokens();
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const value = {
		user,
		loading,
		login,
		logout,
		register: async (data) => axios.post("/api/v1/auth/register", data),
		getCurrentUser,
		hasRole: (r) => user?.roles?.some((role) => role.name === r),
		isAuthenticated: authUtils.isAuthenticated(),
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
