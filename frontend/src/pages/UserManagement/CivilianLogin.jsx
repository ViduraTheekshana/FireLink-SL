import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const CivilianLogin = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [signupData, setSignupData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		phoneNumber: "",
		address: "",
		username: "",
		newsletterSubscription: false,
	});
	const [isSignup, setIsSignup] = useState(false);
	const [isForgotPassword, setIsForgotPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

	const navigate = useNavigate();
	const location = useLocation();

	// Validation functions
	const validateName = (name) => {
		const nameRegex = /^[a-zA-Z\s\.\-]{2,50}$/;
		return nameRegex.test(name);
	};

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
		return emailRegex.test(email);
	};

	const validatePassword = (password) => {
		// Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		return passwordRegex.test(password);
	};

	const validatePhoneNumber = (phone) => {
		// Must start with 0 and have exactly 10 digits
		const phoneRegex = /^0\d{9}$/;
		return phoneRegex.test(phone);
	};

	const validateUsername = (username) => {
		// Only letters, numbers, _ and . No spaces, 4-20 characters
		const usernameRegex = /^[a-zA-Z0-9_\.]{4,20}$/;
		return usernameRegex.test(username);
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (isSignup) {
			setSignupData({
				...signupData,
				[name]: type === 'checkbox' ? checked : value,
			});
		} else {
			setFormData({
				...formData,
				[name]: value,
			});
		}
		// Clear error when user starts typing
		if (error) setError("");
		if (success) setSuccess("");
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch('http://localhost:5000/api/v1/civilian-auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (data.success) {
				setSuccess("Login successful! Redirecting...");
				setTimeout(() => {
					navigate("/civilian-dashboard");
				}, 1000);
			} else {
				setError(data.message || "Login failed. Please try again.");
			}
		} catch (error) {
			console.error('Login error:', error);
			setError("Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleSignup = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Comprehensive validation
		if (!signupData.firstName.trim()) {
			setError("First name is required");
			setLoading(false);
			return;
		}

		if (!validateName(signupData.firstName)) {
			setError("First name must contain only letters, spaces, dots (.), and hyphens (-), 2-50 characters");
			setLoading(false);
			return;
		}

		if (!signupData.lastName.trim()) {
			setError("Last name is required");
			setLoading(false);
			return;
		}

		if (!validateName(signupData.lastName)) {
			setError("Last name must contain only letters, spaces, dots (.), and hyphens (-), 2-50 characters");
			setLoading(false);
			return;
		}

		if (!signupData.email.trim()) {
			setError("Email is required");
			setLoading(false);
			return;
		}

		if (!validateEmail(signupData.email)) {
			setError("Please provide a valid email address");
			setLoading(false);
			return;
		}

		if (!signupData.username.trim()) {
			setError("Username is required");
			setLoading(false);
			return;
		}

		if (!validateUsername(signupData.username)) {
			setError("Username must contain only letters, numbers, _ and . (no spaces), 4-20 characters");
			setLoading(false);
			return;
		}

		if (!signupData.password) {
			setError("Password is required");
			setLoading(false);
			return;
		}

		if (!validatePassword(signupData.password)) {
			setError("Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character");
			setLoading(false);
			return;
		}

		if (signupData.password !== signupData.confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		if (!signupData.phoneNumber.trim()) {
			setError("Phone number is required");
			setLoading(false);
			return;
		}

		if (!validatePhoneNumber(signupData.phoneNumber)) {
			setError("Phone number must start with 0 and have exactly 10 digits");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('http://localhost:5000/api/v1/civilian-auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					firstName: signupData.firstName,
					lastName: signupData.lastName,
					email: signupData.email,
					username: signupData.username,
					password: signupData.password,
					phoneNumber: signupData.phoneNumber,
					address: signupData.address,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setSuccess("Account created successfully! Please log in.");
				setIsSignup(false);
				setSignupData({
					firstName: "",
					lastName: "",
					email: "",
					password: "",
					confirmPassword: "",
					phoneNumber: "",
					address: "",
					username: "",
					newsletterSubscription: false,
				});
			} else {
				setError(data.message || "Signup failed. Please try again.");
			}
		} catch (error) {
			console.error('Signup error:', error);
			setError("Signup failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};



	const handleForgotPassword = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (!forgotPasswordEmail.trim()) {
			setError("Email is required");
			setLoading(false);
			return;
		}

		if (!validateEmail(forgotPasswordEmail)) {
			setError("Please provide a valid email address");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('http://localhost:5000/api/v1/civilian-auth/forgot-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: forgotPasswordEmail,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setSuccess("Password reset link sent to your email! Please check your inbox.");
				setForgotPasswordEmail("");
			} else {
				setError(data.message || "Failed to send reset link. Please try again.");
			}
		} catch (error) {
			console.error('Forgot password error:', error);
			setError("Failed to send reset link. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Check if user is already logged in
		const token = localStorage.getItem('accessToken');
		if (token) {
			navigate("/civilian-dashboard");
		}
	}, [navigate]);

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full">
				{/* Main Card */}
				<div className="bg-white rounded-2xl shadow-xl p-8">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							Fire Department
						</h1>
						<p className="text-gray-600 text-sm">
							Civilian Portal
						</p>
					</div>

					{/* Tab Navigation */}
					<div className="flex mb-8">
						<button
							type="button"
							onClick={() => setIsSignup(false)}
							className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
								!isSignup
									? "border-blue-600 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700"
							}`}
						>
							<div className="flex items-center justify-center">
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
								</svg>
								Login
							</div>
						</button>
						<button
							type="button"
							onClick={() => setIsSignup(true)}
							className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
								isSignup
									? "border-blue-600 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700"
							}`}
						>
							<div className="flex items-center justify-center">
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
								Sign Up
							</div>
						</button>
					</div>

					{/* External Auth Buttons */}
					{!isForgotPassword && (
						<div className="space-y-3 mb-6">

							<button
								type="button"
								disabled={loading}
								className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
									<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
								</svg>
								Continue with Apple
							</button>

							<button
								type="button"
								disabled={loading}
								className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
								</svg>
								Continue with Binance
							</button>

							<button
								type="button"
								disabled={loading}
								className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
								</svg>
								Continue with Wallet
							</button>
						</div>
					)}

					{/* Divider */}
					{!isForgotPassword && (
						<div className="relative mb-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">OR</span>
							</div>
						</div>
					)}

					{/* Error/Success Messages */}
					{error && (
						<div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
							<p className="text-sm font-medium">{error}</p>
						</div>
					)}

					{success && (
						<div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
							<p className="text-sm font-medium">{success}</p>
						</div>
					)}

					{/* Forgot Password Form */}
					{isForgotPassword ? (
						<form onSubmit={handleForgotPassword} className="space-y-4">
							<div>
								<label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-gray-700 mb-1">
									Email address
								</label>
								<input
									id="forgotPasswordEmail"
									name="forgotPasswordEmail"
									type="email"
									autoComplete="email"
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your email address"
									value={forgotPasswordEmail}
									onChange={(e) => setForgotPasswordEmail(e.target.value)}
									disabled={loading}
								/>
							</div>

							<div>
								<button
									type="submit"
									disabled={loading}
									className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Sending Reset Link...
										</>
									) : (
										"Send Reset Link"
									)}
								</button>
							</div>

							<div className="text-center">
								<button
									type="button"
									onClick={() => setIsForgotPassword(false)}
									className="text-sm text-blue-600 hover:text-blue-800 font-medium"
								>
									← Back to Sign In
								</button>
							</div>
						</form>
					) : (
						<form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
							{/* Name Fields (Signup only) */}
							{isSignup && (
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
											First Name
										</label>
										<input
											id="firstName"
											name="firstName"
											type="text"
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="First name"
											value={signupData.firstName}
											onChange={handleChange}
											disabled={loading}
										/>
									</div>
									<div>
										<label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
											Last Name
										</label>
										<input
											id="lastName"
											name="lastName"
											type="text"
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Last name"
											value={signupData.lastName}
											onChange={handleChange}
											disabled={loading}
										/>
									</div>
								</div>
							)}

							{/* Email Field */}
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
									Email address
								</label>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your email address"
									value={isSignup ? signupData.email : formData.email}
									onChange={handleChange}
									disabled={loading}
								/>
							</div>

							{/* Username Field (Signup only) */}
							{isSignup && (
								<div>
									<label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
										Username
									</label>
									<input
										id="username"
										name="username"
										type="text"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Enter your username"
										value={signupData.username}
										onChange={handleChange}
										disabled={loading}
									/>
								</div>
							)}

							{/* Password Field */}
							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
									Password
								</label>
								<div className="relative">
									<input
										id="password"
										name="password"
										type="password"
										autoComplete={isSignup ? "new-password" : "current-password"}
										required
										className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Enter your password"
										value={isSignup ? signupData.password : formData.password}
										onChange={handleChange}
										disabled={loading}
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
									>
										<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									</button>
								</div>
							</div>

							{/* Confirm Password (Signup only) */}
							{isSignup && (
								<div>
									<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
										Confirm Password
									</label>
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										autoComplete="new-password"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Confirm your password"
										value={signupData.confirmPassword}
										onChange={handleChange}
										disabled={loading}
									/>
								</div>
							)}

							{/* Password Requirements (Signup only) */}
							{isSignup && (
								<div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
									<p className="font-medium mb-1">Password requirements:</p>
									<ul className="space-y-1">
										<li>• At least 8 characters long</li>
										<li>• At least one uppercase letter</li>
										<li>• At least one lowercase letter</li>
										<li>• At least one number</li>
										<li>• At least one special character (@$!%*?&)</li>
									</ul>
								</div>
							)}

							{/* Phone Number (Signup only) */}
							{isSignup && (
								<div>
									<label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
										Phone Number
									</label>
									<input
										id="phoneNumber"
										name="phoneNumber"
										type="tel"
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="0XXXXXXXXX (10 digits starting with 0)"
										value={signupData.phoneNumber}
										onChange={handleChange}
										disabled={loading}
									/>
								</div>
							)}

							{/* Address (Signup only) */}
							{isSignup && (
								<div>
									<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
										Address
									</label>
									<textarea
										id="address"
										name="address"
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Enter your address"
										value={signupData.address}
										onChange={handleChange}
										disabled={loading}
									/>
								</div>
							)}

							{/* Forgot Password Link (Login only) */}
							{!isSignup && (
								<div className="flex items-center justify-end">
									<button
										type="button"
										onClick={() => setIsForgotPassword(true)}
										className="text-sm text-blue-600 hover:text-blue-800 font-medium"
									>
										Forgot password?
									</button>
								</div>
							)}

							{/* Submit Button */}
							<div>
								<button
									type="submit"
									disabled={loading}
									className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											{isSignup ? "Creating Account..." : "Signing In..."}
										</>
									) : (
										isSignup ? "Create an account" : "Log In"
									)}
								</button>
							</div>

							{/* Newsletter Subscription (Signup only) */}
							{isSignup && (
								<div className="flex items-start">
									<div className="flex items-center h-5">
										<input
											id="newsletterSubscription"
											name="newsletterSubscription"
											type="checkbox"
											className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
											checked={signupData.newsletterSubscription}
											onChange={handleChange}
											disabled={loading}
										/>
									</div>
									<div className="ml-3 text-sm">
										<label htmlFor="newsletterSubscription" className="text-gray-700">
											Please keep me updated by email with the latest news, research findings, reward programs, event updates.
										</label>
									</div>
								</div>
							)}
						</form>
					)}

					{/* Footer Links */}
					<div className="mt-6 text-center">
						{isSignup ? (
							<p className="text-sm text-gray-600">
								Already have an account?{" "}
								<button
									type="button"
									onClick={() => setIsSignup(false)}
									className="font-medium text-blue-600 hover:text-blue-500 underline"
								>
									Login
								</button>
							</p>
						) : (
							<p className="text-sm text-gray-600">
								Don't have an account yet?{" "}
								<button
									type="button"
									onClick={() => setIsSignup(true)}
									className="font-medium text-blue-600 hover:text-blue-500 underline"
								>
									Sign up
								</button>
							</p>
						)}
					</div>

					{/* Back to Staff Login */}
					<div className="mt-4 text-center">
						<Link 
							to="/login" 
							className="text-sm text-gray-500 hover:text-gray-700 underline"
						>
							← Back to Staff Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CivilianLogin;