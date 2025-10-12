const dotenv = require("dotenv");

// Load environment variables from config.env
dotenv.config({ path: './config/config.env' });

const app = require("./app");
const connectDatabase = require("./config/database");

// handle uncaught exceptions
process.on("uncaughtException", (err) => {
	console.log(`ERROR: ${err.message}`);
	console.log("shutting down server due to uncaught exeption");
	process.exit(1);
});


// Check if required environment variables are set
if (!process.env.PORT) {
	console.error("ERROR: PORT environment variable is not set");
	process.exit(1);
}

if (!process.env.DB_URI) {
	console.error("ERROR: DB_URI environment variable is not set");
	process.exit(1);
}

// connecting to database
connectDatabase();

const server = app.listen(process.env.PORT, () => {
	console.log(
		`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
	);
});

// handle unhadled promise rejection
process.on("unhandledRejection", (err) => {
	console.log(`ERROR: ${err.message}`);
	console.log(`shutting down the server due to unhandled promise rejection.`);
	server.close(() => {
		process.exit(1);
	});
});
