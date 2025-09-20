import React, { useEffect, useState } from "react";
import { getSupplyRequests } from "../../services/supply/supplyRequestService";
import formatDate from "../../utils/convertDate";
import Loader from "../../components/Loader";
import Sidebar from "../../components/SideBar";
import SearchBox from "../../components/SearchBox";
const SupplyRequestForSupplier = () => {
	const [filter, setFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [SupplyRequests, setSupplyRequests] = useState([]);
	const [error, setError] = useState("");
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
			request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			request.id.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesSearch;
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
				<SearchBox searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					<div className="space-y-6">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl font-bold text-gray-800">
								Supply Requests
							</h1>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												<div className="flex items-center">Request ID</div>
											</th>
											<th
												scope="col"
												className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												<div className="flex items-center">Request title</div>
											</th>
											<th
												scope="col"
												className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												<div className="flex items-center">Category</div>
											</th>
											<th
												scope="col"
												className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												<div className="flex items-center">Quantity</div>
											</th>
											<th
												scope="col"
												className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												<div className="flex items-center">Bid Deadline</div>
											</th>
											<th
												scope="col"
												className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Action
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{currentRequests.map((request) => (
											<tr key={request.id} className="hover:bg-gray-50">
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{request.id}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													{request.title}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													{request.category}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													{request.quantity}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													{formatDate(request.applicationDeadline)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
													{request.status === "Open" ? (
														<button className="text-red-600 hover:text-red-900 font-medium">
															Submit Bid
														</button>
													) : (
														<button
															className="text-gray-400 cursor-not-allowed"
															disabled
														>
															Closed
														</button>
													)}
												</td>
											</tr>
										))}
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

export default SupplyRequestForSupplier;
