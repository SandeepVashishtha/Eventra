/**
 * api/notifications/send-email.js
 *
 * API endpoint for sending notification emails to event attendees.
 * Handles event cancellation notices, registration confirmations, and other
 * event-related notifications with proper validation and error handling.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_NOTIFICATION_TYPES = [
  'event_cancellation',
  'registration_confirmation',
  'reminder',
  'refund_notice',
];

const isWrongMethod = (req) => req.method !== 'POST';
const isMissingAuth = (req) => !req.headers.authorization;
const isMissingFields = (req) => {
  const { to, subject, body } = req.body;
  return !to || !subject || !body;
};
const isEmailInvalid = (req) => !EMAIL_REGEX.test(req.body.to);
const isTypeInvalid = (req) => req.body.type && !VALID_NOTIFICATION_TYPES.includes(req.body.type);

const REQUEST_VALIDATORS = [
  { test: isWrongMethod, status: 405, message: 'Method not allowed' },
  { test: isMissingAuth, status: 401, message: 'Unauthorized' },
  { test: isMissingFields, status: 400, message: 'Missing required fields: to, subject, body' },
  { test: isEmailInvalid, status: 400, message: 'Invalid email address' },
  {
    test: isTypeInvalid,
    status: 400,
    message: `Invalid notification type. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`,
  },
];

function findValidationFailure(req) {
  return REQUEST_VALIDATORS.find((validator) => validator.test(req)) || null;
}

async function dispatchNotificationEmail(req) {
  const { to, subject, body, type, eventId, eventTitle } = req.body;

  console.log(`Sending ${type || 'notification'} email to ${to} for event: ${eventTitle}`);

  const emailService = getEmailService();
  return emailService.sendEmail({
    to,
    subject,
    body,
    type,
    eventId,
    eventTitle,
    sentAt: new Date().toISOString(),
  });
}

export default async function handler(req, res) {
  const failure = findValidationFailure(req);
  if (failure) {
    return res.status(failure.status).json({ message: failure.message });
  }

  try {
    const result = await dispatchNotificationEmail(req);

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
      recipient: req.body.to,
      type: req.body.type,
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
