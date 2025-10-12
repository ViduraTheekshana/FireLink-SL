import React, { useState, Fragment } from "react";
import {
	UserIcon,
	CheckIcon,
	XIcon,
	SearchIcon,
	FilterIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	CalendarIcon,
	DollarSignIcon,
	UsersIcon,
	ClockIcon,
} from "lucide-react";
import Sidebar from "../../components/SideBar";
const EmployeePayments = () => {
	const [filter, setFilter] = useState("all");
	const [sortField, setSortField] = useState("createdAt");
	const [sortDirection, setSortDirection] = useState("desc");
	const [showDetails, setShowDetails] = useState(null);
	// Mock employee payment data
	const [employeePayments, setEmployeePayments] = useState([
		{
			_id: "68e8d9cc86025282f3d0534d",
			employeeName: "Vidura",
			totalWorkingDays: 30,
			daysPresent: 29,
			daysAbsent: 1,
			title: "salary",
			basicSalary: 160000,
			perDaySalary: 5333.33,
			otHours: 7,
			otPay: 4666.66,
			mealAllowance: 1000,
			transportAllowance: 2000,
			medicalAllowance: 1000,
			noPayLeaves: 2,
			taxRate: 6,
			epfRate: 8,
			EPF: 0,
			finalSalary: 135080,
			status: "pending",
			createdAt: "2023-10-10T10:02:52.355+00:00",
		},
		{
			_id: "68e8d9cc86025282f3d0534e",
			employeeName: "Sarah Johnson",
			totalWorkingDays: 30,
			daysPresent: 30,
			daysAbsent: 0,
			title: "salary",
			basicSalary: 145000,
			perDaySalary: 4833.33,
			otHours: 5,
			otPay: 3333.33,
			mealAllowance: 1000,
			transportAllowance: 2000,
			medicalAllowance: 1000,
			noPayLeaves: 0,
			taxRate: 6,
			epfRate: 8,
			EPF: 0,
			finalSalary: 128000,
			status: "approved",
			createdAt: "2023-10-09T09:15:22.355+00:00",
		},
		{
			_id: "68e8d9cc86025282f3d0534f",
			employeeName: "Michael Chen",
			totalWorkingDays: 30,
			daysPresent: 28,
			daysAbsent: 2,
			title: "salary",
			basicSalary: 175000,
			perDaySalary: 5833.33,
			otHours: 0,
			otPay: 0,
			mealAllowance: 1000,
			transportAllowance: 2000,
			medicalAllowance: 1000,
			noPayLeaves: 2,
			taxRate: 6,
			epfRate: 8,
			EPF: 0,
			finalSalary: 145833.34,
			status: "pending",
			createdAt: "2023-10-08T14:22:10.355+00:00",
		},
		{
			_id: "68e8d9cc86025282f3d05350",
			employeeName: "Jessica Williams",
			totalWorkingDays: 30,
			daysPresent: 27,
			daysAbsent: 3,
			title: "salary",
			basicSalary: 150000,
			perDaySalary: 5000,
			otHours: 10,
			otPay: 6666.67,
			mealAllowance: 1000,
			transportAllowance: 2000,
			medicalAllowance: 1000,
			noPayLeaves: 3,
			taxRate: 6,
			epfRate: 8,
			EPF: 0,
			finalSalary: 125000,
			status: "rejected",
			createdAt: "2023-10-07T11:45:22.355+00:00",
		},
	]);
	// Filter payments based on selected filter
	const filteredPayments =
		filter === "all"
			? employeePayments
			: employeePayments.filter((p) => p.status === filter);
	// Sort payments based on selected field and direction
	const sortedPayments = [...filteredPayments].sort((a, b) => {
		if (sortField === "createdAt") {
			return sortDirection === "asc"
				? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
				: new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		} else if (sortField === "finalSalary") {
			return sortDirection === "asc"
				? a.finalSalary - b.finalSalary
				: b.finalSalary - a.finalSalary;
		}
		return 0;
	});
	// Handle sort toggle
	const toggleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};
	// Format date for display
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};
	// Handle payment approval
	const handleApproval = (id, status) => {
		setEmployeePayments(
			employeePayments.map((payment) =>
				payment._id === id
					? {
							...payment,
							status,
					  }
					: payment
			)
		);
	};
	// Get status badge color
	const getStatusBadge = (status) => {
		switch (status) {
			case "approved":
				return "bg-green-100 text-green-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			case "pending":
			default:
				return "bg-yellow-100 text-yellow-800";
		}
	};
	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						<h1 className="text-2xl font-bold text-gray-800">
							Employee Payments
						</h1>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Pending Approvals
										</h3>
										<p className="text-3xl font-bold">
											{
												employeePayments.filter((p) => p.status === "pending")
													.length
											}
										</p>
										<p className="text-blue-100 mt-1">payments need review</p>
									</div>
									<div className="bg-blue-400/30 p-4 rounded-full">
										<UserIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Approved Payments
										</h3>
										<p className="text-3xl font-bold">
											$
											{employeePayments
												.filter((p) => p.status === "approved")
												.reduce((sum, p) => sum + p.finalSalary, 0)
												.toLocaleString()}
										</p>
										<p className="text-green-100 mt-1">total approved</p>
									</div>
									<div className="bg-green-400/30 p-4 rounded-full">
										<CheckIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Payment Schedule
										</h3>
										<p className="text-3xl font-bold">Oct 30</p>
										<p className="text-purple-100 mt-1">next payroll date</p>
									</div>
									<div className="bg-purple-400/30 p-4 rounded-full">
										<CalendarIcon size={32} />
									</div>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm p-5">
							<div className="flex items-center justify-between mb-6 border-b pb-4">
								<div className="flex items-center">
									<div className="bg-blue-100 p-2 rounded-full mr-3">
										<UsersIcon size={20} className="text-blue-600" />
									</div>
									<h2 className="text-xl font-semibold">Employee Payments</h2>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-500">
										<CalendarIcon size={16} className="inline mr-1" />
										October 2023
									</span>
								</div>
							</div>
							<div className="flex flex-wrap justify-between items-center mb-6">
								<div className="flex items-center space-x-4 mb-4 sm:mb-0">
									<div className="relative">
										<SearchIcon
											size={16}
											className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
										/>
										<input
											type="text"
											placeholder="Search employee..."
											className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>
									<div className="flex items-center space-x-2 ml-4">
										<FilterIcon size={16} className="text-gray-500" />
										<span className="text-sm font-medium">Status:</span>
										<select
											className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											value={filter}
											onChange={(e) => setFilter(e.target.value)}
										>
											<option value="all">All Payments</option>
											<option value="pending">Pending</option>
											<option value="approved">Approved</option>
											<option value="rejected">Rejected</option>
										</select>
									</div>
								</div>
								<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center shadow-sm transition-colors">
									<DollarSignIcon size={16} className="mr-1" />
									Process New Payment
								</button>
							</div>
							<div className="overflow-x-auto rounded-lg border">
								<table className="min-w-full bg-white">
									<thead className="bg-gray-50 text-gray-600 text-sm">
										<tr>
											<th className="py-3 px-4 text-left font-semibold">
												Employee
											</th>
											<th className="py-3 px-4 text-left font-semibold">
												Working Days
											</th>
											<th className="py-3 px-4 text-left font-semibold">
												No-Pay Leaves
											</th>
											<th
												className="py-3 px-4 text-left font-semibold cursor-pointer"
												onClick={() => toggleSort("finalSalary")}
											>
												<div className="flex items-center">
													Final Salary
													{sortField === "finalSalary" &&
														(sortDirection === "asc" ? (
															<ChevronUpIcon size={16} className="ml-1" />
														) : (
															<ChevronDownIcon size={16} className="ml-1" />
														))}
												</div>
											</th>
											<th
												className="py-3 px-4 text-left font-semibold cursor-pointer"
												onClick={() => toggleSort("createdAt")}
											>
												<div className="flex items-center">
													Date
													{sortField === "createdAt" &&
														(sortDirection === "asc" ? (
															<ChevronUpIcon size={16} className="ml-1" />
														) : (
															<ChevronDownIcon size={16} className="ml-1" />
														))}
												</div>
											</th>
											<th className="py-3 px-4 text-left font-semibold">
												Status
											</th>
											<th className="py-3 px-4 text-center font-semibold">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{sortedPayments.map((payment) => (
											<Fragment key={payment._id}>
												<tr
													className={`hover:bg-gray-50 ${
														showDetails === payment._id ? "bg-blue-50" : ""
													}`}
												>
													<td className="py-3 px-4">
														<div className="flex items-center">
															<div className="bg-gray-200 rounded-full p-2 mr-3">
																<UserIcon size={16} className="text-gray-600" />
															</div>
															<div>
																<p className="font-medium">
																	{payment.employeeName}
																</p>
																<p className="text-xs text-gray-500">
																	{payment.title}
																</p>
															</div>
														</div>
													</td>
													<td className="py-3 px-4 text-sm">
														<div>
															<p>
																{payment.daysPresent} /{" "}
																{payment.totalWorkingDays} days
															</p>
															<p className="text-xs text-gray-500">
																{payment.daysAbsent} absent
															</p>
														</div>
													</td>
													<td className="py-3 px-4 text-sm">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${
																payment.noPayLeaves > 0
																	? "bg-yellow-100 text-yellow-800"
																	: "bg-green-100 text-green-800"
															}`}
														>
															{payment.noPayLeaves} days
														</span>
													</td>
													<td className="py-3 px-4 text-sm font-medium">
														${payment.finalSalary.toLocaleString()}
													</td>
													<td className="py-3 px-4 text-sm">
														{formatDate(payment.createdAt)}
													</td>
													<td className="py-3 px-4">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
																payment.status
															)}`}
														>
															{payment.status?.charAt(0).toUpperCase() +
																payment.status?.slice(1) || "Pending"}
														</span>
													</td>
													<td className="py-3 px-4 text-center">
														<div className="flex justify-center space-x-2">
															{payment.status === "pending" && (
																<>
																	<button
																		onClick={() =>
																			handleApproval(payment._id, "approved")
																		}
																		className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
																		title="Approve"
																	>
																		<CheckIcon size={16} />
																	</button>
																	<button
																		onClick={() =>
																			handleApproval(payment._id, "rejected")
																		}
																		className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
																		title="Reject"
																	>
																		<XIcon size={16} />
																	</button>
																</>
															)}
															<button
																onClick={() =>
																	setShowDetails(
																		showDetails === payment._id
																			? null
																			: payment._id
																	)
																}
																className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
																title="View Details"
															>
																{showDetails === payment._id ? (
																	<ChevronUpIcon size={16} />
																) : (
																	<ChevronDownIcon size={16} />
																)}
															</button>
														</div>
													</td>
												</tr>
												{showDetails === payment._id && (
													<tr className="bg-blue-50">
														<td colSpan={7} className="py-4 px-6">
															<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
																<div className="bg-white p-4 rounded-lg shadow-sm">
																	<h4 className="font-medium text-sm mb-3 flex items-center">
																		<DollarSignIcon
																			size={16}
																			className="mr-1 text-blue-600"
																		/>
																		Salary Details
																	</h4>
																	<div className="space-y-2 text-sm">
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Basic Salary:
																			</span>
																			<span className="font-medium">
																				${payment.basicSalary.toLocaleString()}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Per Day:
																			</span>
																			<span>
																				${payment.perDaySalary.toFixed(2)}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				OT Hours:
																			</span>
																			<span>{payment.otHours} hrs</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				OT Pay:
																			</span>
																			<span>${payment.otPay.toFixed(2)}</span>
																		</div>
																	</div>
																</div>
																<div className="bg-white p-4 rounded-lg shadow-sm">
																	<h4 className="font-medium text-sm mb-3 flex items-center">
																		<ClockIcon
																			size={16}
																			className="mr-1 text-green-600"
																		/>
																		Allowances
																	</h4>
																	<div className="space-y-2 text-sm">
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Meal:
																			</span>
																			<span>
																				$
																				{payment.mealAllowance.toLocaleString()}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Transport:
																			</span>
																			<span>
																				$
																				{payment.transportAllowance.toLocaleString()}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Medical:
																			</span>
																			<span>
																				$
																				{payment.medicalAllowance.toLocaleString()}
																			</span>
																		</div>
																		<div className="flex justify-between pt-2 mt-1 border-t border-gray-100">
																			<span className="font-medium">
																				Total:
																			</span>
																			<span className="font-medium">
																				$
																				{(
																					payment.mealAllowance +
																					payment.transportAllowance +
																					payment.medicalAllowance
																				).toLocaleString()}
																			</span>
																		</div>
																	</div>
																</div>
																<div className="bg-white p-4 rounded-lg shadow-sm">
																	<h4 className="font-medium text-sm mb-3 flex items-center">
																		<UsersIcon
																			size={16}
																			className="mr-1 text-red-600"
																		/>
																		Deductions
																	</h4>
																	<div className="space-y-2 text-sm">
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				No-Pay Leaves:
																			</span>
																			<span
																				className={
																					payment.noPayLeaves > 0
																						? "text-red-600"
																						: ""
																				}
																			>
																				{payment.noPayLeaves} days ($
																				{(
																					payment.noPayLeaves *
																					payment.perDaySalary
																				).toFixed(2)}
																				)
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Tax ({payment.taxRate}%):
																			</span>
																			<span>
																				$
																				{(
																					(payment.finalSalary *
																						payment.taxRate) /
																					100
																				).toFixed(2)}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				EPF ({payment.epfRate}%):
																			</span>
																			<span>
																				$
																				{(
																					(payment.finalSalary *
																						payment.epfRate) /
																					100
																				).toFixed(2)}
																			</span>
																		</div>
																		<div className="flex justify-between font-medium pt-2 mt-1 border-t border-gray-100">
																			<span>Final Salary:</span>
																			<span className="text-lg text-blue-600">
																				${payment.finalSalary.toLocaleString()}
																			</span>
																		</div>
																	</div>
																</div>
															</div>
															{payment.status === "pending" && (
																<div className="mt-4 pt-3 border-t flex justify-end space-x-3">
																	<button
																		onClick={() =>
																			handleApproval(payment._id, "rejected")
																		}
																		className="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
																	>
																		Reject Payment
																	</button>
																	<button
																		onClick={() =>
																			handleApproval(payment._id, "approved")
																		}
																		className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
																	>
																		Approve Payment
																	</button>
																</div>
															)}
														</td>
													</tr>
												)}
											</Fragment>
										))}
									</tbody>
								</table>
							</div>
							{sortedPayments.length === 0 && (
								<div className="text-center py-10">
									<UserIcon size={48} className="mx-auto text-gray-300 mb-4" />
									<p className="text-gray-500">
										No employee payments found matching your criteria.
									</p>
								</div>
							)}
							<div className="mt-4 flex justify-between items-center text-sm text-gray-600">
								<span>
									Showing {sortedPayments.length} of {employeePayments.length}{" "}
									payments
								</span>
								<div className="flex space-x-2">
									<button className="px-3 py-1 border rounded-md hover:bg-gray-50 transition-colors">
										Previous
									</button>
									<button className="px-3 py-1 border rounded-md bg-blue-50 text-blue-600 font-medium">
										1
									</button>
									<button className="px-3 py-1 border rounded-md hover:bg-gray-50 transition-colors">
										Next
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

export default EmployeePayments;
