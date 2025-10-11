import React from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Added useNavigate

const CivilianDashboard = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		const confirmLogout = window.confirm("Are you sure you want to log out?");
		if (confirmLogout) {
			//  Clear session/local storage
			localStorage.removeItem("accessToken");
			      localStorage.removeItem("user");

			sessionStorage.removeItem("accessToken");

			//  Redirect to civilian login page
			navigate("/civilian-login");
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-blue-600 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div>
							<h1 className="text-2xl font-bold">Civilian Portal</h1>
							<p className="text-blue-200">Welcome to the Fire Department Services</p>
						</div>
						<div className="flex space-x-4">
							
							<button
								onClick={handleLogout} // ✅ added here
								className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Section */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Welcome to the Civilian Portal
					</h2>
					<p className="text-gray-600">
						Access fire department services, report incidents, and stay informed about safety in your community.
					</p>
				</div>

				{/* Services Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Emergency Services */}
					<div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center mb-4">
							<div className="bg-red-100 p-3 rounded-lg">
								<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 ml-3">Emergency Services</h3>
						</div>
						<p className="text-gray-600 mb-4">
							Report emergencies, request fire department assistance, and access emergency contacts.
						</p>
						<button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
							Report Emergency
						</button>
					</div>

					{/* Safety Information */}
					<div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center mb-4">
							<div className="bg-blue-100 p-3 rounded-lg">
								<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 ml-3">Safety Information</h3>
						</div>
						<p className="text-gray-600 mb-4">
							Learn about fire safety, emergency preparedness, and community safety programs.
						</p>
						<button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
							View Safety Info
						</button>
					</div>

					{/* Community Events */}
					<div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center mb-4">
							<div className="bg-green-100 p-3 rounded-lg">
								<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 ml-3">Community Events</h3>
						</div>
						<p className="text-gray-600 mb-4">
							Stay updated on fire department events, training sessions, and community outreach programs.
						</p>
						<button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
							View Events
						</button>
					</div>

					{/* Fire Permits */}
					<div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center mb-4">
							<div className="bg-yellow-100 p-3 rounded-lg">
								<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 ml-3">Fire Permits</h3>
						</div>
						<p className="text-gray-600 mb-4">
							Apply for fire permits, check permit status, and access permit-related information.
						</p>
						<button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
							Apply for Permit
						</button>
					</div>

					{/* Incident Reports */}
					<div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center mb-4">
							<div className="bg-purple-100 p-3 rounded-lg">
								<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 ml-3">Incident Reports</h3>
						</div>
						<p className="text-gray-600 mb-4">
							Submit incident reports, view report status, and access historical incident data.
						</p>
						<button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
							Submit Report
						</button>
					</div>

					{/* Contact Information */}
					<div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
						<div className="flex items-center mb-4">
							<div className="bg-indigo-100 p-3 rounded-lg">
								<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 ml-3">Contact Us</h3>
						</div>
						<p className="text-gray-600 mb-4">
							Get in touch with the fire department for non-emergency inquiries and general information.
						</p>
						<button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
							Contact Department
						</button>
					</div>
				</div>

				{/* Quick Links */}
				<div className="mt-8 bg-white rounded-lg shadow-sm p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
							Emergency: 911
						</a>
						<a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
							Non-Emergency: (555) 123-4567
						</a>
						<a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
							Fire Safety Tips
						</a>
						<a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
							Community Calendar
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CivilianDashboard;
