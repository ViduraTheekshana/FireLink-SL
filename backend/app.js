const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

const UserController = require("./controllers/UserManagement/UserController.js");

const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config/config.env" });

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(express.json());

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

// Staff login endpoint


// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes



// Mount routes

// Prevention certificate route

// Minimal error handling for now (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});



module.exports = app;

