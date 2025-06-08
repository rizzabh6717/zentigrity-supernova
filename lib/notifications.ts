import { twilioClient, getTwilioPhoneNumber, validatePhoneNumber } from '@/lib/twilio';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmergencyReport {
  type: string;
  location: string;
  description: string;
  phone: string;
  timestamp: string;
}

// Error logging utility
function logNotificationError(error: unknown, service: 'SMS' | 'Email', context: string) {
  console.error(`[Notification Error - ${service}]`, {
    error,
    timestamp: new Date().toISOString(),
    service,
    context
  });
}

// Send SMS notification using Twilio
async function sendSMSNotification(report: EmergencyReport) {
  const startTime = Date.now();
  try {
    // Validate recipient phone number
    if (!validatePhoneNumber(report.phone)) {
      throw new Error('Invalid recipient phone number format');
    }

    const message = await twilioClient.messages.create({
      body: `EMERGENCY ALERT\nType: ${report.type}\nLocation: ${report.location}\nDescription: ${report.description}\nTime: ${new Date(report.timestamp).toLocaleString()}`,
      from: getTwilioPhoneNumber(),
      to: report.phone
    });

    const processingTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] SMS Notification Sent:`, {
      to: report.phone,
      processingTime: `${processingTime}ms`,
      messageId: message.sid
    });
    return { success: true, messageId: message.sid };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logNotificationError(error, 'SMS', 'SMS Sending Failure');
    return { success: false, error };
  }
}

// Send email notification using SendGrid
async function sendEmailNotification(report: EmergencyReport) {
  const startTime = Date.now();
  try {
    const msg = {
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'emergency@example.com',
      subject: `Emergency Alert: ${report.type}`,
      text: `Emergency Report Details:\nType: ${report.type}\nLocation: ${report.location}\nDescription: ${report.description}\nPhone: ${report.phone}\nTime: ${new Date(report.timestamp).toLocaleString()}`,
      html: `
        <h2>Emergency Alert</h2>
        <p><strong>Type:</strong> ${report.type}</p>
        <p><strong>Location:</strong> ${report.location}</p>
        <p><strong>Description:</strong> ${report.description}</p>
        <p><strong>Phone:</strong> ${report.phone}</p>
        <p><strong>Time:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
      `
    };

    await sgMail.send(msg);
    const processingTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Email Notification Sent:`, {
      to: process.env.ADMIN_EMAIL,
      processingTime: `${processingTime}ms`
    });
    return { success: true };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logNotificationError(error, 'Email', 'Email Sending Failure');
    return { success: false, error };
  }
}

// Main function to send both notifications
export async function sendEmergencyNotifications(report: EmergencyReport) {
  const startTime = Date.now();
  const notificationId = Math.random().toString(36).substring(7);

  try {
    const smsResult = await sendSMSNotification(report);
    const emailResult = await sendEmailNotification(report);
    
    const processingTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Notifications Sent:`, {
      notificationId,
      processingTime: `${processingTime}ms`,
      smsStatus: smsResult.success ? 'success' : 'failed',
      emailStatus: emailResult.success ? 'success' : 'failed'
    });

    return {
      success: smsResult.success && emailResult.success,
      error: smsResult.error || emailResult.error
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logNotificationError(error, 'SMS', 'General Notification Failure');
    return {
      success: false,
      error
    };
  }
} 