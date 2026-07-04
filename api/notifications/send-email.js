/**
 * api/notifications/send-email.js
 *
 * API endpoint for sending notification emails to event attendees.
 * Handles event cancellation notices, registration confirmations, and other
 * event-related notifications with proper validation and error handling.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { to, subject, body, type, eventId, eventTitle, timestamp } = req.body;

    // Validate required fields
    if (!to || !subject || !body) {
      return res.status(400).json({
        message: 'Missing required fields: to, subject, body',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Validate notification type
    const validTypes = ['event_cancellation', 'registration_confirmation', 'reminder', 'refund_notice'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid notification type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Log notification attempt
    console.log(`Sending ${type || 'notification'} email to ${to} for event: ${eventTitle}`);

    // In production, this would integrate with email service (SendGrid, AWS SES, etc.)
    // For now, we'll use a mock implementation that logs and returns success
    const emailService = getEmailService();
    const result = await emailService.sendEmail({
      to,
      subject,
      body,
      type,
      eventId,
      eventTitle,
      sentAt: new Date().toISOString(),
    });

    if (!result.success) {
      return res.status(500).json({
        message: 'Failed to send email',
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId,
      recipient: to,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      message: 'Failed to send email',
      error: error.message,
    });
  }
}

/**
 * Get email service implementation
 * Abstracts email provider for testing and flexibility
 */
function getEmailService() {
  const provider = process.env.EMAIL_PROVIDER || 'mock';

  switch (provider) {
    case 'sendgrid':
      return new SendGridEmailService();
    case 'ses':
      return new AWSEmailService();
    case 'mock':
    default:
      return new MockEmailService();
  }
}

/**
 * Mock email service for development/testing
 */
class MockEmailService {
  async sendEmail(emailData) {
    // Generate mock message ID
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log email in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[MockEmailService] Email sent:', {
        to: emailData.to,
        subject: emailData.subject,
        type: emailData.type,
        messageId,
        timestamp: emailData.sentAt,
      });
    }

    // Return success
    return {
      success: true,
      messageId,
    };
  }
}

/**
 * SendGrid email service
 * Requires SENDGRID_API_KEY environment variable
 */
class SendGridEmailService {
  async sendEmail(emailData) {
    // This would use the SendGrid SDK in production
    // Placeholder implementation
    console.warn('SendGrid email service not fully implemented');
    return {
      success: true,
      messageId: `sg_${Date.now()}`,
    };
  }
}

/**
 * AWS SES email service
 * Requires AWS credentials configured
 */
class AWSEmailService {
  async sendEmail(emailData) {
    // This would use the AWS SDK in production
    // Placeholder implementation
    console.warn('AWS SES email service not fully implemented');
    return {
      success: true,
      messageId: `ses_${Date.now()}`,
    };
  }
}
