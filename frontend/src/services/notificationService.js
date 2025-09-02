// services/notificationService.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransporter({
      service: 'gmail', // or your email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    this.smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  }
  
  async sendShiftNotification(shift, crewMembers) {
    const notifications = [];
    
    for (const member of crewMembers) {
      // Email notification
      const emailTemplate = this.getShiftEmailTemplate(shift, member);
      const emailPromise = this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: member.email,
        subject: emailTemplate.subject,
        html: emailTemplate.body
      });
      
      // SMS notification  
      const smsTemplate = this.getShiftSMSTemplate(shift, member);
      const smsPromise = this.smsClient.messages.create({
        body: smsTemplate,
        from: process.env.TWILIO_PHONE,
        to: member.phone
      });
      
      notifications.push(
        emailPromise.catch(err => ({ error: 'EMAIL_FAILED', member: member._id })),
        smsPromise.catch(err => ({ error: 'SMS_FAILED', member: member._id }))
      );
    }
    
    const results = await Promise.allSettled(notifications);
    return this.processNotificationResults(results);
  }
  
  getShiftEmailTemplate(shift, member) {
    return {
      subject: `Shift Assignment: ${shift.shiftName}`,
      body: `
        <h2>Shift Assignment Notification</h2>
        <p>Hello ${member.firstName},</p>
        <p>You have been assigned to the following shift:</p>
        <ul>
          <li><strong>Shift:</strong> ${shift.shiftName}</li>
          <li><strong>Date:</strong> ${shift.startDateTime.toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${shift.startDateTime.toLocaleTimeString()} - ${shift.endDateTime.toLocaleTimeString()}</li>
          <li><strong>Station:</strong> ${shift.station}</li>
          <li><strong>Role:</strong> ${member.role}</li>
        </ul>
        <p>Please confirm your availability and report on time.</p>
      `
    };
  }
  
  getShiftSMSTemplate(shift, member) {
    return `FIRE DEPT: Shift assigned - ${shift.shiftName} on ${shift.startDateTime.toLocaleDateString()} at ${shift.startDateTime.toLocaleTimeString()}. Station: ${shift.station}. Role: ${member.role}`;
  }
  
  async sendTrainingReminder(training, attendees) {
    // Similar implementation for training notifications
  }
}