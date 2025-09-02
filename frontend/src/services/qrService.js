// Service: qrService.js
const generateQRToken = async (trainingSessionId, attendeeId) => {
  const payload = {
    t: trainingSessionId,
    a: attendeeId,
    exp: Date.now() + (10 * 60 * 1000), // 10 minutes
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  // Sign with JWT
  const token = jwt.sign(payload, process.env.QR_SECRET, { 
    algorithm: 'HS256',
    expiresIn: '10m'
  });
  
  // Store hash in database for replay prevention
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await QRToken.create({
    tokenHash,
    trainingSession: trainingSessionId,
    attendee: attendeeId,
    expiresAt: new Date(payload.exp)
  });
  
  return { qrPayload: token, expiresAt: new Date(payload.exp) };
};