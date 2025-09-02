const jwt = require('jsonwebtoken');
const QRToken = require('../models/QRToken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// Generate QR token
exports.generateToken = async (payload) => {
  try {
    // Create JWT token with 10-minute expiration
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
    return token;
  } catch (error) {
    console.error('Generate token error:', error);
    throw new Error('Failed to generate QR token');
  }
};

// Validate QR token
exports.validateToken = async (token) => {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token exists in database and is not used
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const qrToken = await QRToken.findOne({ 
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!qrToken) {
      return {
        valid: false,
        message: 'QR token is invalid, expired, or already used'
      };
    }

    return {
      valid: true,
      data: decoded
    };

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        message: 'QR token has expired'
      };
    } else if (error.name === 'JsonWebTokenError') {
      return {
        valid: false,
        message: 'Invalid QR token'
      };
    } else {
      console.error('Validate token error:', error);
      return {
        valid: false,
        message: 'Error validating QR token'
      };
    }
  }
};

// Clean up expired tokens
exports.cleanupExpiredTokens = async () => {
  try {
    const result = await QRToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired QR tokens`);
    return result.deletedCount;
  } catch (error) {
    console.error('Cleanup expired tokens error:', error);
    throw error;
  }
};

// Get QR token statistics
exports.getTokenStats = async (trainingSessionId) => {
  try {
    const stats = await QRToken.aggregate([
      { $match: { trainingSession: trainingSessionId } },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: 1 },
          usedTokens: { $sum: { $cond: ['$used', 1, 0] } },
          expiredTokens: { $sum: { $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0] } }
        }
      }
    ]);

    return stats[0] || { totalTokens: 0, usedTokens: 0, expiredTokens: 0 };
  } catch (error) {
    console.error('Get token stats error:', error);
    throw error;
  }
};
