const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const errorMiddleware = require("./middlewares/errors");

// setting up config file
dotenv.config({ path: "config/config.env" });

// cors
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
const mission = require("./routes/missionRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const preventionCertificateRoutes = require("./routes/preventionCertificateRoutes"); 

// mount routes
app.use("/api/v1/missions", mission);
app.use("/api/v1/salaries", salaryRoutes);

app.use("/api/inventory", require("./routes/inventoryRoutes"));

app.use("/api/inventory-reorders", require("./routes/inventoryReorderRoutes"));

app.use(
	"/api/inventory-vehicle-items",
	require("./routes/inventoryVehicleItemsRoutes")
);

app.use("/api/inventory-vehicles", require("./routes/inventoryVehicleRoutes"));

app.use("/api/inventory-logs", require("./routes/inventoryLogRoutes"));

app.use("/api/v1/supplier", require("./routes/supplierRoutes"));
app.use("/api/v1/supply-requests", require("./routes/supplyRequestRoutes"));

// Prevention certificate route
app.use("/api/prevention/certificates", preventionCertificateRoutes);

// Middleware to handle errors
app.use(errorMiddleware);

// Register schemas BEFORE routes
require("./models/UserManagement/Attendance.js"); // Attendance schema
require("./models/UserManagement/UserReg.js");    // User schema

// Routes
const userRouter = require("./routes/UserManagement/UserRoute.js");
const sessionRouter = require("./routes/UserManagement/TrainingSessionRoute.js");
const attendanceRouter = require("./routes/UserManagement/AttendanceRoute.js");


app.use("/sessions", sessionRouter);
app.use("/attendance", attendanceRouter);

console.log("DB_URI from env:", process.env.DB_URI);

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => console.log(`MongoDB connected: ${con.connection.host}`))
  .catch((err) => console.error("Database connection error:", err));
 
  app.get("/", (req, res) => {
  res.send("Fire Handling System API running");
});

  // User Registration endpoint
app.use("/users", userRouter);

// covi login endpoint
const civilianAuthRoutes = require("./routes/UserManagement/civilianAuthRoutes.js");
app.use("/api/v1/civilian-auth", civilianAuthRoutes);





module.exports = app;
