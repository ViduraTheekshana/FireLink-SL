const express = require("express");
const cors = require("cors");
const app = express();

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// Load environment variables
dotenv.config({ path: "config/config.env" });

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const civilianAuthRoutes = require("./routes/civilianAuthRoutes");
const missionRoutes = require("./routes/missionRoutes");
const preventionCertificateRoutes = require("./routes/preventionCertificateRoutes");

// Inventory routes
const inventoryRoutes = require("./routes/inventoryRoutes");
const inventoryReorderRoutes = require("./routes/inventoryReorderRoutes");
const inventoryVehicleItemsRoutes = require("./routes/inventoryVehicleItemsRoutes");
const inventoryVehicleRoutes = require("./routes/inventoryVehicleRoutes");
const inventoryLogRoutes = require("./routes/inventoryLogRoutes");

// Mount routes
app.use("/api/v1/auth", authRoutes);
//app.use("/api/v1/civilian-auth", civilianAuthRoutes);
app.use("/api/v1/missions", missionRoutes);
//app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory-reorders", inventoryReorderRoutes);
app.use("/api/inventory-vehicle-items", inventoryVehicleItemsRoutes);
app.use("/api/inventory-vehicles", inventoryVehicleRoutes);
app.use("/api/inventory-logs", inventoryLogRoutes);

// Prevention certificate route
app.use("/api/prevention/certificates", preventionCertificateRoutes);

// Minimal error handling for now (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

module.exports = app;
