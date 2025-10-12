import React, { useState, Fragment } from "react";
import {
	FileTextIcon,
	CheckIcon,
	XIcon,
	SearchIcon,
	FilterIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	CalendarIcon,
	DollarSignIcon,
	UserIcon,
	ClipboardCheckIcon,
	AlertCircleIcon,
	ClockIcon,
} from "lucide-react";
import Sidebar from "../../components/SideBar";
const CertificationRevenue = () => {
	const [filter, setFilter] = useState("all");
	const [sortField, setSortField] = useState("appliedDate");
	const [sortDirection, setSortDirection] = useState("desc");
	const [showDetails, setShowDetails] = useState(null);
	// Mock certification data
	const [certifications, setCertifications] = useState([
		{
			_id: "68e8844981b2e81b5c3ea491",
			fullName: "Praveen D. Wijesinghe",
			nic: "912345678V",
			address: "14/2, Hillview Road, Nugegoda",
			contactNumber: "0777123456",
			email: "praveenwijesinghe@gmail.com",
			constructionType: "Renovation",
			serviceType: "Safety Audit",
			urgencyLevel: "Urgent",
			preferredDate: "2025-10-24T00:00:00.000+00:00",
			additionalNotes:
				"Please process this request as a priority due to an upcoming safety inspection.",
			status: "Payment Assigned",
			payment: 1000,
			inspectionNotes: "",
			appliedDate: "2025-10-10T03:58:01.211+00:00",
			approvedAt: "2025-10-10T09:54:21.802+00:00",
			assignedOfficer: null,
		},
		{
			_id: "68e8844981b2e81b5c3ea492",
			fullName: "Samantha Perera",
			nic: "945678123V",
			address: "27, Lake Drive, Colombo 08",
			contactNumber: "0712345678",
			email: "samantha.perera@gmail.com",
			constructionType: "New Building",
			serviceType: "Fire Safety Certificate",
			urgencyLevel: "Standard",
			preferredDate: "2025-11-15T00:00:00.000+00:00",
			additionalNotes: "New commercial building requiring safety certification",
			status: "Payment Assigned",
			payment: 2500,
			inspectionNotes: "",
			appliedDate: "2025-10-05T10:22:15.211+00:00",
			approvedAt: "2025-10-07T14:30:21.802+00:00",
			assignedOfficer: null,
		},
		{
			_id: "68e8844981b2e81b5c3ea493",
			fullName: "Michael Fernando",
			nic: "892345671V",
			address: "45/3, Green Avenue, Rajagiriya",
			contactNumber: "0765432198",
			email: "michael.fernando@hotmail.com",
			constructionType: "Commercial",
			serviceType: "Inspection",
			urgencyLevel: "High",
			preferredDate: "2025-10-30T00:00:00.000+00:00",
			additionalNotes: "Annual inspection for restaurant premises",
			status: "Completed",
			payment: 1500,
			inspectionNotes: "All safety measures in place. Certificate issued.",
			appliedDate: "2025-09-28T08:45:22.211+00:00",
			approvedAt: "2025-09-29T11:20:21.802+00:00",
			assignedOfficer: "Officer Silva",
		},
		{
			_id: "68e8844981b2e81b5c3ea494",
			fullName: "Amali Jayawardena",
			nic: "905432167V",
			address: "78, Beach Road, Mount Lavinia",
			contactNumber: "0771234987",
			email: "amali.j@gmail.com",
			constructionType: "Renovation",
			serviceType: "Safety Audit",
			urgencyLevel: "Standard",
			preferredDate: "2025-11-10T00:00:00.000+00:00",
			additionalNotes:
				"Hotel renovation requiring updated safety certification",
			status: "In Progress",
			payment: 1800,
			inspectionNotes: "Initial assessment completed. Follow-up required.",
			appliedDate: "2025-10-01T14:33:21.211+00:00",
			approvedAt: "2025-10-03T09:15:21.802+00:00",
			assignedOfficer: "Officer Perera",
		},
	]);
	// Filter certifications based on selected filter
	const filteredCertifications =
		filter === "all"
			? certifications
			: certifications.filter(
					(c) => c.status.toLowerCase() === filter.toLowerCase()
			  );
	// Sort certifications based on selected field and direction
	const sortedCertifications = [...filteredCertifications].sort((a, b) => {
		if (sortField === "appliedDate") {
			return sortDirection === "asc"
				? new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
				: new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
		} else if (sortField === "payment") {
			return sortDirection === "asc"
				? a.payment - b.payment
				: b.payment - a.payment;
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
	// Get status badge color
	const getStatusBadge = (status) => {
		switch (status.toLowerCase()) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "in progress":
				return "bg-blue-100 text-blue-800";
			case "payment assigned":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};
	// Calculate total revenue
	const totalRevenue = certifications.reduce(
		(sum, cert) => sum + cert.payment,
		0
	);
	// Calculate completed certifications
	const completedCount = certifications.filter(
		(cert) => cert.status.toLowerCase() === "completed"
	).length;
	// Calculate pending certifications
	const pendingCount = certifications.filter(
		(cert) => cert.status.toLowerCase() !== "completed"
	).length;
	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						<h1 className="text-2xl font-bold text-gray-800">
							Certification Revenue
						</h1>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">
											Total Revenue
										</h3>
										<p className="text-3xl font-bold">
											${totalRevenue.toLocaleString()}
										</p>
										<p className="text-blue-100 mt-1">
											from all certifications
										</p>
									</div>
									<div className="bg-blue-400/30 p-4 rounded-full">
										<DollarSignIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">Completed</h3>
										<p className="text-3xl font-bold">{completedCount}</p>
										<p className="text-green-100 mt-1">
											certifications completed
										</p>
									</div>
									<div className="bg-green-400/30 p-4 rounded-full">
										<CheckIcon size={32} />
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold mb-1">Pending</h3>
										<p className="text-3xl font-bold">{pendingCount}</p>
										<p className="text-yellow-100 mt-1">
											certifications pending
										</p>
									</div>
									<div className="bg-yellow-400/30 p-4 rounded-full">
										<ClockIcon size={32} />
									</div>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm p-5">
							<div className="flex items-center justify-between mb-6 border-b border-b-gray-200 pb-4">
								<div className="flex items-center">
									<div className="bg-blue-100 p-2 rounded-full mr-3">
										<ClipboardCheckIcon size={20} className="text-blue-600" />
									</div>
									<h2 className="text-xl font-semibold">
										Certification Revenue
									</h2>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-500">
										<CalendarIcon size={16} className="inline mr-1" />
										{new Date().toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
										})}
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
											placeholder="Search by name..."
											className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>
									<div className="flex items-center space-x-2 ml-4">
										<FilterIcon size={16} className="text-gray-500" />
										<span className="text-sm font-medium">Status:</span>
										<select
											className="border border-gray-200 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
											value={filter}
											onChange={(e) => setFilter(e.target.value)}
										>
											<option value="all">All Statuses</option>
											<option value="completed">Completed</option>
											<option value="in progress">In Progress</option>
											<option value="payment assigned">Payment Assigned</option>
										</select>
									</div>
								</div>
								<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center shadow-sm transition-colors">
									<FileTextIcon size={16} className="mr-1" />
									Export Report
								</button>
							</div>
							<div className="overflow-x-auto rounded-lg border border-gray-200">
								<table className="min-w-full bg-white">
									<thead className="bg-gray-50 text-gray-600 text-sm">
										<tr>
											<th className="py-3 px-4 text-left font-semibold">
												Client
											</th>
											<th className="py-3 px-4 text-left font-semibold">
												Service Type
											</th>
											<th
												className="py-3 px-4 text-left font-semibold cursor-pointer"
												onClick={() => toggleSort("payment")}
											>
												<div className="flex items-center">
													Payment
													{sortField === "payment" &&
														(sortDirection === "asc" ? (
															<ChevronUpIcon size={16} className="ml-1" />
														) : (
															<ChevronDownIcon size={16} className="ml-1" />
														))}
												</div>
											</th>
											<th
												className="py-3 px-4 text-left font-semibold cursor-pointer"
												onClick={() => toggleSort("appliedDate")}
											>
												<div className="flex items-center">
													Applied Date
													{sortField === "appliedDate" &&
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
										{sortedCertifications.map((certification) => (
											<Fragment key={certification._id}>
												<tr
													className={`hover:bg-gray-50 ${
														showDetails === certification._id
															? "bg-blue-50"
															: ""
													}`}
												>
													<td className="py-3 px-4">
														<div className="flex items-center">
															<div className="bg-gray-200 rounded-full p-2 mr-3">
																<UserIcon size={16} className="text-gray-600" />
															</div>
															<div>
																<p className="font-medium">
																	{certification.fullName}
																</p>
																<p className="text-xs text-gray-500">
																	{certification.nic}
																</p>
															</div>
														</div>
													</td>
													<td className="py-3 px-4 text-sm">
														<div>
															<p className="font-medium">
																{certification.serviceType}
															</p>
															<p className="text-xs text-gray-500">
																{certification.constructionType}
															</p>
														</div>
													</td>
													<td className="py-3 px-4 text-sm font-medium">
														${certification.payment.toLocaleString()}
													</td>
													<td className="py-3 px-4 text-sm">
														{formatDate(certification.appliedDate)}
													</td>
													<td className="py-3 px-4">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
																certification.status
															)}`}
														>
															{certification.status}
														</span>
													</td>
													<td className="py-3 px-4 text-center">
														<div className="flex justify-center">
															<button
																onClick={() =>
																	setShowDetails(
																		showDetails === certification._id
																			? null
																			: certification._id
																	)
																}
																className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
																title="View Details"
															>
																{showDetails === certification._id ? (
																	<ChevronUpIcon size={16} />
																) : (
																	<ChevronDownIcon size={16} />
																)}
															</button>
														</div>
													</td>
												</tr>
												{showDetails === certification._id && (
													<tr className="bg-blue-50">
														<td colSpan={6} className="py-4 px-6">
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																<div className="bg-white p-4 rounded-lg shadow-sm">
																	<h4 className="font-medium text-sm mb-3 flex items-center">
																		<UserIcon
																			size={16}
																			className="mr-1 text-blue-600"
																		/>
																		Client Details
																	</h4>
																	<div className="space-y-2 text-sm">
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Email:
																			</span>
																			<span>{certification.email}</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Contact:
																			</span>
																			<span>{certification.contactNumber}</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Address:
																			</span>
																			<span className="text-right">
																				{certification.address}
																			</span>
																		</div>
																	</div>
																</div>
																<div className="bg-white p-4 rounded-lg shadow-sm">
																	<h4 className="font-medium text-sm mb-3 flex items-center">
																		<ClipboardCheckIcon
																			size={16}
																			className="mr-1 text-green-600"
																		/>
																		Service Details
																	</h4>
																	<div className="space-y-2 text-sm">
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Urgency:
																			</span>
																			<span
																				className={`font-medium ${
																					certification.urgencyLevel ===
																					"Urgent"
																						? "text-red-600"
																						: certification.urgencyLevel ===
																						  "High"
																						? "text-orange-600"
																						: "text-blue-600"
																				}`}
																			>
																				{certification.urgencyLevel}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Preferred Date:
																			</span>
																			<span>
																				{formatDate(
																					certification.preferredDate
																				)}
																			</span>
																		</div>
																		<div className="flex justify-between">
																			<span className="text-gray-600">
																				Approved At:
																			</span>
																			<span>
																				{formatDate(certification.approvedAt)}
																			</span>
																		</div>
																		{certification.assignedOfficer && (
																			<div className="flex justify-between">
																				<span className="text-gray-600">
																					Officer:
																				</span>
																				<span>
																					{certification.assignedOfficer}
																				</span>
																			</div>
																		)}
																	</div>
																</div>
																<div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2">
																	<h4 className="font-medium text-sm mb-2 flex items-center">
																		<AlertCircleIcon
																			size={16}
																			className="mr-1 text-yellow-600"
																		/>
																		Additional Notes
																	</h4>
																	<p className="text-sm bg-gray-50 p-3 rounded-lg">
																		{certification.additionalNotes}
																	</p>
																	{certification.inspectionNotes && (
																		<>
																			<h4 className="font-medium text-sm mt-3 mb-2 flex items-center">
																				<ClipboardCheckIcon
																					size={16}
																					className="mr-1 text-blue-600"
																				/>
																				Inspection Notes
																			</h4>
																			<p className="text-sm bg-gray-50 p-3 rounded-lg">
																				{certification.inspectionNotes}
																			</p>
																		</>
																	)}
																</div>
															</div>
														</td>
													</tr>
												)}
											</Fragment>
										))}
									</tbody>
								</table>
							</div>
							{sortedCertifications.length === 0 && (
								<div className="text-center py-10">
									<FileTextIcon
										size={48}
										className="mx-auto text-gray-300 mb-4"
									/>
									<p className="text-gray-500">
										No certifications found matching your criteria.
									</p>
								</div>
							)}
							<div className="mt-4 flex justify-between items-center text-sm text-gray-600">
								<span>
									Showing {sortedCertifications.length} of{" "}
									{certifications.length} certifications
								</span>
								<div className="flex space-x-2">
									<button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">
										Previous
									</button>
									<button className="px-3 py-1 border border-gray-200 rounded-md bg-blue-50 text-blue-600 font-medium">
										1
									</button>
									<button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">
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

export default CertificationRevenue;
