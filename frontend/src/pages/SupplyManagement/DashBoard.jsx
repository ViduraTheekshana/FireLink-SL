import React, { useState } from "react";
import {
	Bell,
	Download,
	PlusCircle,
	UserPlus,
	ExternalLink,
	Clock,
	AlertCircle,
	Package,
	Users,
	AlertTriangle,
	FileBarChart,
	BarChart3,
	Settings,
	User,
} from "lucide-react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	Cell,
	PieChart,
	Pie,
	Legend,
} from "recharts";
import Sidebar from "../../components/SideBar";
import { useEffect } from "react";
import {
	getAlerts,
	getRecentRequests,
	getRequestTrend,
	getStats,
} from "../../services/supply/reportService";
import extractErrorMessage from "../../utils/errorMessageParser";
import formatDate from "../../utils/convertDate";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SupplyDashboard = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [kpiData, setKpiData] = useState(null);
	const [categoryData, setCategoryData] = useState(null);
	const [recentRequestsData, setRecentRequestsData] = useState(null);
	const [topSuppliersData, setTopSuppliersData] = useState(null);
	const [requestsTrendData, setRequestsTrendData] = useState(null);
	const [alertsData, setAlertsData] = useState(null);

	const navigate = useNavigate();

	// Function to get status badge style
	const getStatusBadgeStyle = (status) => {
		switch (status.toLowerCase()) {
			case "open":
				return "bg-blue-100 text-blue-800";
			case "closed":
				return "bg-green-100 text-green-800";
			case "assigned":
				return "bg-yellow-100 text-yellow-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};
	// Function to get alert icon
	const getAlertIcon = (type) => {
		switch (type) {
			case "overdue":
				return <Clock size={16} className="text-red-500" />;
			case "deadline-closed":
				return <AlertTriangle size={16} className="text-red-500" />;
			case "not-assigned":
				return <AlertCircle size={16} className="text-yellow-500" />;
			default:
				return <AlertCircle size={16} />;
		}
	};

	useEffect(() => {
		const fetchSupplyRequests = async () => {
			setLoading(true);
			try {
				const res = await getStats();
				const requestTrendData = await getRequestTrend({ mode: "default" });
				const recentRequests = await getRecentRequests();
				const alertData = await getAlerts();
				setKpiData(res.data.summary);
				setCategoryData(res.data.categoryBreakdown);
				setTopSuppliersData(res.data.topSuppliers);
				setRequestsTrendData(requestTrendData.data);
				setRecentRequestsData(recentRequests.data);
				setAlertsData(alertData.data);
			} catch (exception) {
				setError(extractErrorMessage(exception));
			} finally {
				setLoading(false);
			}
		};
		fetchSupplyRequests();
	}, []);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	if (loading) return <Loader />;

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="w-full space-y-6">
						{/* Header */}
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
							<h1 className="text-2xl font-bold text-gray-800">
								Supply Manager Dashboard
							</h1>
							<div className="flex items-center gap-4">
								<button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
									<Bell size={20} className="text-gray-600" />
									<span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
								</button>
								<div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 px-2 rounded-full">
									<div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white">
										<User size={16} />
									</div>
									<span className="text-sm font-medium hidden md:block">
										John Doe
									</span>
									<Settings size={16} className="text-gray-500" />
								</div>
							</div>
						</div>
						{/* KPI Cards */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
							<div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-gray-500 font-medium">
										Total Supply Requests
									</span>
									<div className="p-2 bg-blue-100 rounded-md">
										<Package size={16} className="text-blue-600" />
									</div>
								</div>
								<div className="text-2xl font-bold text-gray-800">
									{kpiData.totalRequests.value}
								</div>
								<div className="mt-2 text-xs flex items-center">
									<span
										className={`font-medium ${
											kpiData.totalRequests.growth.startsWith("+")
												? "text-green-600"
												: kpiData.totalRequests.growth.startsWith("-")
												? "text-red-600"
												: "text-gray-500"
										}`}
									>
										{kpiData.totalRequests.growth}%
									</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div>
							<div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-gray-500 font-medium">
										Active Suppliers
									</span>
									<div className="p-2 bg-green-100 rounded-md">
										<Users size={16} className="text-green-600" />
									</div>
								</div>
								<div className="text-2xl font-bold text-gray-800">
									{kpiData.totalSuppliers.value}
								</div>
								<div className="mt-2 text-xs flex items-center">
									<span
										className={`font-medium ${
											kpiData.totalSuppliers.growth.startsWith("+")
												? "text-green-600"
												: kpiData.totalSuppliers.growth.startsWith("-")
												? "text-red-600"
												: "text-gray-500"
										}`}
									>
										{kpiData.totalSuppliers.growth}%
									</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div>
							<div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-gray-500 font-medium">
										Active Requests
									</span>
									<div className="p-2 bg-yellow-100 rounded-md">
										<Clock size={16} className="text-yellow-600" />
									</div>
								</div>
								<div className="text-2xl font-bold text-gray-800">
									{kpiData.activeRequests.value}
								</div>
								<div className="mt-2 text-xs flex items-center">
									<span
										className={`font-medium ${
											kpiData.activeRequests.growth.startsWith("+")
												? "text-green-600"
												: kpiData.activeRequests.growth.startsWith("-")
												? "text-red-600"
												: "text-gray-500"
										}`}
									>
										{kpiData.activeRequests.growth}%
									</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div>
							<div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-gray-500 font-medium">
										Overdue Requests
									</span>
									<div className="p-2 bg-red-100 rounded-md">
										<AlertTriangle size={16} className="text-red-600" />
									</div>
								</div>
								<div className="text-2xl font-bold text-gray-800">
									{kpiData.overdueRequests.value}
								</div>
								<div className="mt-2 text-xs flex items-center">
									<span
										className={`font-medium ${
											kpiData.overdueRequests.growth.startsWith("+")
												? "text-green-600"
												: kpiData.overdueRequests.growth.startsWith("-")
												? "text-red-600"
												: "text-gray-500"
										}`}
									>
										{kpiData.overdueRequests.growth}%
									</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div>
							{/* <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-gray-500 font-medium">
										Monthly Spend
									</span>
									<div className="p-2 bg-purple-100 rounded-md">
										<DollarSign size={16} className="text-purple-600" />
									</div>
								</div>
								<div className="text-2xl font-bold text-gray-800">
									${(kpiData.monthlySpend / 1000).toFixed(1)}k
								</div>
								<div className="mt-2 text-xs flex items-center">
									<span className="text-red-600 font-medium">+15%</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div> */}
							<div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-gray-500 font-medium">
										Avg. Bids per Request
									</span>
									<div className="p-2 bg-blue-100 rounded-md">
										<BarChart3 size={16} className="text-blue-600" />
									</div>
								</div>
								<div className="text-2xl font-bold text-gray-800">
									{kpiData.avgBidsPerRequest.value}
								</div>
								<div className="mt-2 text-xs flex items-center">
									<span
										className={`font-medium ${
											kpiData.avgBidsPerRequest.growth.startsWith("+")
												? "text-green-600"
												: kpiData.avgBidsPerRequest.growth.startsWith("-")
												? "text-red-600"
												: "text-gray-500"
										}`}
									>
										{kpiData.avgBidsPerRequest.growth}%
									</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div>
						</div>
						{/* Charts Section */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Line Chart */}
							<div className="bg-white p-4 rounded-lg shadow-sm lg:col-span-2">
								<h2 className="text-lg font-semibold text-gray-800 mb-4">
									Requests Trend
								</h2>
								<div className="h-72">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart
											data={requestsTrendData}
											margin={{
												top: 5,
												right: 30,
												left: 20,
												bottom: 5,
											}}
										>
											<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
											<XAxis dataKey="name" stroke="#9ca3af" />
											<YAxis stroke="#9ca3af" />
											<Tooltip
												contentStyle={{
													backgroundColor: "#fff",
													border: "1px solid #e5e7eb",
													borderRadius: "0.375rem",
													boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
												}}
											/>
											<Line
												type="monotone"
												dataKey="requests"
												stroke="#dc2626"
												strokeWidth={2}
												dot={{
													r: 4,
													fill: "#dc2626",
												}}
												activeDot={{
													r: 6,
													fill: "#dc2626",
												}}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							</div>
							{/* Donut Chart */}
							<div className="bg-white p-4 rounded-lg shadow-sm">
								<h2 className="text-lg font-semibold text-gray-800 mb-4">
									Requests by Category
								</h2>
								<div className="h-72">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={categoryData}
												cx="50%"
												cy="50%"
												innerRadius={60}
												outerRadius={80}
												paddingAngle={2}
												dataKey="value"
											>
												{categoryData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
											<Tooltip
												contentStyle={{
													backgroundColor: "#fff",
													border: "1px solid #e5e7eb",
													borderRadius: "0.375rem",
													boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
												}}
												formatter={(value) => [`${value} Requests`, "Count"]}
											/>
											<Legend verticalAlign="bottom" height={36} />
										</PieChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>
						{/* Tables and Alerts Section */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Recent Supply Requests Table */}
							<div className="bg-white rounded-lg shadow-sm lg:col-span-2">
								<div className="p-4 border-b border-gray-200 flex justify-between items-center">
									<h2 className="text-lg font-semibold text-gray-800">
										Recent Supply Requests
									</h2>
									<button
										className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
										onClick={() => {
											navigate("/supply-requests", { replace: true });
										}}
									>
										<span>View All</span>
										<ExternalLink size={14} />
									</button>
								</div>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead className="bg-gray-50 text-gray-600 text-sm">
											<tr>
												<th className="py-3 px-4 text-left font-medium">
													Request ID
												</th>
												<th className="py-3 px-4 text-left font-medium">
													Category
												</th>
												<th className="py-3 px-4 text-left font-medium">
													Status
												</th>
												<th className="py-3 px-4 text-left font-medium">
													Assigned Supplier
												</th>
												<th className="py-3 px-4 text-left font-medium">
													Deadline
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{recentRequestsData.map((request, index) => (
												<tr key={index} className="hover:bg-gray-50">
													<td className="py-3 px-4 font-medium text-red-600">
														{request.id}
													</td>
													<td className="py-3 px-4">{request.category}</td>
													<td className="py-3 px-4">
														<span
															className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(
																request.status
															)}`}
														>
															{request.status}
														</span>
													</td>
													<td className="py-3 px-4">
														{request.assignedSupplier?.name}
													</td>
													<td className="py-3 px-4">
														{formatDate(request.applicationDeadline)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
							{/* Alerts & Notifications */}
							<div className="bg-white rounded-lg shadow-sm">
								<div className="p-4 border-b border-gray-200">
									<h2 className="text-lg font-semibold text-gray-800">
										Alerts & Notifications
									</h2>
								</div>
								<div className="p-4">
									<ul className="space-y-4">
										{alertsData.map((alert, index) => (
											<li
												key={index}
												className="flex items-start gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
											>
												<div className="mt-0.5">{getAlertIcon(alert.type)}</div>
												<div>
													<p className="text-sm text-gray-800">
														{alert.message}
													</p>
												</div>
											</li>
										))}
									</ul>
								</div>
							</div>
							{/* Top Performing Suppliers Table */}
							<div className="bg-white rounded-lg shadow-sm lg:col-span-2">
								<div className="p-4 border-b border-gray-200 flex justify-between items-center">
									<h2 className="text-lg font-semibold text-gray-800">
										Top Performing Suppliers
									</h2>
									<button
										className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
										onClick={() => {
											navigate("/suppliers", { replace: true });
										}}
									>
										<span>View All</span>
										<ExternalLink size={14} />
									</button>
								</div>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead className="bg-gray-50 text-gray-600 text-sm">
											<tr>
												<th className="py-3 px-4 text-left font-medium">
													Supplier Name
												</th>
												<th className="py-3 px-4 text-center font-medium">
													Completed Requests
												</th>
												<th className="py-3 px-4 text-right font-medium">
													Total Value
												</th>
												<th className="py-3 px-4 text-center font-medium">
													On-Time Rate
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{topSuppliersData.map((supplier, index) => (
												<tr key={index} className="hover:bg-gray-50">
													<td className="py-3 px-4 font-medium">
														{supplier.name}
													</td>
													<td className="py-3 px-4 text-center">
														{supplier.completed}
													</td>
													<td className="py-3 px-4 text-right">
														{/* ${supplier.value.toLocaleString()} */}$
													</td>
													<td className="py-3 px-4 text-center">
														<div className="flex items-center justify-center">
															<div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
																<div
																	className="h-2 rounded-full"
																	style={{
																		width: `${supplier.onTimeRate}%`,
																		backgroundColor:
																			supplier.onTimeRate >= 95
																				? "#10B981"
																				: supplier.onTimeRate >= 90
																				? "#FBBF24"
																				: "#EF4444",
																	}}
																></div>
															</div>
															<span
																className={`text-xs font-medium ${
																	supplier.onTimeRate >= 95
																		? "text-green-600"
																		: supplier.onTimeRate >= 90
																		? "text-yellow-600"
																		: "text-red-600"
																}`}
															>
																{supplier.onTimeRate}%
															</span>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
							{/* Action Shortcuts */}
							<div className="bg-white rounded-lg shadow-sm">
								<div className="p-4 border-b border-gray-200">
									<h2 className="text-lg font-semibold text-gray-800">
										Quick Actions
									</h2>
								</div>
								<div className="p-4 grid grid-cols-1 gap-3">
									<button
										className="flex items-center gap-3 w-full p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors text-left"
										onClick={() => {
											navigate("/supply-requests", {
												state: { showAddModal: true },
											});
										}}
									>
										<PlusCircle size={20} />
										<span className="font-medium">Create New Request</span>
									</button>
									<button
										className="flex items-center gap-3 w-full p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors text-left"
										onClick={() => {
											navigate("/suppliers", {
												state: { showAddModal: true },
											});
										}}
									>
										<UserPlus size={20} />
										<span className="font-medium">Add Supplier</span>
									</button>
									<button className="flex items-center gap-3 w-full p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md transition-colors text-left">
										<FileBarChart size={20} />
										<span className="font-medium">Generate Report</span>
									</button>
									<button className="flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors text-left">
										<Download size={20} />
										<span className="font-medium">Export Data</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default SupplyDashboard;
