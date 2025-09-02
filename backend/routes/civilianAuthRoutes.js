const express = require('express');
const { body } = require('express-validator');
const {
	register,
	login,
	googleLogin,
	getProfile,
	updateProfile,
	logout,
	forgotPassword,
	resetPassword
} = require('../controllers/civilianAuthController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
	body('firstName')
		.trim()
		.notEmpty()
		.withMessage('First name is required')
		.isLength({ min: 2, max: 50 })
		.withMessage('First name must be between 2 and 50 characters')
		.matches(/^[a-zA-Z\s\.\-]{2,50}$/)
		.withMessage('First name must contain only letters, spaces, dots (.), and hyphens (-)'),
	body('lastName')
		.trim()
		.notEmpty()
		.withMessage('Last name is required')
		.isLength({ min: 2, max: 50 })
		.withMessage('Last name must be between 2 and 50 characters')
		.matches(/^[a-zA-Z\s\.\-]{2,50}$/)
		.withMessage('Last name must contain only letters, spaces, dots (.), and hyphens (-)'),
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('Please provide a valid email address'),
	body('username')
		.trim()
		.notEmpty()
		.withMessage('Username is required')
		.isLength({ min: 4, max: 20 })
		.withMessage('Username must be between 4 and 20 characters')
		.matches(/^[a-zA-Z0-9_\.]{4,20}$/)
		.withMessage('Username must contain only letters, numbers, _ and . (no spaces)'),
	body('password')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
		.withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
	body('phoneNumber')
		.trim()
		.notEmpty()
		.withMessage('Phone number is required')
		.matches(/^0\d{9}$/)
		.withMessage('Phone number must start with 0 and have exactly 10 digits'),
	body('address')
		.optional()
		.trim()
		.isLength({ max: 200 })
		.withMessage('Address must be less than 200 characters')
];

const loginValidation = [
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('Please provide a valid email address'),
	body('password')
		.notEmpty()
		.withMessage('Password is required')
];

const updateProfileValidation = [
	body('name')
		.optional()
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage('Name must be between 2 and 100 characters'),
	body('phoneNumber')
		.optional()
		.isMobilePhone()
		.withMessage('Please provide a valid phone number'),
	body('address')
		.optional()
		.trim()
		.isLength({ max: 200 })
		.withMessage('Address must be less than 200 characters')
];

const forgotPasswordValidation = [
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('Please provide a valid email address')
];

const resetPasswordValidation = [
	body('token')
		.notEmpty()
		.withMessage('Reset token is required'),
	body('newPassword')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
		.withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const googleLoginValidation = [
	body('credential')
		.notEmpty()
		.withMessage('Google credential is required')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/google-login', googleLoginValidation, googleLogin);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Protected routes (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.post('/logout', protect, logout);

module.exports = router;
