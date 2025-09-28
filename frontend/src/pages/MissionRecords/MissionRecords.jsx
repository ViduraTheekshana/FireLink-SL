import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { missionService } from "../../services/missionService";

const MissionRecords = () => {
	const navigate = useNavigate();
	const [missions, setMissions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [editingMissionId, setEditingMissionId] = useState(null);
	const [formData, setFormData] = useState({
		missionType: "",
		missionDate: "",
		missionTime: "",
		description: "",
		inventoryItems: [],
	});
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [filters, setFilters] = useState({
		missionType: "",
	});

	// Mission types for dropdown
	const missionTypes = [
		"Fire Emergency",
		"Rescue Operation",
		"Medical Emergency",
		"Training Exercise",
		"Maintenance",
		"Other",
	];

	// Load missions on component mount
	useEffect(() => {
		loadMissions();
	}, [currentPage, filters]);

	const loadMissions = async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 10,
				missionType: filters.missionType,
			};

			const response = await missionService.getMissions(params);
			setMissions(response.docs || []);
			setTotalPages(response.totalPages || 1);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to load missions");
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleInventoryItemChange = (index, field, value) => {
		const updatedItems = [...formData.inventoryItems];
		updatedItems[index] = {
			...updatedItems[index],
			[field]: value,
		};
		setFormData((prev) => ({
			...prev,
			inventoryItems: updatedItems,
		}));
	};

	const addInventoryItem = () => {
		setFormData((prev) => ({
			...prev,
			inventoryItems: [
				...prev.inventoryItems,
				{ itemCode: "", quantity: 0, usedQuantity: 0 },
			],
		}));
	};

	const removeInventoryItem = (index) => {
		setFormData((prev) => ({
			...prev,
			inventoryItems: prev.inventoryItems.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			setError("");

			// Validate inventory items
			const validItems = formData.inventoryItems.filter(
				(item) => item.itemCode && item.quantity > 0
			);

			const missionData = {
				...formData,
				inventoryItems: validItems,
			};

			if (editingMissionId) {
				await missionService.updateMission(editingMissionId, missionData);
			} else {
				await missionService.createMission(missionData);
			}

			// Reset form and reload missions
			setFormData({
				missionType: "",
				missionDate: "",
				missionTime: "",
				description: "",
				inventoryItems: [],
			});
			setShowForm(false);
			setEditingMissionId(null);
			loadMissions();

			alert(editingMissionId ? "Mission record updated successfully!" : "Mission record created successfully!");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to create mission");
		} finally {
			setLoading(false);
		}
	};

	const startEditMission = (mission) => {
		setEditingMissionId(mission._id);
		setFormData({
			missionType: mission.missionType || "",
			missionDate: mission.missionDate ? new Date(mission.missionDate).toISOString().slice(0, 10) : "",
			missionTime: mission.missionTime || "",
			description: mission.description || "",
			inventoryItems: (mission.inventoryItems || []).map((it) => ({
				itemCode: it.itemCode || "",
				quantity: Number(it.quantity) || 0,
				usedQuantity: Number(it.usedQuantity) || 0,
			})),
		});
		setShowForm(true);
	};

	const deleteMission = async (id) => {
		if (!window.confirm("Are you sure you want to delete this mission?")) return;
		try {
			setLoading(true);
			setError("");
			await missionService.deleteMission(id);
			await loadMissions();
			alert("Mission deleted successfully");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to delete mission");
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
		setCurrentPage(1); // Reset to first page when filtering
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString();
	};

	const formatTime = (timeString) => {
		return timeString;
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-4">
					Mission Records Management
				</h1>
				<p className="text-gray-600">
					Manage and track all fire department missions and operations.
				</p>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">Filters</h2>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Mission Type
						</label>
						<select
							name="missionType"
							value={filters.missionType}
							onChange={handleFilterChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">All Types</option>
							{missionTypes.map((type) => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Add Mission Button */}
		<div className="mb-6 flex items-center gap-3">
			<button
				onClick={() => setShowForm(!showForm)}
				className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
			>
				{showForm ? "Cancel" : "Add New Mission"}
			</button>
			<button
				onClick={() => navigate("/salary-management")}
				className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
			>
				Go to Salary Management
			</button>
		</div>

			{/* Mission Form */}
			{showForm && (
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Add New Mission Record</h2>
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Mission Type *
								</label>
								<select
									name="missionType"
									value={formData.missionType}
									onChange={handleInputChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Select Mission Type</option>
									{missionTypes.map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Mission Date *
								</label>
								<input
									type="date"
									name="missionDate"
									value={formData.missionDate}
									onChange={handleInputChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Mission Time *
								</label>
								<input
									type="time"
									name="missionTime"
									value={formData.missionTime}
									onChange={handleInputChange}
									required
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Description *
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								required
								rows="4"
								maxLength={25}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Provide a detailed description of the mission..."
							/>
						</div>

						{/* Inventory Items */}
						<div>
							<div className="flex justify-between items-center mb-4">
								<label className="block text-sm font-medium text-gray-700">
									Inventory Items Used
								</label>
								<button
									type="button"
									onClick={addInventoryItem}
									className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
								>
									Add Item
								</button>
							</div>

							{formData.inventoryItems.map((item, index) => (
								<div
									key={index}
									className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded"
								>
									<div>
                                       <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Item Code
                                        </label>
                                <input
                                 type="text"
                                 value={item.itemCode}
                                 onChange={(e) => {
                                 let value = e.target.value.toUpperCase();

      
                                if (!value.startsWith("IT")) {
                                   value = "IT" + value.replace(/^IT/, "");
                                    }

    
                                  if (value.length > 5) {
                                    value = value.slice(0, 5);
                                    }

                                   handleInventoryItemChange(index, "itemCode", value);
                                   }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., IT001"
                                    required
                                />
                            </div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Available Quantity
										</label>
										<input
											type="number"
											value={item.quantity}
											onChange={(e) =>
												handleInventoryItemChange(
													index,
													"quantity",
													parseInt(e.target.value) || 0
												)
											}
											min="0"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Used Quantity
										</label>
										<input
											type="number"
											value={item.usedQuantity}
											onChange={(e) =>
												handleInventoryItemChange(
													index,
													"usedQuantity",
													parseInt(e.target.value) || 0
												)
											}
											min="0"
											max={item.quantity}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div className="flex items-end">
										<button
											type="button"
											onClick={() => removeInventoryItem(index)}
											className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
										>
											Remove
										</button>
									</div>
								</div>
							))}
						</div>

						<div className="flex justify-end space-x-4">
							<button
								type="button"
								onClick={() => setShowForm(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
							>
								{loading ? "Creating..." : "Create Mission"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Missions List */}
			<div className="bg-white rounded-lg shadow-md">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold">Mission Records</h2>
				</div>

				{loading ? (
					<div className="p-6 text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-2 text-gray-600">Loading missions...</p>
					</div>
				) : missions.length === 0 ? (
					<div className="p-6 text-center text-gray-500">
						No missions found.{" "}
						{filters.missionType
							? "Try adjusting your filters."
							: "Create your first mission record."}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Type
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Date
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Time
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Description
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Items Used
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Created By
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{missions.map((mission) => (
									<tr key={mission._id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
												{mission.missionType}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatDate(mission.missionDate)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatTime(mission.missionTime)}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											<div
												className="max-w-xs truncate"
												title={mission.description}
											>
												{mission.description}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
											{mission.inventoryItems && mission.inventoryItems.length > 0 ? (
												<div className="space-y-1">
													{mission.inventoryItems.map((it, idx) => (
														<div key={idx} className="text-xs">
															<span className="font-medium">{it.itemCode}</span>
															{` (Available: ${it.quantity}, Used: ${it.usedQuantity})`}
														</div>
													))}
												</div>
											) : (
												<span className="text-gray-500">No items</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													mission.status === "Active"
														? "bg-yellow-100 text-yellow-800"
														: mission.status === "Completed"
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{mission.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{mission.createdBy?.name || "Unknown"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="flex items-center gap-2">
												<button
													onClick={() => startEditMission(mission)}
													className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
												>
													Edit
												</button>
												<button
													onClick={() => deleteMission(mission._id)}
													className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="px-6 py-4 border-t border-gray-200">
						<div className="flex justify-between items-center">
							<div className="text-sm text-gray-700">
								Page {currentPage} of {totalPages}
							</div>
							<div className="flex space-x-2">
								<button
									onClick={() =>
										setCurrentPage((prev) => Math.max(1, prev - 1))
									}
									disabled={currentPage === 1}
									className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
								>
									Previous
								</button>
								<button
									onClick={() =>
										setCurrentPage((prev) => Math.min(totalPages, prev + 1))
									}
									disabled={currentPage === totalPages}
									className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
								>
									Next
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default MissionRecords;
