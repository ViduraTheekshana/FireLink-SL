const generateQRCodeToken = (sessionId) => {
  const token = nanoid(); // unique token
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

  // Save token in memory
  QRTokens[token] = { sessionId, expiresAt };
  return token;
};
