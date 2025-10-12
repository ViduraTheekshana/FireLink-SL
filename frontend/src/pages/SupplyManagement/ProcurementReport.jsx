import React, { useState } from "react";
import {
	Calendar,
	Download,
	FileSpreadsheet,
	ChevronDown,
	Filter,
	FileText,
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
	Legend,
} from "recharts";
import {
	getProcurementKpi,
	getRequestTrend,
} from "../../services/supply/reportService";
import { useEffect } from "react";
import extractErrorMessage from "../../utils/errorMessageParser";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Sidebar from "../../components/SideBar";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
export function ProcurementReport() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [dateRange, setDateRange] = useState("lastYear");
	const [supplierFilter, setSupplierFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [kpiData, setKpiData] = useState(null);
	const [requestsOverTimeData, setRequestsOverTimeData] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const kpi = await getProcurementKpi(dateRange);
				const trend = await getRequestTrend({
					category: categoryFilter,
					range: dateRange,
					status: statusFilter,
					supplier: supplierFilter,
				});
				setKpiData(kpi.data);
				setRequestsOverTimeData(trend.data);
			} catch (exception) {
				setError(extractErrorMessage(exception));
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [dateRange]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const supplierPerformanceData = [
		{
			id: 1,
			name: "FireTech Equipment",
			assignedRequests: 45,
			totalValue: 125000,
			averageValue: 2777.78,
			failedCount: 3,
		},
		{
			id: 2,
			name: "SafetyFirst Supplies",
			assignedRequests: 38,
			totalValue: 98500,
			averageValue: 2592.11,
			failedCount: 1,
		},
		{
			id: 3,
			name: "Rescue Gear Co.",
			assignedRequests: 29,
			totalValue: 87200,
			averageValue: 3006.9,
			failedCount: 4,
		},
		{
			id: 4,
			name: "Emergency Vehicles Inc.",
			assignedRequests: 32,
			totalValue: 156000,
			averageValue: 4875.0,
			failedCount: 0,
		},
		{
			id: 5,
			name: "Hydrant Systems",
			assignedRequests: 19,
			totalValue: 45600,
			averageValue: 2400.0,
			failedCount: 2,
		},
		{
			id: 6,
			name: "Flame Resistant Apparel",
			assignedRequests: 26,
			totalValue: 78300,
			averageValue: 3011.54,
			failedCount: 1,
		},
	];
	// Sort suppliers by assigned requests for the bar chart
	const topSuppliers = [...supplierPerformanceData]
		.sort((a, b) => b.assignedRequests - a.assignedRequests)
		.slice(0, 5);
	// Colors for the bar chart
	const barColors = ["#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fee2e2"];
	// Export to Excel function
	// const exportToExcel = () => {
	// 	const workbook = XLSX.utils.book_new();
	// 	// Create worksheet for KPI data
	// 	const kpiWorksheet = XLSX.utils.json_to_sheet([
	// 		{
	// 			Metric: "Total Requests",
	// 			Value: kpiData.totalRequests,
	// 		},
	// 		{
	// 			Metric: "Open Requests",
	// 			Value: kpiData.openRequests,
	// 		},
	// 		{
	// 			Metric: "Closed Requests",
	// 			Value: kpiData.closedRequests,
	// 		},
	// 		{
	// 			Metric: "Overdue Requests",
	// 			Value: kpiData.overdueRequests,
	// 		},
	// 	]);
	// 	XLSX.utils.book_append_sheet(workbook, kpiWorksheet, "KPI Summary");
	// 	// Create worksheet for requests over time
	// 	const requestsWorksheet = XLSX.utils.json_to_sheet(requestsOverTimeData);
	// 	XLSX.utils.book_append_sheet(
	// 		workbook,
	// 		requestsWorksheet,
	// 		"Requests Over Time"
	// 	);
	// 	// Create worksheet for supplier performance
	// 	const supplierWorksheet = XLSX.utils.json_to_sheet(supplierPerformanceData);
	// 	XLSX.utils.book_append_sheet(
	// 		workbook,
	// 		supplierWorksheet,
	// 		"Supplier Performance"
	// 	);
	// 	// Generate & download the Excel file
	// 	XLSX.writeFile(workbook, "Procurement_Report.xlsx");
	// };
	// // Export to PDF function
	// const exportToPDF = () => {
	// 	const doc = new jsPDF();
	// 	// Add title
	// 	doc.setFontSize(18);
	// 	doc.text("Procurement Performance Report", 14, 22);
	// 	doc.setFontSize(11);
	// 	doc.text(`Date Range: ${dateRange}`, 14, 30);
	// 	// Add KPI summary
	// 	doc.setFontSize(14);
	// 	doc.text("KPI Summary", 14, 45);
	// 	// Manually create table for KPI data
	// 	const kpiTableData = [
	// 		["Metric", "Value"],
	// 		["Total Requests", kpiData.totalRequests.toString()],
	// 		["Open Requests", kpiData.openRequests.toString()],
	// 		["Closed Requests", kpiData.closedRequests.toString()],
	// 		["Overdue Requests", kpiData.overdueRequests.toString()],
	// 	];
	// 	// Draw KPI table manually
	// 	let y = 50;
	// 	const colWidth = [100, 40];
	// 	const rowHeight = 10;
	// 	// Draw header
	// 	doc.setFillColor(239, 68, 68);
	// 	doc.setTextColor(255, 255, 255);
	// 	doc.rect(14, y, colWidth[0], rowHeight, "F");
	// 	doc.rect(14 + colWidth[0], y, colWidth[1], rowHeight, "F");
	// 	doc.text(kpiTableData[0][0], 17, y + 7);
	// 	doc.text(kpiTableData[0][1], 14 + colWidth[0] + 5, y + 7);
	// 	// Draw rows
	// 	doc.setTextColor(0, 0, 0);
	// 	for (let i = 1; i < kpiTableData.length; i++) {
	// 		y += rowHeight;
	// 		doc.setFillColor(
	// 			i % 2 === 0 ? 240 : 255,
	// 			i % 2 === 0 ? 240 : 255,
	// 			i % 2 === 0 ? 240 : 255
	// 		);
	// 		doc.rect(14, y, colWidth[0], rowHeight, "F");
	// 		doc.rect(14 + colWidth[0], y, colWidth[1], rowHeight, "F");
	// 		doc.text(kpiTableData[i][0], 17, y + 7);
	// 		doc.text(kpiTableData[i][1], 14 + colWidth[0] + 5, y + 7);
	// 	}
	// 	// Add supplier performance table title
	// 	y += rowHeight + 20;
	// 	doc.setFontSize(14);
	// 	doc.text("Supplier Performance", 14, y);
	// 	// Create supplier performance table
	// 	const supplierTableHeaders = [
	// 		"Supplier Name",
	// 		"Assigned Requests",
	// 		"Total Value",
	// 		"Average Value",
	// 		"Failed Count",
	// 	];
	// 	// Draw simplified supplier table
	// 	y += 10;
	// 	doc.setFontSize(10);
	// 	doc.text(
	// 		"A simplified supplier performance summary is included in this report.",
	// 		14,
	// 		y
	// 	);
	// 	y += 10;
	// 	doc.text(
	// 		"Please export to Excel for the complete supplier performance data.",
	// 		14,
	// 		y
	// 	);
	// 	// Save the PDF
	// 	doc.save("Procurement_Report.pdf");
	// };

	if (loading) return <Loader />;

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						{/* Header */}
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<h1 className="text-2xl font-bold text-gray-800">
								Procurement Performance Report
							</h1>
							<div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
								<Calendar className="text-gray-500 mr-2" size={18} />
								<select
									className="bg-transparent text-gray-700 focus:outline-none pr-8"
									value={dateRange}
									onChange={(e) => setDateRange(e.target.value)}
								>
									<option value="last30days">Last 30 Days</option>
									<option value="lastQuarter">Last Quarter</option>
									<option value="lastYear">Last Year</option>
								</select>
							</div>
						</div>
						{/* Filter Bar */}
						<div className="bg-white rounded-lg shadow-sm p-4">
							<div className="flex flex-wrap items-center gap-4">
								<div className="flex items-center">
									<Filter size={18} className="text-gray-500 mr-2" />
									<span className="text-gray-700 font-medium">Filters:</span>
								</div>
								<div className="flex flex-wrap gap-3 flex-1">
									<div className="relative">
										<select
											className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
											value={supplierFilter}
											onChange={(e) => setSupplierFilter(e.target.value)}
										>
											<option value="">All Suppliers</option>
											<option>FireTech Equipment</option>
											<option>SafetyFirst Supplies</option>
											<option>Rescue Gear Co.</option>
											<option>Emergency Vehicles Inc.</option>
											<option>Hydrant Systems</option>
											<option>Flame Resistant Apparel</option>
										</select>
										<ChevronDown
											size={14}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
										/>
									</div>
									<div className="relative">
										<select
											className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
											value={categoryFilter}
											onChange={(e) => setCategoryFilter(e.target.value)}
										>
											<option value="">All Categories</option>
											<option>Equipment</option>
											<option>Supplies</option>
											<option>Gear</option>
											<option>Vehicles</option>
											<option>Apparel</option>
											<option>Medical Supplies</option>
										</select>
										<ChevronDown
											size={14}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
										/>
									</div>
									<div className="relative">
										<select
											className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
											value={statusFilter}
											onChange={(e) => setStatusFilter(e.target.value)}
										>
											<option value="">All Status</option>
											<option>Open</option>
											<option>Closed</option>
											<option>Overdue</option>
										</select>
										<ChevronDown
											size={14}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
										/>
									</div>
								</div>
								<div className="flex gap-3 ml-auto">
									<button
										// onClick={exportToExcel}
										className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
									>
										<FileSpreadsheet size={16} />
										<span>Excel</span>
									</button>
									<button
										// onClick={exportToPDF}
										className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
									>
										<FileText size={16} />
										<span>PDF</span>
									</button>
								</div>
							</div>
						</div>
						{/* KPI Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<div className="bg-white rounded-lg shadow-sm p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-500 font-medium">
											Total Requests
										</p>
										<p className="text-3xl font-bold text-gray-800 mt-1">
											{kpiData.totalRequests}
										</p>
									</div>
									<div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
										<Download className="h-6 w-6 text-blue-600" />
									</div>
								</div>
								<div className="mt-4 text-sm">
									<span className="text-green-600 font-medium">+12%</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div>
							<div className="bg-white rounded-lg shadow-sm p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-500 font-medium">
											Open Requests
										</p>
										<p className="text-3xl font-bold text-gray-800 mt-1">
											{kpiData.openRequests}
										</p>
									</div>
									<div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
										<Download className="h-6 w-6 text-yellow-600" />
									</div>
								</div>
								<div className="mt-4 text-sm">
									<span className="text-red-600 font-medium">+5%</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div>
							<div className="bg-white rounded-lg shadow-sm p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-500 font-medium">
											Closed Requests
										</p>
										<p className="text-3xl font-bold text-gray-800 mt-1">
											{kpiData.closedRequests}
										</p>
									</div>
									<div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
										<Download className="h-6 w-6 text-green-600" />
									</div>
								</div>
								<div className="mt-4 text-sm">
									<span className="text-green-600 font-medium">+18%</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div>
							<div className="bg-white rounded-lg shadow-sm p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-500 font-medium">
											Overdue Requests
										</p>
										<p className="text-3xl font-bold text-gray-800 mt-1">
											{kpiData.overdueRequests}
										</p>
									</div>
									<div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
										<Download className="h-6 w-6 text-red-600" />
									</div>
								</div>
								<div className="mt-4 text-sm">
									<span className="text-red-600 font-medium">-8%</span>
									<span className="text-gray-500 ml-1">from last month</span>
								</div>
							</div>
						</div>
						{/* Charts Row */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Line Chart */}
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h2 className="text-lg font-semibold text-gray-800 mb-4">
									Requests Over Time
								</h2>
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										<LineChart
											data={requestsOverTimeData}
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
												stroke="#ef4444"
												strokeWidth={2}
												activeDot={{
													r: 6,
												}}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							</div>
							{/* Bar Chart */}
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h2 className="text-lg font-semibold text-gray-800 mb-4">
									Top 5 Suppliers by Assigned Requests
								</h2>
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={topSuppliers}
											layout="vertical"
											margin={{
												top: 5,
												right: 30,
												left: 20,
												bottom: 5,
											}}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke="#f0f0f0"
												horizontal={false}
											/>
											<XAxis type="number" stroke="#9ca3af" />
											<YAxis
												dataKey="name"
												type="category"
												width={150}
												stroke="#9ca3af"
												tickLine={false}
												axisLine={false}
												tick={{
													fontSize: 12,
												}}
											/>
											<Tooltip
												contentStyle={{
													backgroundColor: "#fff",
													border: "1px solid #e5e7eb",
													borderRadius: "0.375rem",
													boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
												}}
												formatter={(value) => [
													`${value} Requests`,
													"Assigned Requests",
												]}
											/>
											<Bar dataKey="assignedRequests" radius={[0, 4, 4, 0]}>
												{topSuppliers.map((entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={barColors[index % barColors.length]}
													/>
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>
						{/* Supplier Performance Table */}
						<div className="bg-white rounded-lg shadow-sm">
							<div className="p-6 border-b border-gray-200">
								<h2 className="text-lg font-semibold text-gray-800">
									Supplier Performance
								</h2>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-50 text-gray-600 text-sm">
										<tr>
											<th className="py-3 px-6 text-left font-medium">
												Supplier Name
											</th>
											<th className="py-3 px-6 text-center font-medium">
												Assigned Requests
											</th>
											<th className="py-3 px-6 text-right font-medium">
												Total Value
											</th>
											<th className="py-3 px-6 text-right font-medium">
												Average Value
											</th>
											<th className="py-3 px-6 text-center font-medium">
												Failed Supply Count
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{supplierPerformanceData.map((supplier) => (
											<tr key={supplier.id} className="hover:bg-gray-50">
												<td className="py-4 px-6 font-medium text-gray-900">
													{supplier.name}
												</td>
												<td className="py-4 px-6 text-center">
													{supplier.assignedRequests}
												</td>
												<td className="py-4 px-6 text-right">
													${supplier.totalValue.toLocaleString()}
												</td>
												<td className="py-4 px-6 text-right">
													${supplier.averageValue.toFixed(2)}
												</td>
												<td className="py-4 px-6 text-center">
													<span
														className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															supplier.failedCount === 0
																? "bg-green-100 text-green-800"
																: supplier.failedCount > 3
																? "bg-red-100 text-red-800"
																: "bg-yellow-100 text-yellow-800"
														}`}
													>
														{supplier.failedCount}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="p-4 border-t border-gray-200 text-sm text-gray-500">
								Showing {supplierPerformanceData.length} suppliers
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
