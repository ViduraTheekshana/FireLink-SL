import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const CivilianResetPassword = () => {
	const [formData, setFormData] = useState({
		newPassword: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [token, setToken] = useState("");
	const [tokenValid, setTokenValid] = useState(null);

	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const tokenFromUrl = searchParams.get('token');
		if (tokenFromUrl) {
			setToken(tokenFromUrl);
			// In a real app, you might want to verify the token here
			setTokenValid(true);
		} else {
			setError("Invalid or missing reset token");
			setTokenValid(false);
		}
	}, [searchParams]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		// Clear error when user starts typing
		if (error) setError("");
		if (success) setSuccess("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validate passwords match
		if (formData.newPassword !== formData.confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		// Validate password strength
		if (formData.newPassword.length < 8) {
			setError("Password must be at least 8 characters long");
			setLoading(false);
			return;
		}

		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.newPassword)) {
			setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('http://localhost:5000/api/v1/civilian-auth/reset-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token: token,
					newPassword: formData.newPassword,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setSuccess("Password has been reset successfully! Redirecting to login...");
				setTimeout(() => {
					navigate("/civilian-login");
				}, 2000);
			} else {
				setError(data.message || "Failed to reset password. Please try again.");
			}
		} catch (error) {
			console.error('Reset password error:', error);
			setError("Failed to reset password. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (tokenValid === false) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<div className="text-center">
						<h2 className="text-3xl font-bold text-white mb-2">
							Invalid Reset Link
						</h2>
						<p className="text-blue-200 mb-6">
							This password reset link is invalid or has expired.
						</p>
						<Link 
							to="/civilian-login" 
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
						>
							Back to Login
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				{/* Header */}
				<div className="text-center">
					<h2 className="text-3xl font-bold text-white mb-2">
						Reset Your Password
					</h2>
					<p className="text-blue-200">
						Enter your new password below
					</p>
					<Link 
						to="/login" 
						className="text-blue-300 hover:text-white text-sm underline mt-2 inline-block"
					>
						← Back to Staff Login
					</Link>
				</div>

				{/* Reset Password Form */}
				<div className="bg-white rounded-xl shadow-2xl p-8">
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

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* New Password Field */}
						<div>
							<label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
								New Password
							</label>
							<input
								id="newPassword"
								name="newPassword"
								type="password"
								autoComplete="new-password"
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter your new password"
								value={formData.newPassword}
								onChange={handleChange}
								disabled={loading}
							/>
						</div>

						{/* Confirm Password Field */}
						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
								Confirm New Password
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Confirm your new password"
								value={formData.confirmPassword}
								onChange={handleChange}
								disabled={loading}
							/>
						</div>

						{/* Password Requirements */}
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

						{/* Submit Button */}
						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Resetting Password...
									</>
								) : (
									"Reset Password"
								)}
							</button>
						</div>

						{/* Back to Login */}
						<div className="text-center">
							<Link
								to="/civilian-login"
								className="text-blue-600 hover:text-blue-800 text-sm font-medium"
							>
								← Back to Sign In
							</Link>
						</div>
					</form>
				</div>

				{/* Footer */}
				<div className="text-center text-blue-200 text-sm">
					<p>© 2024 Fire Department. All rights reserved.</p>
				</div>
			</div>
		</div>
	);
};

export default CivilianResetPassword;
