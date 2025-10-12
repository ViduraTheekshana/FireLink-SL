const SupplyRequest = require("../models/SupplyRequest");
const Supplier = require("../models/Supplier");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const getSupplyRequestsTrend = catchAsyncErrors(async (req, res) => {
	const { range, year: yearQuery, supplier, category, status } = req.query;
	const now = new Date();

	let startDate, endDate;

	switch (range) {
		case "last30days":
			endDate = now;
			startDate = new Date();
			startDate.setDate(now.getDate() - 30);
			break;

		case "lastQuarter":
			endDate = now;
			startDate = new Date();
			startDate.setMonth(now.getMonth() - 3);
			break;

		case "lastYear":
			endDate = now;
			startDate = new Date(
				now.getFullYear() - 1,
				now.getMonth(),
				now.getDate()
			);
			break;

		default: {
			const year = parseInt(yearQuery) || now.getFullYear();
			startDate = new Date(`${year}-01-01`);
			endDate = new Date(`${year}-12-31`);
		}
	}

	const filter = {
		createdAt: { $gte: startDate, $lte: endDate },
	};

	if (supplier) filter.supplier = supplier;
	if (category) filter.category = category;
	if (status) filter.status = status;

	const requests = await SupplyRequest.find(filter).select("createdAt");

	const allMonths = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	if (range === "last30days") {
		const days = Array(30).fill(0);
		for (const req of requests) {
			const diffDays = Math.floor(
				(now - req.createdAt) / (1000 * 60 * 60 * 24)
			);
			if (diffDays >= 0 && diffDays < 30) {
				days[29 - diffDays]++;
			}
		}

		const result = days.map((count, i) => ({
			name: `${30 - i}d ago`,
			requests: count,
		}));

		return res.status(200).json({ success: true, data: result });
	}

	const maxMonth =
		endDate.getFullYear() === now.getFullYear() ? now.getMonth() + 1 : 12;

	const trend = Array(maxMonth).fill(0);
	for (const req of requests) {
		const month = req.createdAt.getMonth(); // 0–11
		if (month < maxMonth) trend[month]++;
	}

	const result = allMonths.slice(0, maxMonth).map((m, i) => ({
		name: m,
		requests: trend[i],
	}));

	res.status(200).json({ success: true, data: result });
});

const getAlerts = catchAsyncErrors(async (req, res) => {
	let alerts = [];

	// Requests that have passed their deadline but are still open
	const overdueRequests = await SupplyRequest.find({
		status: "Open",
		applicationDeadline: { $lt: new Date() },
	}).populate("assignedSupplier", "name");

	overdueRequests.forEach((req) => {
		alerts.push({
			type: "overdue",
			message: `Request "${
				req.title
			}" has passed its application deadline (${req.applicationDeadline.toDateString()}) and is still open.`,
			severity: "high",
		});
	});

	// Requests with no assigned supplier and deadline approaching (e.g. within 3 days)
	const soonDue = await SupplyRequest.find({
		status: "Open",
		assignedSupplier: null,
		applicationDeadline: {
			$gte: new Date(),
			$lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // next 3 days
		},
	});

	soonDue.forEach((req) => {
		alerts.push({
			type: "not-assigned",
			message: `Request "${
				req.title
			}" deadline is approaching on ${req.applicationDeadline.toDateString()} and no supplier is assigned yet.`,
			severity: "medium",
		});
	});

	// Overdue Deliveries: bids with delivery dates that have passed but request still Open
	const overdueDeliveries = await SupplyRequest.aggregate([
		{ $unwind: "$bids" },
		{
			$match: {
				status: "Open",
				"bids.deliveryDate": { $lt: new Date() }, // delivery date already passed
			},
		},
		{
			$lookup: {
				from: "suppliers",
				localField: "bids.supplier",
				foreignField: "_id",
				as: "supplier",
			},
		},
		{ $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },
		{
			$project: {
				title: 1,
				"supplier.name": 1,
				"bids.deliveryDate": 1,
			},
		},
	]);

	overdueDeliveries.forEach((req) => {
		alerts.push({
			type: "overdue",
			message: `${
				req.supplier?.name || "A supplier"
			} has missed the delivery date (${new Date(
				req.bids.deliveryDate
			).toDateString()}) for request "${req.title}".`,
			severity: "high",
		});
	});

	res.status(200).json({ success: true, data: alerts });
});

const getDashboardStats = catchAsyncErrors(async (req, res) => {
	const now = new Date();
	const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

	const [
		totalRequests,
		totalSuppliers,
		activeRequests,
		overdueRequests,
		allRequests,
	] = await Promise.all([
		SupplyRequest.countDocuments(),
		Supplier.countDocuments(),
		SupplyRequest.countDocuments({ status: { $in: ["Open", "Assigned"] } }),
		SupplyRequest.countDocuments({
			status: { $in: ["Open", "Assigned"] },
			applicationDeadline: { $lt: new Date() },
		}),
		SupplyRequest.find(),
	]);

	// Average bids per request
	const totalBids = allRequests.reduce(
		(sum, req) => sum + (req.bids?.length || 0),
		0
	);
	const avgBidsPerRequest = allRequests.length
		? parseFloat((totalBids / allRequests.length).toFixed(1))
		: 0;

	const [
		lastMonthRequests,
		lastMonthSuppliers,
		lastMonthActive,
		lastMonthOverdue,
		lastMonthReqs,
	] = await Promise.all([
		SupplyRequest.countDocuments({
			createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
		}),
		Supplier.countDocuments({
			createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
		}),
		SupplyRequest.countDocuments({
			status: { $in: ["Open", "Assigned"] },
			createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
		}),
		SupplyRequest.countDocuments({
			status: { $in: ["Open", "Assigned"] },
			applicationDeadline: { $lt: lastMonthEnd },
			createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
		}),
		SupplyRequest.find({
			createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
		}),
	]);

	const lastMonthTotalBids = lastMonthReqs.reduce(
		(sum, req) => sum + (req.bids?.length || 0),
		0
	);
	const lastMonthAvgBids = lastMonthReqs.length
		? parseFloat((lastMonthTotalBids / lastMonthReqs.length).toFixed(1))
		: 0;

	const calcGrowth = (curr, prev) => {
		if (!prev || prev === 0) return curr > 0 ? "+100" : "0";
		const growth = ((curr - prev) / prev) * 100;
		return growth > 0 ? "+" + growth.toFixed(1) : growth.toFixed(1);
	};

	const categoryColors = {
		Equipment: "#3B82F6",
		"Medical Supplies": "#10B981",
		Uniforms: "#6366F1",
		"Vehicle Maintenance": "#8B5CF6",
		Services: "#EC4899",
		Other: "#F59E0B",
	};

	const categoryBreakdown = (
		await SupplyRequest.aggregate([
			{ $group: { _id: "$category", value: { $sum: 1 } } },
			{ $project: { _id: 0, name: "$_id", value: 1 } },
		])
	).map((cat) => ({
		...cat,
		color: categoryColors[cat.name] || "#9CA3AF",
	}));

	const topSuppliers = await SupplyRequest.aggregate([
		{
			$match: {
				assignedSupplier: { $ne: null },
				deliveredAt: { $exists: true },
			},
		},
		{
			$group: {
				_id: "$assignedSupplier",
				requests: { $push: "$$ROOT" },
			},
		},
		{
			$project: {
				supplyCount: { $size: "$requests" },
				failedSupplyCount: {
					$size: {
						$filter: {
							input: "$requests",
							as: "r",
							cond: { $eq: ["$$r.onTime", false] },
						},
					},
				},
				onTimeRate: {
					$multiply: [
						{
							$divide: [
								{
									$size: {
										$filter: {
											input: "$requests",
											as: "r",
											cond: { $eq: ["$$r.onTime", true] },
										},
									},
								},
								{ $size: "$requests" },
							],
						},
						100,
					],
				},
			},
		},
		{
			$lookup: {
				from: "suppliers",
				localField: "_id",
				foreignField: "_id",
				as: "supplier",
			},
		},
		{ $unwind: "$supplier" },
		{
			$project: {
				_id: 0,
				name: "$supplier.name",
				onTimeRate: { $round: ["$onTimeRate", 0] },
				completed: { $subtract: ["$supplyCount", "$failedSupplyCount"] },
			},
		},
		{ $sort: { onTimeRate: -1 } },
		{ $limit: 5 },
	]);

	res.status(200).json({
		success: true,
		data: {
			summary: {
				totalRequests: {
					value: totalRequests,
					growth: calcGrowth(totalRequests, lastMonthRequests),
				},
				totalSuppliers: {
					value: totalSuppliers,
					growth: calcGrowth(totalSuppliers, lastMonthSuppliers),
				},
				activeRequests: {
					value: activeRequests,
					growth: calcGrowth(activeRequests, lastMonthActive),
				},
				overdueRequests: {
					value: overdueRequests,
					growth: calcGrowth(overdueRequests, lastMonthOverdue),
				},
				avgBidsPerRequest: {
					value: avgBidsPerRequest,
					growth: calcGrowth(avgBidsPerRequest, lastMonthAvgBids),
				},
			},
			categoryBreakdown,
			topSuppliers,
		},
	});
});

const procurementKpi = catchAsyncErrors(async (req, res) => {
	const { range } = req.query;
	const now = new Date();
	let startDate;

	switch (range) {
		case "last30days":
			startDate = new Date(now);
			startDate.setDate(now.getDate() - 30);
			break;

		case "lastQuarter":
			const currentMonth = now.getMonth();
			const currentQuarter = Math.floor(currentMonth / 3);
			startDate = new Date(now.getFullYear(), currentQuarter * 3 - 3, 1);
			break;

		case "lastYear":
			startDate = new Date(now.getFullYear() - 1, 0, 1);
			break;

		default:
			startDate = new Date(now);
			startDate.setDate(now.getDate() - 30);
	}

	const dateFilter = { createdAt: { $gte: startDate } };

	const [totalRequests, openRequests, closedRequests, overdueRequests] =
		await Promise.all([
			SupplyRequest.countDocuments(dateFilter),
			SupplyRequest.countDocuments({ ...dateFilter, status: "Open" }),
			SupplyRequest.countDocuments({ ...dateFilter, status: "Closed" }),
			SupplyRequest.countDocuments({
				...dateFilter,
				status: "Open",
				applicationDeadline: { $lt: now },
			}),
		]);

	const kpiData = {
		totalRequests,
		openRequests,
		closedRequests,
		overdueRequests,
	};

	res.status(200).json({
		success: true,
		data: kpiData,
	});
});

module.exports = {
	getSupplyRequestsTrend,
	getDashboardStats,
	getAlerts,
	procurementKpi,
};
