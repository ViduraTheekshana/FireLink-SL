const express = require("express");
const cors = require("cors");
const app = express();

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const errorMiddleware = require("./middlewares/errors");

// setting up config file
dotenv.config({ path: "config/config.env" });

// cors
app.use(
	cors({
		origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5180"], // allow all dev ports
		credentials: true,
	})
);

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// import all routes
const auth = require("./routes/authRoutes");
const civilianAuth = require("./routes/civilianAuthRoutes");
const mission = require("./routes/missionRoutes");
const userManagement = require("./routes/userManagementRoutes");
const preventionCertificateRoutes = require("./routes/preventionCertificateRoutes"); 
const preventionOfficerRoutes = require("./routes/preventionOfficerRoutes");

// mount routes
app.use("/api/v1/auth", auth);
app.use("/api/v1/civilian-auth", civilianAuth);
app.use("/api/v1/missions", mission);
app.use("/api/v1/users", userManagement);

app.use("/api/inventory", require("./routes/inventoryRoutes"));

app.use(
	"/api/inventory-reorders",
	require("./routes/inventoryReorderRoutes")
);

app.use(
	"/api/inventory-vehicle-items",
	require("./routes/inventoryVehicleItemsRoutes")
);

app.use(
	"/api/inventory-vehicles",
	require("./routes/inventoryVehicleRoutes")
);

app.use("/api/inventory-logs", require("./routes/inventoryLogRoutes"));
app.use("/api/v1/shifts", require("./routes/shiftRoutes"));
app.use("/api/v1/trainings", require("./routes/trainingRoutes"));
app.use("/api/v1/vehicles", require("./routes/vehicleRoutes"));
app.use(
	"/api/v1/shift-change-requests",
	require("./routes/shiftChangeRequestRoutes")
);
app.use("/api/v1/supplier", require("./routes/supplierRoutes"));
app.use("/api/v1/messages", require("./routes/messageRoutes"));

// Prevention certificate route
app.use("/api/prevention/certificates", preventionCertificateRoutes); 
app.use("/api/prevention-officer", preventionOfficerRoutes);

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
