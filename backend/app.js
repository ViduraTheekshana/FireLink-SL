const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const UserController = require("./controllers/UserManagement/UserController.js");

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
app.use(cors());


// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes uer management
const userRouter = require("./routes/UserManagement/UserRoute.js");
const civilianAuthRoutes = require("./routes/UserManagement/civilianRoutes.js");


const missionRoutes = require("./routes/missionRoutes");
const preventionCertificateRoutes = require("./routes/preventionCertificateRoutes");

// Inventory routes
const inventoryRoutes = require("./routes/inventoryRoutes");
const inventoryReorderRoutes = require("./routes/inventoryReorderRoutes");
const inventoryVehicleItemsRoutes = require("./routes/inventoryVehicleItemsRoutes");
const inventoryVehicleRoutes = require("./routes/inventoryVehicleRoutes");
const inventoryLogRoutes = require("./routes/inventoryLogRoutes");

// Mount routes
app.use("/users", userRouter);
//app.use("/api/v1/civilian-auth", civilianAuthRoutes);
//app.use("/api/v1/missions", missionRoutes);
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
app.use("/firstaff", userRouter); // This should handle addUsers


// Staff login endpoint

app.post("/stafflogin", UserController.staffLogin); // Login route



module.exports = app;
