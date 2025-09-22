import React, { useEffect, useState } from "react";
import { CalendarIcon, SearchIcon } from "lucide-react";
import { toast } from "react-toastify";
import { addBid, updateBid } from "../../services/supply/supplyRequestService";
import formatDate from "../../utils/convertDate";
import { useNavigate } from "react-router-dom";
import extractErrorMessage from "../../utils/errorMessageParser";

function ModifyBidForm({
	currentRequest,
	supplyRequests,
	handleCancel,
	setCurrentRequest,
	setShowForm,
}) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [offerPrice, setOfferPrice] = useState(0);
	const [notes, setNotes] = useState("");
	const [deliveryDate, setDeliveryDate] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		if (currentRequest?.bid) {
			setOfferPrice(currentRequest?.bid.offerPrice);
			setNotes(currentRequest?.bid.notes);
			setDeliveryDate(formatDate(currentRequest?.bid.deliveryDate));
		}
	}, [currentRequest]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			setError("");
		}
	}, [error]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const bidData = {
				offerPrice,
				notes,
				deliveryDate,
			};

			const apiCall = currentRequest.bid ? updateBid : addBid;
			const res = await apiCall(currentRequest._id, bidData);

			if (res.success) {
				setCurrentRequest(null);
				setShowForm(false);
				toast.success(`Successful`);
			}
		} catch (exception) {
			setError(extractErrorMessage(exception));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-bold text-gray-800">
					{currentRequest
						? `Edit Bid: ${currentRequest.id}`
						: "New Bid Submission"}
				</h2>
				<button
					className="text-gray-500 hover:text-gray-700"
					onClick={handleCancel}
				>
					Cancel
				</button>
			</div>
			{currentRequest ? (
				<form className="space-y-6" onSubmit={(e) => handleSubmit(e)}>
					<div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
						<h3 className="font-medium text-gray-700 mb-3">
							Request Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500">Request ID:</p>
								<p className="font-medium">{currentRequest?.id}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Item:</p>
								<p className="font-medium">{currentRequest?.title}</p>
							</div>
							<div>
								<p className="text-sm text-gray-500">Quantity:</p>
								<p className="font-medium">
									{currentRequest?.quantity} {currentRequest?.unit}
								</p>
							</div>
						</div>
					</div>
					<div className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Offer Price (Rs.) <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
									Rs.
								</span>
								<input
									type="number"
									className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
									value={offerPrice}
									onChange={(e) => setOfferPrice(e.target.value)}
									step="0.01"
									min="0"
									required
									placeholder="0.00"
								/>
							</div>
							<p className="mt-1 text-sm text-gray-500">
								Enter your offer price
							</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Estimated Delivery Date <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<CalendarIcon size={16} className="text-gray-500" />
								</div>
								<input
									type="date"
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
									value={deliveryDate}
									onChange={(e) => setDeliveryDate(e.target.value)}
									required
								/>
							</div>
							<p className="mt-1 text-sm text-gray-500">
								When can you deliver the items if your bid is accepted?
							</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Additional Notes
							</label>
							<textarea
								className="w-full border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
								rows={4}
								placeholder="Any additional information about your bid..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
							></textarea>
							<p className="mt-1 text-sm text-gray-500">
								Include any special terms, conditions, or information about your
								offer
							</p>
						</div>
					</div>
					<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
						<button
							type="button"
							className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium"
							onClick={handleCancel}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
							disabled={loading ? true : false}
						>
							{currentRequest.bid ? "Update Bid" : "Submit Bid"}
						</button>
					</div>
				</form>
			) : (
				<div className="text-center py-12">
					<div className="mb-4">
						<div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
							<SearchIcon className="h-8 w-8 text-red-600" />
						</div>
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Select a Request
					</h3>
					<p className="text-gray-500 mb-6">
						Please select a supply request to bid on
					</p>
					<div className="max-w-md mx-auto">
						<select
							className="w-full border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
							value={""}
							onChange={(e) => setCurrentRequest(JSON.parse(e.target.value))}
						>
							<option value="">Select Request ID</option>
							{supplyRequests.map((req) => (
								<option key={req.id} value={JSON.stringify(req)}>
									{req.id} - {req.title} ({req.quantity} {req.unit})
								</option>
							))}
						</select>
					</div>
				</div>
			)}
		</div>
	);
}

export default ModifyBidForm;
