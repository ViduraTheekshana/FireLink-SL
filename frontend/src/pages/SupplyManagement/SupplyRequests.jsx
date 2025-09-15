import React, { useEffect, useState } from "react";
import { Filter, Edit, Trash2 } from "lucide-react";
import { getSupplyRequests } from "../../services/supply/supplyRequestService";
import formatDate from "../../utils/convertDate";
import Loader from "../../components/Loader";
import Sidebar from "../../components/SideBar";
import SearchBox from "../../components/SearchBox";
import StatusBadge from "../../components/StatusBadge";

const SupplyRequests = () => {
	const [filterStatus, setFilterStatus] = useState("all");
	const [loading, setLoading] = useState(true);
	const [SupplyRequests, setSupplyRequests] = useState([]);
	const [error, setError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 20;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await getSupplyRequests();
				setSupplyRequests(res.data);
			} catch (exception) {
				console.log(exception);
				setError(exception.data.message);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const filteredRequests = SupplyRequests.filter((request) => {
		const matchesSearch =
			searchQuery === "" ||
			request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.id.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			filterStatus === "all" || request.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentRequests = filteredRequests.slice(
		indexOfFirstItem,
		indexOfLastItem
	);

	const handleNextPage = () => {
		if (indexOfLastItem < filteredRequests.length) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	if (loading) return <Loader />;

	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar />
			<div className="flex flex-col flex-1 overflow-hidden">
				<SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-bold text-gray-800">
								Supplier Requests
							</h1>
						</div>
						<div className="bg-white rounded-lg shadow">
							<div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div className="flex items-center gap-2">
									<Filter size={18} className="text-gray-500" />
									<span className="font-medium">Filters:</span>
								</div>
								<div className="flex flex-wrap gap-3">
									<select
										className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
										value={filterStatus}
										onChange={(e) => {
											setFilterStatus(e.target.value);
											setCurrentPage(1);
										}}
									>
										<option value="all">All</option>
										<option value="Open">Open</option>
										<option value="Closed">Closed</option>
									</select>
								</div>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-50 text-gray-600 text-sm">
										<tr>
											<th className="py-3 px-4 text-left font-medium">
												Request ID
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Request title
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Category
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Quantity
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Created Date
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Deadline
											</th>
											<th className="py-3 px-4 text-left font-medium">
												Status
											</th>
											<th className="py-3 px-4 text-center font-medium">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{currentRequests.map((request) => (
											<tr key={request.id} className="hover:bg-gray-50">
												<td className="py-3 px-4 font-medium">{request.id}</td>
												<td className="py-3 px-4">{request.title}</td>
												<td className="py-3 px-4">{request.category}</td>
												<td className="py-3 px-4">{request.quantity}</td>
												<td className="py-3 px-4">
													{formatDate(request.createdAt)}
												</td>
												<td className="py-3 px-4">
													{formatDate(request.applicationDeadline)}
												</td>
												<td className="py-3 px-4">
													<StatusBadge status={request.status} />
												</td>
												<td>
													<div className="flex items-center justify-center gap-2">
														<button className="p-1 hover:bg-gray-100 rounded">
															<Edit size={18} className="text-blue-600" />
														</button>
														<button
															className="p-1 hover:bg-red-100 rounded"
															title="Delete"
														>
															<Trash2 size={18} className="text-red-500" />
														</button>
													</div>
												</td>
											</tr>
										))}
										{currentRequests.length === 0 && (
											<tr>
												<td
													colSpan={8}
													className="py-4 text-center text-gray-500"
												>
													No requests found matching your criteria
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
							<div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
								<div>
									Showing {indexOfFirstItem + 1} to{" "}
									{Math.min(indexOfLastItem, filteredRequests.length)} of{" "}
									{filteredRequests.length} requests
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={handlePrevPage}
										disabled={currentPage === 1}
										className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
									>
										Previous
									</button>
									<button
										onClick={handleNextPage}
										disabled={indexOfLastItem >= filteredRequests.length}
										className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
									>
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

export default SupplyRequests;
