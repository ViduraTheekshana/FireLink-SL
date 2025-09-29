const crypto = require("crypto");

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Generate QR token
function generateQRCodeToken(sessionId) {
  const expires = Date.now() + TOKEN_EXPIRY_MS;
  const payload = JSON.stringify({ sessionId, expires });
  return Buffer.from(payload).toString("base64");
}

// Validate QR token
function validateQRCodeToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("ascii"));
    if (Date.now() > payload.expires) return null;
    return payload.sessionId;
  } catch {
    return null;
  }
}

module.exports = { generateQRCodeToken, validateQRCodeToken };
