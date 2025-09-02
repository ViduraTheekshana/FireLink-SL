const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// Generate unique certificate code
const generateCertificateCode = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `CERT-${timestamp}-${random}`.toUpperCase();
};

// Generate PDF certificate
const generatePDF = async (trainingSession, attendee, certificateCode) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape'
      });

      const fileName = `certificate-${certificateCode}.pdf`;
      const filePath = path.join(__dirname, '../uploads/certificates', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Certificate design
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('FIRE HANDLING SYSTEM', 0, 50, { align: 'center' });

      doc.fontSize(18)
         .font('Helvetica')
         .text('Certificate of Completion', 0, 90, { align: 'center' });

      doc.fontSize(14)
         .text('This is to certify that', 0, 130, { align: 'center' });

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text(attendee.name, 0, 160, { align: 'center' });

      doc.fontSize(14)
         .font('Helvetica')
         .text('has successfully completed the training session', 0, 190, { align: 'center' });

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text(trainingSession.title, 0, 220, { align: 'center' });

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Location: ${trainingSession.location}`, 0, 260, { align: 'center' });

      const startDate = new Date(trainingSession.startDateTime).toLocaleDateString();
      const endDate = new Date(trainingSession.endDateTime).toLocaleDateString();
      doc.text(`Duration: ${startDate} - ${endDate}`, 0, 280, { align: 'center' });

      doc.fontSize(10)
         .text(`Certificate Code: ${certificateCode}`, 0, 320, { align: 'center' });

      doc.fontSize(10)
         .text(`Issued on: ${new Date().toLocaleDateString()}`, 0, 340, { align: 'center' });

      // Add border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .stroke();

      doc.end();

      stream.on('finish', () => {
        resolve(fileName);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Generate certificate
exports.generateCertificate = async (trainingSession, attendance) => {
  try {
    // Get attendee details
    const attendee = await User.findById(attendance.attendee);
    if (!attendee) {
      throw new Error('Attendee not found');
    }

    // Generate unique certificate code
    let certificateCode;
    let isUnique = false;
    
    while (!isUnique) {
      certificateCode = generateCertificateCode();
      const existingCertificate = await Certificate.findOne({ certificateCode });
      if (!existingCertificate) {
        isUnique = true;
      }
    }

    // Generate PDF
    const pdfFileName = await generatePDF(trainingSession, attendee, certificateCode);
    const pdfUrl = `/uploads/certificates/${pdfFileName}`;

    // Calculate training duration
    const duration = (trainingSession.endDateTime - trainingSession.startDateTime) / (1000 * 60 * 60);

    // Create certificate record
    const certificate = await Certificate.create({
      trainingSession: trainingSession._id,
      attendee: attendance.attendee,
      certificateCode,
      issueDate: new Date(),
      pdfUrl,
      metadata: {
        duration: Math.round(duration * 100) / 100
      }
    });

    await certificate.populate([
      { path: 'trainingSession', select: 'title location startDateTime endDateTime' },
      { path: 'attendee', select: 'name email' }
    ]);

    return certificate;

  } catch (error) {
    console.error('Generate certificate error:', error);
    throw new Error('Failed to generate certificate');
  }
};

// Verify certificate
exports.verifyCertificate = async (certificateCode) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateCode,
      isValid: true
    }).populate([
      { path: 'trainingSession', select: 'title location startDateTime endDateTime' },
      { path: 'attendee', select: 'name email' }
    ]);

    if (!certificate) {
      return {
        valid: false,
        message: 'Certificate not found or invalid'
      };
    }

    return {
      valid: true,
      data: certificate
    };

  } catch (error) {
    console.error('Verify certificate error:', error);
    return {
      valid: false,
      message: 'Error verifying certificate'
    };
  }
};

// Revoke certificate
exports.revokeCertificate = async (certificateId, revokedBy) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      certificateId,
      {
        isValid: false,
        revokedAt: new Date(),
        revokedBy
      },
      { new: true }
    );

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    return certificate;

  } catch (error) {
    console.error('Revoke certificate error:', error);
    throw new Error('Failed to revoke certificate');
  }
};

// Get certificate statistics
exports.getCertificateStats = async (trainingSessionId = null) => {
  try {
    const match = trainingSessionId ? { trainingSession: trainingSessionId } : {};

    const stats = await Certificate.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
          validCertificates: { $sum: { $cond: ['$isValid', 1, 0] } },
          revokedCertificates: { $sum: { $cond: ['$isValid', 0, 1] } }
        }
      }
    ]);

    return stats[0] || { totalCertificates: 0, validCertificates: 0, revokedCertificates: 0 };

  } catch (error) {
    console.error('Get certificate stats error:', error);
    throw error;
  }
};
