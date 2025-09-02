const mongoose = require("mongoose");

// Set strictQuery to false to suppress deprecation warning
mongoose.set('strictQuery', false);

const connectDatabase = () => {
	mongoose
		.connect(process.env.DB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then((con) => {
			console.log(
				`MongoDB Database connected with host: ${con.connection.host}`
			);
		})
		.catch((err) => {
			console.error('Database connection error:', err.message);
			process.exit(1);
		});
};

module.exports = connectDatabase;
