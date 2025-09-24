const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// SMS configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email templates
const emailTemplates = {
  shiftAssignment: {
    subject: 'New Shift Assignment - Fire Handling System',
    template: `
      <h2>New Shift Assignment</h2>
      <p>Hello {{name}},</p>
      <p>You have been assigned to a new shift:</p>
      <ul>
        <li><strong>Shift:</strong> {{shiftName}}</li>
        <li><strong>Date:</strong> {{startDate}}</li>
        <li><strong>Time:</strong> {{startTime}} - {{endTime}}</li>
        <li><strong>Station:</strong> {{station}}</li>
        <li><strong>Role:</strong> {{role}}</li>
        <li><strong>Vehicles:</strong> {{vehicles}}</li>
      </ul>
      <p>Please confirm your availability and arrive on time.</p>
      <p>Best regards,<br>Fire Handling System</p>
    `
  },
  shiftUpdate: {
    subject: 'Shift Update - Fire Handling System',
    template: `
      <h2>Shift Update</h2>
      <p>Hello {{name}},</p>
      <p>Your shift has been updated:</p>
      <ul>
        <li><strong>Shift:</strong> {{shiftName}}</li>
        <li><strong>Date:</strong> {{startDate}}</li>
        <li><strong>Time:</strong> {{startTime}} - {{endTime}}</li>
        <li><strong>Station:</strong> {{station}}</li>
        <li><strong>Role:</strong> {{role}}</li>
        <li><strong>Vehicles:</strong> {{vehicles}}</li>
      </ul>
      <p>Please review the changes and update your schedule accordingly.</p>
      <p>Best regards,<br>Fire Handling System</p>
    `
  },
  shiftCancellation: {
    subject: 'Shift Cancellation - Fire Handling System',
    template: `
      <h2>Shift Cancellation</h2>
      <p>Hello {{name}},</p>
      <p>Your shift has been cancelled:</p>
      <ul>
        <li><strong>Shift:</strong> {{shiftName}}</li>
        <li><strong>Date:</strong> {{startDate}}</li>
        <li><strong>Time:</strong> {{startTime}} - {{endTime}}</li>
        <li><strong>Station:</strong> {{station}}</li>
      </ul>
      <p>You will be notified of any rescheduled shifts.</p>
      <p>Best regards,<br>Fire Handling System</p>
    `
  },
  trainingInvitation: {
    subject: 'Training Session Invitation - Fire Handling System',
    template: `
      <h2>Training Session Invitation</h2>
      <p>Hello {{name}},</p>
      <p>You have been invited to attend a training session:</p>
      <ul>
        <li><strong>Training:</strong> {{title}}</li>
        <li><strong>Date:</strong> {{startDate}}</li>
        <li><strong>Time:</strong> {{startTime}} - {{endTime}}</li>
        <li><strong>Location:</strong> {{location}}</li>
        <li><strong>Trainer:</strong> {{trainer}}</li>
      </ul>
      <p>Please confirm your attendance and arrive on time.</p>
      <p>Best regards,<br>Fire Handling System</p>
    `
  },
  shiftChangeRequest: {
    subject: 'Shift Change Request Submitted - Fire Handling System',
    template: `
      <h2>Shift Change Request Submitted</h2>
      <p>Hello {{name}},</p>
      <p>A shift change request has been submitted:</p>
      <ul>
        <li><strong>Shift:</strong> {{shiftName}}</li>
        <li><strong>Date:</strong> {{startDate}}</li>
        <li><strong>Time:</strong> {{startTime}} - {{endTime}}</li>
        <li><strong>Station:</strong> {{station}}</li>
        <li><strong>Request Type:</strong> {{requestType}}</li>
        <li><strong>Priority:</strong> {{priority}}</li>
        <li><strong>Reason:</strong> {{reason}}</li>
        <li><strong>Requester:</strong> {{requesterName}}</li>
      </ul>
      <p>Please review and take appropriate action.</p>
      <p>Best regards,<br>Fire Handling System</p>
    `
  },
  shiftChangeApproval: {
    subject: 'Shift Change Request Approved - Fire Handling System',
    template: `
      <h2>Shift Change Request Approved</h2>
      <p>Hello {{name}},</p>
      <p>Your shift change request has been approved:</p>
      <ul>
        <li><strong>Shift:</strong> {{shiftName}}</li>
        <li><strong>Date:</strong> {{startDate}}</li>
        <li><strong>Request Type:</strong> {{requestType}}</li>
        <li><strong>Reviewer Comments:</strong> {{comments}}</li>
      </ul>
      <p>Your schedule has been updated accordingly.</p>
      <p>Best regards,<br>Fire Handling System</p>
    `
  },
  shiftChangeRejection: {
    subject: 'Shift Change Request Rejected - Fire Handling System',
    template: `
      <h2>Shift Change Request Rejected</h2>
      <p>Hello {{name}},</p>
      <p>Your shift change request has been rejected:</p>
      <ul>
        <li><strong>Shift:</strong> {{shiftName}}</li>
        <li><strong>Date:</strong> {{startDate}}</li>
        <li><strong>Request Type:</strong> {{requestType}}</li>
        <li><strong>Reviewer Comments:</strong> {{comments}}</li>
      </ul>
      <p>Please contact your supervisor if you have any questions.</p>
      <p>Best regards,<br>Fire Handling System</p>
    `
  }
};

// SMS templates
const smsTemplates = {
  shiftAssignment: 'New shift assigned: {{shiftName}} on {{startDate}} at {{startTime}}. Role: {{role}}. Station: {{station}}.',
  shiftUpdate: 'Shift updated: {{shiftName}} on {{startDate}} at {{startTime}}. Role: {{role}}. Station: {{station}}.',
  shiftCancellation: 'Shift cancelled: {{shiftName}} on {{startDate}} at {{startTime}}. Station: {{station}}.',
  trainingInvitation: 'Training invitation: {{title}} on {{startDate}} at {{startTime}}. Location: {{location}}.',
  shiftChangeRequest: 'Shift change request submitted: {{shiftName}} on {{startDate}}. Type: {{requestType}}. Priority: {{priority}}.',
  shiftChangeApproval: 'Shift change request approved: {{shiftName}} on {{startDate}}. Comments: {{comments}}.',
  shiftChangeRejection: 'Shift change request rejected: {{shiftName}} on {{startDate}}. Comments: {{comments}}.'
};

// Helper function to replace template variables
const replaceTemplateVariables = (template, variables) => {
  let result = template;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  return result;
};

// Send email notification
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@firehandling.com',
      to,
      subject,
      html
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Send SMS notification
const sendSMS = async (to, message) => {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
};

// Send shift assignment notifications
exports.sendShiftAssignmentNotifications = async (shift) => {
  try {
    const startDate = new Date(shift.startDateTime).toLocaleDateString();
    const startTime = new Date(shift.startDateTime).toLocaleTimeString();
    const endTime = new Date(shift.endDateTime).toLocaleTimeString();
    
    const vehicleNumbers = shift.assignedVehicles.map(v => v.vehicleNumber).join(', ');

    for (const crewMember of shift.crew) {
      const variables = {
        name: crewMember.member.name,
        shiftName: shift.shiftName,
        startDate,
        startTime,
        endTime,
        station: shift.station,
        role: crewMember.role,
        vehicles: vehicleNumbers
      };

      // Send email
      try {
        const emailHtml = replaceTemplateVariables(emailTemplates.shiftAssignment.template, variables);
        await sendEmail(
          crewMember.member.email,
          emailTemplates.shiftAssignment.subject,
          emailHtml
        );
      } catch (emailError) {
        console.error('Email notification failed for crew member:', crewMember.member.id);
      }

      // Send SMS if phone number exists
      if (crewMember.member.phone) {
        try {
          const smsMessage = replaceTemplateVariables(smsTemplates.shiftAssignment, variables);
          await sendSMS(crewMember.member.phone, smsMessage);
        } catch (smsError) {
          console.error('SMS notification failed for crew member:', crewMember.member.id);
        }
      }
    }
  } catch (error) {
    console.error('Send shift assignment notifications error:', error);
    throw error;
  }
};

// Send shift update notifications
exports.sendShiftUpdateNotifications = async (shift) => {
  try {
    const startDate = new Date(shift.startDateTime).toLocaleDateString();
    const startTime = new Date(shift.startDateTime).toLocaleTimeString();
    const endTime = new Date(shift.endDateTime).toLocaleTimeString();
    
    const vehicleNumbers = shift.assignedVehicles.map(v => v.vehicleNumber).join(', ');

    for (const crewMember of shift.crew) {
      const variables = {
        name: crewMember.member.name,
        shiftName: shift.shiftName,
        startDate,
        startTime,
        endTime,
        station: shift.station,
        role: crewMember.role,
        vehicles: vehicleNumbers
      };

      // Send email
      try {
        const emailHtml = replaceTemplateVariables(emailTemplates.shiftUpdate.template, variables);
        await sendEmail(
          crewMember.member.email,
          emailTemplates.shiftUpdate.subject,
          emailHtml
        );
      } catch (emailError) {
        console.error('Email notification failed for crew member:', crewMember.member.id);
      }

      // Send SMS if phone number exists
      if (crewMember.member.phone) {
        try {
          const smsMessage = replaceTemplateVariables(smsTemplates.shiftUpdate, variables);
          await sendSMS(crewMember.member.phone, smsMessage);
        } catch (smsError) {
          console.error('SMS notification failed for crew member:', crewMember.member.id);
        }
      }
    }
  } catch (error) {
    console.error('Send shift update notifications error:', error);
    throw error;
  }
};

// Send shift cancellation notifications
exports.sendShiftCancellationNotifications = async (shift) => {
  try {
    const startDate = new Date(shift.startDateTime).toLocaleDateString();
    const startTime = new Date(shift.startDateTime).toLocaleTimeString();
    const endTime = new Date(shift.endDateTime).toLocaleTimeString();

    for (const crewMember of shift.crew) {
      const variables = {
        name: crewMember.member.name,
        shiftName: shift.shiftName,
        startDate,
        startTime,
        endTime,
        station: shift.station
      };

      // Send email
      try {
        const emailHtml = replaceTemplateVariables(emailTemplates.shiftCancellation.template, variables);
        await sendEmail(
          crewMember.member.email,
          emailTemplates.shiftCancellation.subject,
          emailHtml
        );
      } catch (emailError) {
        console.error('Email notification failed for crew member:', crewMember.member.id);
      }

      // Send SMS if phone number exists
      if (crewMember.member.phone) {
        try {
          const smsMessage = replaceTemplateVariables(smsTemplates.shiftCancellation, variables);
          await sendSMS(crewMember.member.phone, smsMessage);
        } catch (smsError) {
          console.error('SMS notification failed for crew member:', crewMember.member.id);
        }
      }
    }
  } catch (error) {
    console.error('Send shift cancellation notifications error:', error);
    throw error;
  }
};

// Send training invitation notifications
exports.sendTrainingInvitationNotifications = async (trainingSession, specificAttendees = null) => {
  try {
    const startDate = new Date(trainingSession.startDateTime).toLocaleDateString();
    const startTime = new Date(trainingSession.startDateTime).toLocaleTimeString();
    const endTime = new Date(trainingSession.endDateTime).toLocaleTimeString();

    const attendees = specificAttendees || trainingSession.registeredAttendees;

    for (const attendee of attendees) {
      const variables = {
        name: attendee.name,
        title: trainingSession.title,
        startDate,
        startTime,
        endTime,
        location: trainingSession.location,
        trainer: trainingSession.trainer.name
      };

      // Send email
      try {
        const emailHtml = replaceTemplateVariables(emailTemplates.trainingInvitation.template, variables);
        await sendEmail(
          attendee.email,
          emailTemplates.trainingInvitation.subject,
          emailHtml
        );
      } catch (emailError) {
        console.error('Email notification failed for attendee:', attendee.id);
      }

      // Send SMS if phone number exists
      if (attendee.phone) {
        try {
          const smsMessage = replaceTemplateVariables(smsTemplates.trainingInvitation, variables);
          await sendSMS(attendee.phone, smsMessage);
        } catch (smsError) {
          console.error('SMS notification failed for attendee:', attendee.id);
        }
      }
    }
  } catch (error) {
    console.error('Send training invitation notifications error:', error);
    throw error;
  }
};

// Send custom notification
exports.sendCustomNotification = async (recipients, subject, message, type = 'email') => {
  try {
    if (type === 'email') {
      for (const recipient of recipients) {
        await sendEmail(recipient.email, subject, message);
      }
    } else if (type === 'sms') {
      for (const recipient of recipients) {
        if (recipient.phone) {
          await sendSMS(recipient.phone, message);
        }
      }
    }
  } catch (error) {
    console.error('Send custom notification error:', error);
    throw error;
  }
};

// Send shift change request notifications
exports.sendShiftChangeRequestNotifications = async (shiftChangeRequest) => {
  try {
    const startDate = new Date(shiftChangeRequest.shift.startDateTime).toLocaleDateString();
    const startTime = new Date(shiftChangeRequest.shift.startDateTime).toLocaleTimeString();
    const endTime = new Date(shiftChangeRequest.shift.endDateTime).toLocaleTimeString();

    const variables = {
      name: 'Admin/Scheduler',
      shiftName: shiftChangeRequest.shift.shiftName,
      startDate,
      startTime,
      endTime,
      station: shiftChangeRequest.shift.station,
      requestType: shiftChangeRequest.requestType,
      priority: shiftChangeRequest.priority,
      reason: shiftChangeRequest.reason,
      requesterName: shiftChangeRequest.requester.name
    };

    // Get admin/scheduler users to notify
    const User = require('../models/User');
    const Role = require('../models/Role');
    
    const adminRole = await Role.findOne({ name: 'Admin' });
    const schedulerRole = await Role.findOne({ name: 'Scheduler' });
    
    const adminUsers = await User.find({ 
      roles: { $in: [adminRole._id, schedulerRole._id] },
      isActive: true 
    });

    // Send notifications to admins/schedulers
    for (const adminUser of adminUsers) {
      try {
        const emailHtml = replaceTemplateVariables(emailTemplates.shiftChangeRequest.template, variables);
        await sendEmail(
          adminUser.email,
          emailTemplates.shiftChangeRequest.subject,
          emailHtml
        );
      } catch (emailError) {
        console.error('Email notification failed for admin:', adminUser.id);
      }

      if (adminUser.phone) {
        try {
          const smsMessage = replaceTemplateVariables(smsTemplates.shiftChangeRequest, variables);
          await sendSMS(adminUser.phone, smsMessage);
        } catch (smsError) {
          console.error('SMS notification failed for admin:', adminUser.id);
        }
      }
    }

    // Notify replacement user if specified
    if (shiftChangeRequest.requestedReplacement) {
      const replacementUser = await User.findById(shiftChangeRequest.requestedReplacement);
      if (replacementUser) {
        const replacementVariables = {
          name: replacementUser.name,
          shiftName: shiftChangeRequest.shift.shiftName,
          startDate,
          startTime,
          endTime,
          station: shiftChangeRequest.shift.station,
          requestType: shiftChangeRequest.requestType,
          requesterName: shiftChangeRequest.requester.name
        };

        try {
          const emailHtml = replaceTemplateVariables(emailTemplates.shiftChangeRequest.template, replacementVariables);
          await sendEmail(
            replacementUser.email,
            'Shift Change Request - Your Involvement',
            emailHtml
          );
        } catch (emailError) {
          console.error('Email notification failed for replacement user:', replacementUser.id);
        }

        if (replacementUser.phone) {
          try {
            const smsMessage = replaceTemplateVariables(smsTemplates.shiftChangeRequest, replacementVariables);
            await sendSMS(replacementUser.phone, smsMessage);
          } catch (smsError) {
            console.error('SMS notification failed for replacement user:', replacementUser.id);
          }
        }
      }
    }
  } catch (error) {
    console.error('Send shift change request notifications error:', error);
    throw error;
  }
};

// Send shift change approval notifications
exports.sendShiftChangeApprovalNotifications = async (shiftChangeRequest) => {
  try {
    const startDate = new Date(shiftChangeRequest.shift.startDateTime).toLocaleDateString();

    const variables = {
      name: shiftChangeRequest.requester.name,
      shiftName: shiftChangeRequest.shift.shiftName,
      startDate,
      requestType: shiftChangeRequest.requestType,
      comments: shiftChangeRequest.reviewComments || 'No comments provided'
    };

    // Notify the requester
    try {
      const emailHtml = replaceTemplateVariables(emailTemplates.shiftChangeApproval.template, variables);
      await sendEmail(
        shiftChangeRequest.requester.email,
        emailTemplates.shiftChangeApproval.subject,
        emailHtml
      );
    } catch (emailError) {
      console.error('Email notification failed for requester:', shiftChangeRequest.requester.id);
    }

    if (shiftChangeRequest.requester.phone) {
      try {
        const smsMessage = replaceTemplateVariables(smsTemplates.shiftChangeApproval, variables);
        await sendSMS(shiftChangeRequest.requester.phone, smsMessage);
      } catch (smsError) {
        console.error('SMS notification failed for requester:', shiftChangeRequest.requester.id);
      }
    }

    // Notify replacement user if applicable
    if (shiftChangeRequest.requestedReplacement) {
      const User = require('../models/User');
      const replacementUser = await User.findById(shiftChangeRequest.requestedReplacement);
      
      if (replacementUser) {
        const replacementVariables = {
          name: replacementUser.name,
          shiftName: shiftChangeRequest.shift.shiftName,
          startDate,
          requestType: shiftChangeRequest.requestType,
          comments: 'You have been assigned to this shift as a replacement.'
        };

        try {
          const emailHtml = replaceTemplateVariables(emailTemplates.shiftChangeApproval.template, replacementVariables);
          await sendEmail(
            replacementUser.email,
            'Shift Assignment - Replacement Approved',
            emailHtml
          );
        } catch (emailError) {
          console.error('Email notification failed for replacement user:', replacementUser.id);
        }

        if (replacementUser.phone) {
          try {
            const smsMessage = replaceTemplateVariables(smsTemplates.shiftChangeApproval, replacementVariables);
            await sendSMS(replacementUser.phone, smsMessage);
          } catch (smsError) {
            console.error('SMS notification failed for replacement user:', replacementUser.id);
          }
        }
      }
    }
  } catch (error) {
    console.error('Send shift change approval notifications error:', error);
    throw error;
  }
};

// Send shift change rejection notifications
exports.sendShiftChangeRejectionNotifications = async (shiftChangeRequest) => {
  try {
    const startDate = new Date(shiftChangeRequest.shift.startDateTime).toLocaleDateString();

    const variables = {
      name: shiftChangeRequest.requester.name,
      shiftName: shiftChangeRequest.shift.shiftName,
      startDate,
      requestType: shiftChangeRequest.requestType,
      comments: shiftChangeRequest.reviewComments || 'No comments provided'
    };

    // Notify the requester
    try {
      const emailHtml = replaceTemplateVariables(emailTemplates.shiftChangeRejection.template, variables);
      await sendEmail(
        shiftChangeRequest.requester.email,
        emailTemplates.shiftChangeRejection.subject,
        emailHtml
      );
    } catch (emailError) {
      console.error('Email notification failed for requester:', shiftChangeRequest.requester.id);
    }

    if (shiftChangeRequest.requester.phone) {
      try {
        const smsMessage = replaceTemplateVariables(smsTemplates.shiftChangeRejection, variables);
        await sendSMS(shiftChangeRequest.requester.phone, smsMessage);
      } catch (smsError) {
        console.error('SMS notification failed for requester:', shiftChangeRequest.requester.id);
      }
    }
  } catch (error) {
    console.error('Send shift change rejection notifications error:', error);
    throw error;
  }
};
