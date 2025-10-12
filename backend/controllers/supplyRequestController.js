const SupplyRequest = require("../models/SupplyRequest");
const Supplier = require("../models/Supplier");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const generateId = require("../utils/generateUniqueId");
const Budget = require("../models/Budget");

const createSupplyRequest = catchAsyncErrors(async (req, res) => {
	const { title, description, category, quantity, applicationDeadline, unit } =
		req.body;

	const id = generateId("req");

	const supplyRequest = await SupplyRequest.create({
		title,
		description,
		category,
		quantity,
		applicationDeadline,
		id,
		unit,
	});

	res.status(201).json({
		success: true,
		data: supplyRequest,
	});
});

const getAllSupplyRequests = catchAsyncErrors(async (req, res) => {
	let query = {};

	// filter category
	if (req.query.category) {
		query.category = req.query.category;
	}
	// filter status
	if (req.query.status) {
		query.status = req.query.status;
	}
	// for supplier get only bidden requests
	if (req.query.bids) {
		query.bids = { $elemMatch: { supplier: req.supplier._id } };
	}

	// suppliers only can see open requests
	if (req.supplier) {
		query.status = "Open";
	}

	let supplyRequestsQuery = SupplyRequest.find(query).sort({
		createdAt: -1,
	});

	if (req.query.limit && !req.supplier) {
		const limit = parseInt(req.query.limit);
		if (!isNaN(limit) && limit > 0) {
			supplyRequestsQuery = supplyRequestsQuery
				.limit(limit)
				.populate("assignedSupplier", "name");
		}
	}

	if (req.user && req.user.position === "supply_manager") {
		supplyRequestsQuery = supplyRequestsQuery.populate("bids.supplier");
	}

	const supplyRequests = await supplyRequestsQuery.lean();

	if (req.supplier) {
		supplyRequests.forEach((request) => {
			request.isBidden = request.bids.some(
				(bid) => bid.supplier.toString() === req.supplier._id.toString()
			);

			request.bid = request.bids.find(
				(bid) => bid.supplier.toString() === req.supplier._id.toString()
			);

			delete request.bids;
		});
	}

	res.status(200).json({
		success: true,
		count: supplyRequests.length,
		data: supplyRequests,
	});
});

const getSupplyRequestById = catchAsyncErrors(async (req, res, next) => {
	const supplyRequest = await SupplyRequest.findOne({
		_id: req.params.id,
	}).lean();

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	supplyRequest.bid = supplyRequest.bids.find(
		(bid) => bid.supplier.toString() === req.supplier._id.toString()
	);
	delete supplyRequest.bids;

	res.status(200).json({
		success: true,
		data: supplyRequest,
	});
});

const getSupplyRequestByIdByAdmin = catchAsyncErrors(async (req, res, next) => {
	const supplyRequest = await SupplyRequest.findById(req.params.id)
		.populate("assignedSupplier", "name email phone")
		.populate("bids.supplier", "name email");

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	res.status(200).json({
		success: true,
		data: supplyRequest,
	});
});

const updateSupplyRequest = catchAsyncErrors(async (req, res, next) => {
	const { title, description, category, quantity, applicationDeadline, unit } =
		req.body;

	let supplyRequest = await SupplyRequest.findById(req.params.id);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	if (supplyRequest.status !== "Open") {
		return next(
			new ErrorHandler("Cannot update a closed or assigned request!", 400)
		);
	}

	if (supplyRequest.assignedSupplier) {
		return next(
			new ErrorHandler(
				"Cannot update a request already assigned to a supplier",
				400
			)
		);
	}

	supplyRequest = await SupplyRequest.findByIdAndUpdate(
		req.params.id,
		{
			title,
			description,
			category,
			quantity,
			applicationDeadline,
			unit,
		},
		{
			new: true,
			runValidators: true,
		}
	);

	res.status(200).json({ success: true, data: supplyRequest });
});

const deleteSupplyRequest = catchAsyncErrors(async (req, res, next) => {
	const supplyRequest = await SupplyRequest.findById(req.params.id);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found!", 404));
	}

	if (supplyRequest.assignedSupplier) {
		return next(
			new ErrorHandler("Cannot delete a request that has been assigned", 400)
		);
	}

	await supplyRequest.deleteOne();

	res.status(200).json({
		success: true,
		message: "Supply request deleted successfully",
	});
});

const addBidToRequest = catchAsyncErrors(async (req, res, next) => {
	const { offerPrice, notes, deliveryDate } = req.body;
	const supplyRequest = await SupplyRequest.findById(req.params.id);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	if (supplyRequest.status !== "Open") {
		return next(new ErrorHandler("Bidding is closed for this request", 400));
	}

	if (new Date() > new Date(supplyRequest.applicationDeadline)) {
		return next(new ErrorHandler("The bidding deadline has passed", 400));
	}

	if (supplyRequest.bids.some((bid) => bid.supplier === req.supplier._id)) {
		return res.status(400).json({
			success: false,
			error: "You have already placed a bid on this request",
		});
	}

	const deliveryDateObject = new Date(deliveryDate);

	const newBid = {
		supplier: req.supplier._id,
		offerPrice,
		notes,
		deliveryDate: deliveryDateObject,
	};

	supplyRequest.bids.push(newBid);
	await supplyRequest.save();

	const responseData = supplyRequest.toObject();
	responseData.bid = supplyRequest.bids.find(
		(bid) => bid.supplier.toString() === req.supplier._id.toString()
	);
	delete responseData.bids;

	res.status(201).json({ success: true, data: supplyRequest });
});

const assignSupplierToRequest = catchAsyncErrors(async (req, res, next) => {
	const { supplierId } = req.body;
	let supplyRequest = await SupplyRequest.findById(req.params.id);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	if (supplyRequest.status !== "Open") {
		return next(
			new ErrorHandler("This request is already closed or Assigned", 400)
		);
	}

	if (new Date() < new Date(supplyRequest.applicationDeadline)) {
		return next(
			new ErrorHandler("This request's deadline is not yet passed", 400)
		);
	}

	if (
		!supplyRequest.bids.some(
			(bid) => bid.supplier.toString() === supplierId.toString()
		)
	) {
		return next(
			new ErrorHandler("This supplier has not bid on the request", 400)
		);
	}

	const supplier = await Supplier.findById(supplierId);

	if (!supplier) {
		return next(
			new ErrorHandler("Supplier not found with given supplier id", 404)
		);
	}

	supplier.supplyCount++;
	supplyRequest.assignedSupplier = supplierId;
	supplyRequest.status = "Assigned";

	await supplyRequest.save();
	await supplier.save();

	res.status(200).json({ success: true, data: supplyRequest });
});

const updateBid = catchAsyncErrors(async (req, res, next) => {
	const { offerPrice, notes, deliveryDate } = req.body;
	const supplyRequest = await SupplyRequest.findById(req.params.id);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found!", 404));
	}

	if (
		supplyRequest.status !== "Open" ||
		new Date() > new Date(supplyRequest.applicationDeadline)
	) {
		return next(new ErrorHandler("Bidding is closed cannot update bid", 400));
	}

	const bidIndex = supplyRequest.bids.findIndex(
		(bid) => bid.supplier.toString() === req.supplier._id.toString()
	);

	if (bidIndex === -1) {
		return next(
			new ErrorHandler("You have not placed a bid on this request", 400)
		);
	}

	supplyRequest.bids[bidIndex].offerPrice = offerPrice;
	supplyRequest.bids[bidIndex].notes = notes;
	supplyRequest.bids[bidIndex].deliveryDate = deliveryDate;

	await supplyRequest.save();

	const responseData = supplyRequest.toObject();
	responseData.bid = supplyRequest.bids[bidIndex];
	delete responseData.bids;

	res.status(200).json({
		success: true,
		data: responseData,
	});
});

const deleteBid = catchAsyncErrors(async (req, res, next) => {
	const supplyRequest = await SupplyRequest.findById(req.params.id);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found!", 404));
	}

	if (
		supplyRequest.status !== "Open" ||
		new Date() > new Date(supplyRequest.applicationDeadline)
	) {
		return next(new ErrorHandler("Bidding is closed; cannot retract bid", 400));
	}

	const bid = supplyRequest.bids.find(
		(bid) => bid.supplier.toString() === req.supplier._id.toString()
	);

	if (!bid) {
		return next(
			new ErrorHandler("You have not placed a bid on this request", 400)
		);
	}

	await SupplyRequest.findByIdAndUpdate(
		req.params.id,
		{ $pull: { bids: { _id: bid._id } } },
		{ new: true }
	);

	res.status(200).json({
		success: true,
		message: "Bid retracted successfully",
	});
});

const confirmDelivery = catchAsyncErrors(async (req, res, next) => {
	const supplyRequest = await SupplyRequest.findById(req.params.id).populate(
		"assignedSupplier",
		"name email"
	);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request not found", 404));
	}

	if (supplyRequest.status !== "Assigned") {
		return next(
			new ErrorHandler("Only assigned requests can be confirmed", 400)
		);
	}

	if (supplyRequest.deliveredAt) {
		return next(
			new ErrorHandler("This request has already been confirmed", 400)
		);
	}

	// Find assigned supplier's bid to get their delivery date
	const assignedBid = supplyRequest.bids.find(
		(bid) =>
			bid.supplier.toString() === supplyRequest.assignedSupplier._id.toString()
	);

	if (!assignedBid) {
		return next(
			new ErrorHandler(
				"No bid found for the assigned supplier — cannot confirm delivery",
				400
			)
		);
	}

	const supplyBudget = await Budget.findOne({
		user: req.user._id,
		month: new Date().getMonth() + 1,
		year: new Date().getFullYear(),
	});

	if (!supplyBudget) {
		return next(
			new ErrorHandler("Budget not assigned for this month yet!", 400)
		);
	}

	if (supplyBudget.remainingAmount < assignedBid.offerPrice) {
		return next(new ErrorHandler("Budget is not Sufficient", 400));
	}

	supplyBudget.remainingAmount -= assignedBid.offerPrice;

	const deliveredAt = new Date();
	const onTime = deliveredAt <= new Date(assignedBid.deliveryDate);

	supplyRequest.deliveredAt = deliveredAt;
	supplyRequest.onTime = onTime;
	supplyRequest.status = "Closed";

	await supplyRequest.save();
	await supplyBudget.save();

	res.status(200).json({
		success: true,
		message: "Delivery confirmed and request closed successfully",
		data: { ...supplyRequest },
	});
});

const rejectDelivery = catchAsyncErrors(async (req, res, next) => {
	const supplyRequest = await SupplyRequest.findById(req.params.id).populate(
		"assignedSupplier",
		"name email"
	);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request not found", 404));
	}

	if (supplyRequest.status !== "Assigned") {
		return next(
			new ErrorHandler("Only assigned requests can be rejected", 400)
		);
	}

	if (supplyRequest.deliveredAt) {
		return next(
			new ErrorHandler(
				"This request has already been confirmed as delivered",
				400
			)
		);
	}

	const supplier = await Supplier.findById(supplyRequest.assignedSupplier._id);

	if (!supplier) {
		return next(
			new ErrorHandler("Supplier not found with given supplier id", 404)
		);
	}

	supplier.failedSupplyCount++;
	supplyRequest.status = "Rejected";

	await supplyRequest.save();
	await supplier.save();

	res.status(200).json({
		success: true,
		message: "Delivery rejected successfully",
		data: { ...supplyRequest },
	});
});

module.exports = {
	createSupplyRequest,
	getAllSupplyRequests,
	getSupplyRequestById,
	getSupplyRequestByIdByAdmin,
	updateSupplyRequest,
	addBidToRequest,
	assignSupplierToRequest,
	deleteSupplyRequest,
	updateBid,
	deleteBid,
	confirmDelivery,
	rejectDelivery,
};
