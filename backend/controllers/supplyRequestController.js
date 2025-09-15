const SupplyRequest = require("../models/supplyRequest");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const generateId = require("../utils/generateUniqueId");

const createSupplyRequest = catchAsyncErrors(async (req, res) => {
	const { title, description, category, quantity, applicationDeadline, unit } =
		req.body;

	const createdBy = req.user.id;

	const id = generateId("req");

	const public = req.user.roles.some((role) => role.name === "supply_manager");

	const supplyRequest = await SupplyRequest.create({
		title,
		description,
		category,
		quantity,
		applicationDeadline,
		createdBy,
		id,
		public,
		unit,
	});

	res.status(201).json({
		success: true,
		data: supplyRequest,
	});
});

const getAllSupplyRequests = catchAsyncErrors(async (req, res) => {
	let query = {};

	if (req.query.category) {
		query.category = req.query.category;
	}
	if (req.query.status) {
		query.status = req.query.status;
	}

	// Made only supply_manager can see every request other insiders can see only requests made by them
	// suppliers only can see public requests
	if (
		req.user &&
		!req.user.roles.some((role) => role.name === "supply_manager")
	) {
		query.createdBy = req.user._id;
	}
	if (req.supplier) {
		query.public = true;
		query.status = "Open";
	}

	const supplyRequests = await SupplyRequest.find(query)
		// .populate("createdBy", "name email")
		.sort({ createdAt: -1 });

	res.status(200).json({
		success: true,
		count: supplyRequests.length,
		data: supplyRequests,
	});
});

const getSupplyRequestById = catchAsyncErrors(async (req, res) => {
	const supplyRequest = await SupplyRequest.findOne({
		_id: req.params.id,
		public: true,
	});

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	res.status(200).json({
		success: true,
		data: supplyRequest,
	});
});

const getSupplyRequestByIdByAdmin = catchAsyncErrors(async (req, res) => {
	const supplyRequest = await SupplyRequest.findById(req.params.id)
		.populate("createdBy", "name email")
		.populate("assignedSupplier", "name email phone")
		.populate("bids.supplier", "name email");

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	if (!supplyRequest.createdBy === req.user._id) {
		return next(new ErrorHandler("You don't own this Request", 403));
	}

	res.status(200).json({
		success: true,
		data: supplyRequest,
	});
});

const updateSupplyRequest = catchAsyncErrors(async (req, res) => {
	const {
		title,
		description,
		category,
		quantity,
		applicationDeadline,
		unit,
		public,
	} = req.body;

	let supplyRequest = await SupplyRequest.findById(req.params.id);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	if (
		!req.user.roles.some((role) => role.name === "supply_manager") &&
		supplyRequest.createdBy.toString() !== req.user.id
	) {
		return next(new ErrorHandler("You don't own this Request", 403));
	}

	if (supplyRequest.status === "Closed") {
		return next(new ErrorHandler("Cannot update a closed request!", 400));
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
			public,
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

	if (
		!req.user.roles.some((role) => role.name === "supply_manager") &&
		!supplyRequest.createdBy === req.user.id
	) {
		return next(new ErrorHandler("You don't own this Request", 403));
	}

	if (
		!req.user.roles.some((role) => role.name === "supply_manager") &&
		supplyRequest.public === true
	) {
		return next(
			new ErrorHandler(
				"This request is Published ask supply manager to delete it",
				403
			)
		);
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

const addBidToRequest = catchAsyncErrors(async (req, res) => {
	const { offerPrice, notes } = req.body;
	const supplyRequest = await SupplyRequest.findById(req.params.id);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	if (supplyRequest.status !== "Open") {
		return next(new ErrorHandler("Bidding is closed for this request", 400));
	}

	if (new Date() > new Date(supplyRequest.applicationDeadline)) {
		return next(new ErrorHandler("The application deadline has passed", 400));
	}

	if (supplyRequest.bids.some((bid) => bid.supplier === req.supplier._id)) {
		return res.status(400).json({
			success: false,
			error: "You have already placed a bid on this request",
		});
	}

	const newBid = {
		supplier: req.supplier._id,
		offerPrice,
		notes,
	};

	supplyRequest.bids.push(newBid);
	await supplyRequest.save();

	res.status(201).json({ success: true, data: supplyRequest });
});

const assignSupplierToRequest = catchAsyncErrors(async (req, res) => {
	const { supplierId } = req.body;
	let supplyRequest = await SupplyRequest.findById(req.params.id);

	if (!supplyRequest) {
		return next(new ErrorHandler("Supply Request Not Found! ", 404));
	}

	if (supplyRequest.status === "Closed") {
		return next(new ErrorHandler("This request is already closed", 400));
	}

	if (new Date() < new Date(supplyRequest.applicationDeadline)) {
		return next(
			new ErrorHandler("This request's deadline is not yet passed", 400)
		);
	}

	if (
		!supplyRequest.bids.some((bid) => bid.supplier.toString() === supplierId)
	) {
		return next(
			new ErrorHandler("This supplier has not bid on the request", 400)
		);
	}

	supplyRequest.assignedSupplier = supplierId;
	supplyRequest.status = "Closed";
	await supplyRequest.save();

	res.status(200).json({ success: true, data: supplyRequest });
});

const updateBid = catchAsyncErrors(async (req, res, next) => {
	const { offerPrice, notes } = req.body;
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
		(bid) => bid.supplier === req.supplier._id
	);

	if (bidIndex === -1) {
		return next(
			new ErrorHandler("You have not placed a bid on this request", 404)
		);
	}

	supplyRequest.bids[bidIndex].offerPrice = offerPrice;
	supplyRequest.bids[bidIndex].notes = notes;

	await supplyRequest.save();

	res.status(200).json({
		success: true,
		data: supplyRequest.bids[bidIndex],
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
		(bid) => bid.supplier === req.supplier._id
	);

	if (!bid) {
		return next(
			new ErrorHandler("You have not placed a bid on this request", 404)
		);
	}

	await supplyRequest.save();

	res.status(200).json({
		success: true,
		message: "Bid retracted successfully",
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
};
