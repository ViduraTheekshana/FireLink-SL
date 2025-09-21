const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../../models/UserManagement/UserReg"); // UserReg.js schema
const bcrypt = require("bcryptjs");

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId, userType: 'civilian' }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXP,
  });

  const refreshToken = jwt.sign({ userId, userType: 'civilian' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXP,
  });

  return { accessToken, refreshToken };
};

// Register civilian
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { name, gmail, password, phone, age, address } = req.body;

    const existingUser = await User.findOne({ gmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      gmail,
      password: hashedPassword,
      phone,
      age,
      address,
      userType: 'civilian',
      isActive: true
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ success: true, message: "Civilian account created successfully", data: { user, accessToken } });

  } catch (error) {
    console.error('Civilian registration error:', error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Login civilian
exports.login = async (req, res) => {
  try {
    const { gmail, password } = req.body;

    const user = await User.findOne({ gmail });

    if (!user || user.userType !== 'civilian') {
      return res.status(401).json({ success: false, message: "Invalid email or access denied" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "Account deactivated. Contact support." });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, message: "Login successful", data: { user, accessToken } });

  } catch (error) {
    console.error('Civilian login error:', error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'civilian') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user || user.userType !== 'civilian') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.json({ success: true, message: "Profile updated successfully", data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { gmail } = req.body;

    const user = await User.findOne({ gmail });

    if (!user || user.userType !== 'civilian') {
      return res.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
    }

    const resetToken = jwt.sign({ userId: user._id, type: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log(`Password reset link for ${gmail}: http://localhost:5173/civilian-reset-password?token=${resetToken}`);

    res.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
      resetLink: `http://localhost:5173/civilian-reset-password?token=${resetToken}`
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ success: false, message: "Invalid reset token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.userType !== 'civilian') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully" });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken');
    res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
