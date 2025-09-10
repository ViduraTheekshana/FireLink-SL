import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { login, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	// Redirect if already logged in
	useEffect(() => {
		if (user) {
			const from = location.state?.from?.pathname || "/dashboard";
			navigate(from, { replace: true });
		}
	}, [user, navigate, location]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		// Clear error when user starts typing
		if (error) setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await login(formData.email, formData.password);
			const from = location.state?.from?.pathname || "/dashboard";
			navigate(from, { replace: true });
		} catch (error) {
			const apiMessage = error?.response?.data?.message;
			setError(apiMessage || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	// Demo credentials component
	const DemoCredentials = () => (
		<div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
			<h3 className="text-sm font-medium text-gray-900 mb-3">
			</h3>
			<div className="space-y-2 text-xs">
				<div className="flex justify-between">
				</div>
				<div className="flex justify-between">
				</div>
				<div className="flex justify-between">
				</div>
				<div className="flex justify-between">
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				{/* Header */}
				<div className="text-center">
					<h2 className="text-3xl font-bold text-white mb-2">
						Fire Handling System
					</h2>
					<p className="text-gray-300">Sign in to access your dashboard</p>
				</div>

				{/* Login Form */}
				<div className="bg-white rounded-xl shadow-2xl p-8">
					<form className="space-y-6" onSubmit={handleSubmit}>
						{/* Error Message */}
						{error && (
							<div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg animate-slide-up">
								<div className="flex">
									<div>
										<p className="text-sm font-medium">{error}</p>
									</div>
								</div>
							</div>
						)}

						{/* Email Field */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email Address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="input-field"
								placeholder="Enter your email"
								value={formData.email}
								onChange={handleChange}
								disabled={loading}
							/>
						</div>

						{/* Password Field */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="input-field"
								placeholder="Enter your password"
								value={formData.password}
								onChange={handleChange}
								disabled={loading}
							/>
						</div>

						{/* Submit Button */}
						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center items-center btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<>
										<div className="loading-spinner mr-2"></div>
										Signing in...
									</>
								) : (
									"Sign in"
								)}
							</button>
						</div>
					</form>

					{/* Demo Credentials */}
					<DemoCredentials />
				</div>

				{/* Civilian Login Link */}
				<div className="text-center">
					<Link 
						to="/civilian-login" 
						className="text-blue-300 hover:text-white text-sm underline transition-colors"
					>
						Login as a Civilian
					</Link>
					<Link 
						to="/supplierlogin" 
						className="text-blue-300 hover:text-white text-sm underline transition-colors"
					>
						Login as a Supplier
					</Link>
				</div>

				{/* Footer */}
				<div className="text-center text-gray-300 text-sm">
					<p>© 2024 Fire Department. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
