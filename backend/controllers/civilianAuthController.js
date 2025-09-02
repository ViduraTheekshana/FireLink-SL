const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");

// Generate JWT tokens for civilians
const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId, userType: 'civilian' }, process.env.JWT_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXP,
	});

	const refreshToken = jwt.sign({ userId, userType: 'civilian' }, process.env.JWT_REFRESH_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXP,
	});

	return { accessToken, refreshToken };
};

// Register new civilian
exports.register = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { firstName, lastName, email, username, password, phoneNumber, address } = req.body;

		// Check if user already exists by email
		const existingUserByEmail = await User.findOne({ email });
		if (existingUserByEmail) {
			return res.status(400).json({
				success: false,
				message: "User with this email already exists",
			});
		}

		// Check if username already exists
		const existingUserByUsername = await User.findOne({ username });
		if (existingUserByUsername) {
			return res.status(400).json({
				success: false,
				message: "Username already exists",
			});
		}

		// Get civilian role (create if doesn't exist)
		let civilianRole = await Role.findOne({ name: 'civilian' });
		if (!civilianRole) {
			civilianRole = await Role.create({
				name: 'civilian',
				displayName: 'Civilian',
				description: 'Regular civilian user',
				permissions: [
					'view_public_info',
					'report_incidents',
					'request_services',
					'view_safety_info'
				],
				level: 1
			});
		}

		// Create new civilian user
		const user = await User.create({
			name: `${firstName} ${lastName}`,
			email,
			username,
			password,
			roles: [civilianRole._id],
			phoneNumber,
			address: {
				street: address,
				city: '',
				state: '',
				zipCode: '',
				country: 'USA'
			},
			personalInfo: {
				dateOfBirth: '',
				gender: '',
				bloodType: '',
				height: 0,
				weight: 0
			},
			userType: 'civilian',
			isActive: true
		});

		// Generate tokens
		const { accessToken, refreshToken } = generateTokens(user._id);

		// Set refresh token in cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		});

		res.status(201).json({
			success: true,
			message: "Civilian account created successfully",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					userType: user.userType,
					roles: user.roles
				},
				accessToken
			}
		});

	} catch (error) {
		console.error('Civilian registration error:', error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message
		});
	}
};

// Login civilian
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({ email }).populate('roles', 'name displayName');
		
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		// Check if user is a civilian
		const isCivilian = user.roles.some(role => role.name === 'civilian');
		if (!isCivilian) {
			return res.status(401).json({
				success: false,
				message: "Access denied. This is a civilian-only portal.",
			});
		}

		// Check if user is active
		if (!user.isActive) {
			return res.status(401).json({
				success: false,
				message: "Account is deactivated. Please contact support.",
			});
		}

		// Verify password
		const isPasswordValid = await user.matchPassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		// Generate tokens
		const { accessToken, refreshToken } = generateTokens(user._id);

		// Set refresh token in cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		});

		res.json({
			success: true,
			message: "Login successful",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					userType: user.userType,
					roles: user.roles
				},
				accessToken
			}
		});

	} catch (error) {
		console.error('Civilian login error:', error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message
		});
	}
};

// Google OAuth login
exports.googleLogin = async (req, res) => {
	try {
		const { OAuth2Client } = require('google-auth-library');
		
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { credential } = req.body;

		if (!credential) {
			return res.status(400).json({
				success: false,
				message: "Google credential is required",
			});
		}

		// Verify the Google ID token
		const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
		
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const { sub: googleId, email, name, given_name: firstName, family_name: lastName, picture } = payload;

		if (!email) {
			return res.status(400).json({
				success: false,
				message: "Email not provided by Google",
			});
		}

		// Check if user already exists by email
		let user = await User.findOne({ email });

		if (user) {
			// User exists, update Google info if needed
			if (!user.googleId) {
				user.googleId = googleId;
				if (picture) user.profilePicture = picture;
				await user.save();
			}
		} else {
			// Get civilian role (create if doesn't exist)
			let civilianRole = await Role.findOne({ name: 'civilian' });
			if (!civilianRole) {
				civilianRole = await Role.create({
					name: 'civilian',
					displayName: 'Civilian',
					description: 'Civilian user with basic access',
					permissions: [
						'view_profile',
						'update_profile',
						'view_public_services'
					],
					level: 1
				});
			}

			// Generate a unique username from email
			let username = email.split('@')[0];
			let existingUsername = await User.findOne({ username });
			let counter = 1;
			
			while (existingUsername) {
				username = `${email.split('@')[0]}${counter}`;
				existingUsername = await User.findOne({ username });
				counter++;
			}

			// Create new user with Google info
			user = await User.create({
				name: name || `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
				email,
				username,
				googleId,
				profilePicture: picture || '',
				roles: [civilianRole._id],
				userType: 'civilian',
				isActive: true,
				// Google users don't need a password for regular login
				password: 'google-oauth-' + Math.random().toString(36).substring(7),
				phoneNumber: '0000000000', // Placeholder - user can update later
				address: {
					street: '',
					city: '',
					state: '',
					zipCode: '',
					country: 'USA'
				},
				personalInfo: {
					dateOfBirth: '',
					gender: '',
					bloodType: '',
					height: 0,
					weight: 0
				}
			});
		}

		// Generate tokens
		const { accessToken, refreshToken } = generateTokens(user._id);

		// Set refresh token in cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(200).json({
			success: true,
			message: "Google authentication successful",
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				profilePicture: user.profilePicture,
				roles: user.roles,
				userType: user.userType
			},
			accessToken,
		});

	} catch (error) {
		console.error('Google login error:', error);
		
		if (error.message && error.message.includes('Invalid token')) {
			return res.status(401).json({
				success: false,
				message: "Invalid Google token",
			});
		}

		res.status(500).json({
			success: false,
			message: "Server error during Google authentication",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};

// Get civilian profile
exports.getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).populate('roles', 'name displayName');
		
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Check if user is a civilian
		const isCivilian = user.roles.some(role => role.name === 'civilian');
		if (!isCivilian) {
			return res.status(403).json({
				success: false,
				message: "Access denied",
			});
		}

		res.json({
			success: true,
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					phoneNumber: user.phoneNumber,
					address: user.address,
					userType: user.userType,
					roles: user.roles,
					createdAt: user.createdAt
				}
			}
		});

	} catch (error) {
		console.error('Get civilian profile error:', error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message
		});
	}
};

// Update civilian profile
exports.updateProfile = async (req, res) => {
	try {
		const { name, phoneNumber, address } = req.body;
		
		const user = await User.findById(req.user.userId);
		
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Check if user is a civilian
		const isCivilian = user.roles.some(role => role.name === 'civilian');
		if (!isCivilian) {
			return res.status(403).json({
				success: false,
				message: "Access denied",
			});
		}

		// Update user fields
		if (name) user.name = name;
		if (phoneNumber) user.phoneNumber = phoneNumber;
		if (address) user.address.street = address;

		await user.save();

		res.json({
			success: true,
			message: "Profile updated successfully",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					phoneNumber: user.phoneNumber,
					address: user.address,
					userType: user.userType
				}
			}
		});

	} catch (error) {
		console.error('Update civilian profile error:', error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message
		});
	}
};

// Forgot password
exports.forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		// Find user by email
		const user = await User.findOne({ email }).populate('roles', 'name');
		
		if (!user) {
			// For security, don't reveal if email exists or not
			return res.json({
				success: true,
				message: "If an account with that email exists, a password reset link has been sent."
			});
		}

		// Check if user is a civilian
		const isCivilian = user.roles.some(role => role.name === 'civilian');
		if (!isCivilian) {
			// For security, don't reveal if email exists or not
			return res.json({
				success: true,
				message: "If an account with that email exists, a password reset link has been sent."
			});
		}

		// Generate reset token
		const resetToken = jwt.sign(
			{ userId: user._id, type: 'password_reset' },
			process.env.JWT_SECRET,
			{ expiresIn: '1h' }
		);

		// Store reset token in user document (you might want to create a separate collection for this)
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
		await user.save();

		// TODO: Send email with reset link
		// For now, we'll just log the token (in production, send via email)
		console.log(`Password reset token for ${email}: ${resetToken}`);
		console.log(`Reset link: http://localhost:5173/civilian-reset-password?token=${resetToken}`);

		res.json({
			success: true,
			message: "If an account with that email exists, a password reset link has been sent.",
			// Remove this in production - only for development
			resetLink: `http://localhost:5173/civilian-reset-password?token=${resetToken}`
		});

	} catch (error) {
		console.error('Forgot password error:', error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message
		});
	}
};

// Reset password
exports.resetPassword = async (req, res) => {
	try {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Token and new password are required"
			});
		}

		// Verify token
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (error) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired reset token"
			});
		}

		// Check if token is for password reset
		if (decoded.type !== 'password_reset') {
			return res.status(400).json({
				success: false,
				message: "Invalid reset token"
			});
		}

		// Find user
		const user = await User.findById(decoded.userId);
		if (!user) {
			return res.status(400).json({
				success: false,
				message: "User not found"
			});
		}

		// Check if user is a civilian
		const isCivilian = user.roles.some(role => role.name === 'civilian');
		if (!isCivilian) {
			return res.status(403).json({
				success: false,
				message: "Access denied"
			});
		}

		// Check if reset token matches and is not expired
		if (user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired reset token"
			});
		}

		// Update password
		user.password = newPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		res.json({
			success: true,
			message: "Password has been reset successfully"
		});

	} catch (error) {
		console.error('Reset password error:', error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message
		});
	}
};

// Logout civilian
exports.logout = async (req, res) => {
	try {
		// Clear refresh token cookie
		res.clearCookie('refreshToken');
		
		res.json({
			success: true,
			message: "Logout successful"
		});

	} catch (error) {
		console.error('Civilian logout error:', error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message
		});
	}
};
