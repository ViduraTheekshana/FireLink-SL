import React from "react";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
	const { user, hasRole } = useAuth();
	const navigate = useNavigate();
	const getWelcomeMessage = () => {
		if (hasRole("cfo")) {
			return "Welcome, Chief Fire Officer! You have full system access.";
		} else if (hasRole("1st_class_officer")) {
			return "Welcome, First Class Officer! You have operational management access.";
		} else if (hasRole("finance_manager")) {
			return "Welcome, Finance Manager! You have financial management access.";
		} else if (hasRole("record_manager")) {
			return "Welcome, Record Manager! You have records management access.";
		} else if (hasRole("inventory_manager")) {
			return "Welcome, Inventory Manager! You have equipment management access.";
		} else if (hasRole("training_session_manager")) {
			return "Welcome, Training Session Manager! You have training management access.";
		} else if (hasRole("prevention_manager")) {
			return "Welcome, Prevention Manager! You have prevention program access.";
		} else {
			return "Welcome, Firefighter! You have basic system access.";
		}
	};

	const getUserRoles = () => {
		return (
			user?.roles?.map((role) => role.displayName).join(", ") ||
			"No roles assigned"
		);
	};

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
				<p className="text-gray-600">{getWelcomeMessage()}</p>
			</div>

			{/* User Info Card */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					User Information
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p className="text-sm font-medium text-gray-500">Name</p>
						<p className="text-lg text-gray-900">{user?.name || "N/A"}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-gray-500">Email</p>
						<p className="text-lg text-gray-900">{user?.email || "N/A"}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-gray-500">Roles</p>
						<p className="text-lg text-gray-900">{getUserRoles()}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-gray-500">Status</p>
						<span
							className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
								user?.isActive
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{user?.isActive ? "Active" : "Inactive"}
						</span>
					</div>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-red-100 text-red-600">
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-500">Alerts</p>
							<p className="text-2xl font-semibold text-gray-900">0</p>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<button className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors duration-200">
						<div className="text-center">
							<div className="text-2xl mb-2">👥</div>
							<p className="font-medium text-gray-900">Staff Management</p>
							<p className="text-sm text-gray-500">
								Manage fire department staff
							</p>
						</div>
					</button>

					<button 
						onClick={() => navigate('/inventory')}
						className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors duration-200"
					>
						<div className="text-center">
							<div className="text-2xl mb-2">📦</div>
							<p className="font-medium text-gray-900">Inventory</p>
							<p className="text-sm text-gray-500">
								Manage equipment & supplies
							</p>
						</div>
					</button>

					<button className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors duration-200">
						<div className="text-center">
							<div className="text-2xl mb-2">📊</div>
							<p className="font-medium text-gray-900">Reports</p>
							<p className="text-sm text-gray-500">View system reports</p>
						</div>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
