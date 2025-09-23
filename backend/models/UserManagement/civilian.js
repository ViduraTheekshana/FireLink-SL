// models/Civilian.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const civilianSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, minlength: 8 },
  phoneNumber: { type: String },
  address: { type: String },
  googleId: { type: String }, // for Google login
}, { timestamps: true });

// Hash password before save
civilianSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

civilianSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Civilian", civilianSchema);
