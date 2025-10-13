import React, { useEffect, useState } from "react";
import {
	DollarSignIcon,
	PercentIcon,
	UserIcon,
	ClipboardListIcon,
	UsersIcon,
	PieChartIcon,
	BarChartIcon,
	ClipboardCheckIcon,
	ArrowUpIcon,
	WalletIcon,
} from "lucide-react";
import {
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	ComposedChart,
} from "recharts";
import Sidebar from "../../components/SideBar";
import Loader from "../../components/Loader";
import {
	getAllocationData,
	getUsageData,
} from "../../services/finance/financeService";
import extractErrorMessage from "../../utils/errorMessageParser";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const FinancialOverview = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [allocationData, setAllocationData] = useState({});
	const [budgetAllocationData, setBudgetAllocationData] = useState({});
	const [financeManagerBudget, setFinanceManagerBudget] = useState({});

	const navigate = useNavigate();

	const fetchAllocationData = async () => {
		setLoading(true);
		try {
			const res = await getAllocationData();
			const usageRes = await getUsageData();
			setAllocationData(res.data);
			setBudgetAllocationData(
				res.data?.supplyManager
					? [
							{
								name: "Supply Manager",
								value: res.data.supplyManager.totalBudget || 0,
							},
							{
								name: "Finance Manager",
								value:
									res.data.financeManager.totalBudget -
										res.data.supplyManager.totalBudget || 0,
							},
					  ]
					: [
							{
								name: "Finance Manager",
								value: res.data.financeManager.totalBudget || 0,
							},
					  ]
			);

			setFinanceManagerBudget(() => {
				const financeManagerData = usageRes.data?.financeManager || [];

				const totalBudget =
					res.data?.financeManagerTotalBudget ||
					allocationData.financeManager?.totalBudget ||
					0;

				const totalSpent = financeManagerData.reduce(
					(sum, item) => sum + item.totalSpend,
					0
				);

				const remainingAmount = totalBudget - totalSpent;

				const budgetData = [
					...financeManagerData.map((item) => ({
						name: item.name,
						value: item.totalSpend,
					})),
					{
						name: "Free Amount",
						value: remainingAmount > 0 ? remainingAmount : 0,
					},
				];

				return budgetData;
			});
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllocationData();
	}, []);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const COLORS = [
		"#0088FE",
		"#00C49F",
		"#FFBB28",
		"#FF8042",
		"#8884D8",
		"#82CA9D",
	];
	const FINANCE_COLORS = ["#8884D8", "#82CA9D", "#ffc658"];

	if (loading) return <Loader />;

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						<h1 className="text-2xl font-bold text-gray-800">
							Finance Overview
						</h1>
						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">Total Budget</h3>
										<p className="text-3xl font-bold">
											Rs.{allocationData.financeManager.totalBudget}
										</p>
									</div>
									<div className="bg-blue-400/30 p-4 rounded-full">
										<DollarSignIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-md">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Total Expenses
										</h3>
										<p className="text-3xl font-bold">
											Rs.{allocationData.financeManager.spendAmount}
										</p>
									</div>
									<div className="bg-red-400/30 p-4 rounded-full">
										<WalletIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-6 text-white shadow-md">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Remaining Budget
										</h3>
										<p className="text-3xl font-bold">
											Rs.{allocationData.financeManager.remainingAmount}
										</p>
									</div>
									<div className="bg-amber-400/30 p-4 rounded-full">
										<PercentIcon size={32} />
									</div>
								</div>
							</div>
						</div>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div className="bg-white rounded-lg shadow-sm p-5">
								<div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
									<div className="flex items-center">
										<div className="bg-blue-100 p-2 rounded-full mr-3">
											<PieChartIcon size={20} className="text-blue-600" />
										</div>
										<h2 className="text-xl font-semibold">
											Budget Allocation by Manager
										</h2>
									</div>
								</div>
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={budgetAllocationData}
												cx="50%"
												cy="50%"
												labelLine={false}
												outerRadius={100}
												fill="#8884d8"
												dataKey="value"
												label={({ name, percent }) =>
													`${name}: ${percent * 100}%`
												}
											>
												{budgetAllocationData.map((entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={COLORS[index % COLORS.length]}
													/>
												))}
											</Pie>
											<Tooltip
												formatter={(value) => `Rs.${value.toLocaleString()}`}
											/>
										</PieChart>
									</ResponsiveContainer>
									<div className="grid grid-cols-2 gap-4 mt-4">
										{budgetAllocationData.map((entry, index) => (
											<div
												key={`legend-item-${index}`}
												className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm"
											>
												<div
													className="w-4 h-4 rounded-full mr-2"
													style={{
														backgroundColor: COLORS[index % COLORS.length],
													}}
												></div>
												<div>
													<p className="font-medium text-sm text-gray-800">
														{entry.name}
													</p>
													<p className="text-gray-500 text-sm">
														Rs.{entry.value.toLocaleString()}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 mt-2">
									{budgetAllocationData.map((item, index) => (
										<div
											key={index}
											className="flex items-center p-3 bg-gray-50 rounded-lg"
										>
											<div
												className="w-4 h-4 rounded-full mr-2"
												style={{
													backgroundColor: COLORS[index % COLORS.length],
												}}
											></div>
											<div>
												<p className="font-medium text-sm">{item.name}</p>
												<p className="text-gray-500 text-sm">
													Rs.{item.value.toLocaleString()}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
							<div className="bg-white rounded-lg shadow-sm p-5">
								<div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
									<div className="flex items-center">
										<div className="bg-purple-100 p-2 rounded-full mr-3">
											<PieChartIcon size={20} className="text-purple-600" />
										</div>
										<h2 className="text-xl font-semibold">
											Finance Manager Budget Breakdown
										</h2>
									</div>
								</div>
								<div className="h-80">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={financeManagerBudget}
												cx="50%"
												cy="50%"
												labelLine={false}
												outerRadius={100}
												fill="#8884d8"
												dataKey="value"
												label={({ name, percent }) =>
													`${(percent * 100).toFixed(0)}%`
												}
											>
												{financeManagerBudget.map((entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={FINANCE_COLORS[index % FINANCE_COLORS.length]}
													/>
												))}
											</Pie>

											<Tooltip
												formatter={(value) => `$${value.toLocaleString()}`}
											/>
											<Legend />
										</PieChart>
									</ResponsiveContainer>
								</div>
								<div className="grid grid-cols-3 gap-4 mt-2">
									{financeManagerBudget.map((item, index) => (
										<div
											key={index}
											className="flex items-center p-3 bg-gray-50 rounded-lg"
										>
											<div
												className="w-4 h-4 rounded-full mr-2"
												style={{
													backgroundColor:
														FINANCE_COLORS[index % FINANCE_COLORS.length],
												}}
											></div>
											<div>
												<p className="font-medium text-xs">{item.name}</p>
												<p className="text-gray-500 text-xs">
													${item.value.toLocaleString()}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-sm p-5 col-span-2">
							<div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
								<div className="flex items-center">
									<div className="bg-green-100 p-2 rounded-full mr-3">
										<UsersIcon size={20} className="text-green-600" />
									</div>
									<h2 className="text-xl font-semibold">Budget Managers</h2>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
									<div className="bg-blue-100 p-3 rounded-full mr-4">
										<UserIcon size={24} className="text-blue-600" />
									</div>
									<div>
										<h3 className="font-medium">Supply Manager</h3>
										<p className="text-sm text-gray-600">
											Manages equipment & supplies
										</p>
										<p className="text-sm font-medium text-blue-600 mt-1">
											Rs.{allocationData.supplyManager.totalBudget} allocated
										</p>
									</div>
								</div>
								<div className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-100">
									<div className="bg-purple-100 p-3 rounded-full mr-4">
										<UsersIcon size={24} className="text-purple-600" />
									</div>
									<div>
										<h3 className="font-medium">Finance Manager</h3>
										<p className="text-sm text-gray-600">
											Manages salaries & transactions
										</p>
										<p className="text-sm font-medium text-purple-600 mt-1">
											Rs.{allocationData.financeManager.totalBudget} allocated
										</p>
									</div>
								</div>
								<div
									className="md:col-span-2 mt-2"
									onClick={() => {
										navigate("/budget");
									}}
								>
									<button className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium flex items-center justify-center transition-colors">
										<ClipboardListIcon size={18} className="mr-2" />
										View Budget Allocation
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

export default FinancialOverview;
