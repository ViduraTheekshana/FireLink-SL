import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSupplierAuth } from "../../../context/supplierAuth";
import { useAuth } from "../../../context/auth";
import { useNavigate } from "react-router-dom";
import "./supplier.css";

const SupplierLogin = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { login, user: supplier, loading: authLoading } = useSupplierAuth();
	const { user, loading: userLoading } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await login(formData.email, formData.password);
			navigate("/supplier/supply-requests", { replace: true });
		} catch (exception) {
			console.log(exception);
			const apiMessage = exception?.response?.data?.message;
			setError(apiMessage || "Supplier login failed");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!userLoading && user) {
			navigate("/dashboard", { replace: true });
		}

		if (!authLoading && supplier) {
			navigate("/supplier/supply-requests", { replace: true });
			toast.error("You have Already Logged in!");
		}
	}, []);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error, setError, toast]);

	return (
		<div className="supplier-login-container">
			<div className="supplier-login-card">
				<div className="supplier-login-left">
					<h1>Login as a supplier</h1>
					<img
						src="https://i.imgur.com/YdFnSK9.png"
						alt="FireLink-SL Logo"
						style={{ width: "200px", height: "auto" }}
					/>
					<div>FireLink-SL</div>
				</div>
				<div className="supplier-login-right">
					<h2 className="supplier-login-title">Login Now !</h2>
					<form className="supplier-login-form" onSubmit={handleSubmit}>
						<label htmlFor="email">Enter your email</label>
						<input
							type="email"
							id="email"
							placeholder="Enter Your Email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							disabled={loading}
							required
						/>
						<label htmlFor="password">Enter your password</label>
						<input
							type="password"
							id="password"
							name="password"
							placeholder="Enter your password"
							value={formData.password}
							onChange={handleChange}
							disabled={loading}
							required
						/>
						<button
							type="submit"
							className="supplier-login-button"
							disabled={loading}
						>
							{loading ? "Logging in..." : "Login"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default SupplierLogin;
