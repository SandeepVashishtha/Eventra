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

const DEFAULT_FROM_EMAIL = 'noreply@eventra.app';

/**
 * Get email service implementation
 * Abstracts email provider for testing and flexibility.
 *
 * `mock` is only available outside production. In production a real provider
 * (sendgrid | ses) must be configured, otherwise we fail loudly instead of
 * silently pretending an email was delivered.
 */
function getEmailService() {
  const provider = process.env.EMAIL_PROVIDER;
  const isProduction = process.env.NODE_ENV === 'production';

  if (provider === 'mock') {
    if (isProduction) {
      throw new Error('Mock email service cannot be used in production');
    }
    return new MockEmailService();
  }

  switch (provider) {
    case 'sendgrid':
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('EMAIL_PROVIDER=sendgrid but SENDGRID_API_KEY is not set');
      }
      return new SendGridEmailService();
    case 'ses':
      if (
        !process.env.AWS_REGION ||
        !process.env.AWS_ACCESS_KEY_ID ||
        !process.env.AWS_SECRET_ACCESS_KEY
      ) {
        throw new Error(
          'EMAIL_PROVIDER=ses but AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are not set'
        );
      }
      return new AWSEmailService();
    case undefined:
      if (isProduction) {
        throw new Error('EMAIL_PROVIDER must be set to a real provider in production');
      }
      return new MockEmailService();
    default:
      throw new Error(`Unknown email provider: ${provider}`);
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
    const { default: sgMail } = await import('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const from = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || DEFAULT_FROM_EMAIL;
    const [response] = await sgMail.send({
      to: emailData.to,
      from,
      subject: emailData.subject,
      text: emailData.body,
    });

    return {
      success: true,
      messageId:
        (response && response.headers && response.headers['x-message-id']) ||
        `sg_${Date.now()}`,
    };
  }
}

/**
 * AWS SES email service
 * Requires AWS_REGION plus AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY configured
 */
class AWSEmailService {
  async sendEmail(emailData) {
    const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses');

    const client = new SESClient({ region: process.env.AWS_REGION });
    const from = process.env.EMAIL_FROM || process.env.SES_FROM_EMAIL || DEFAULT_FROM_EMAIL;

    const result = await client.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [emailData.to] },
        Message: {
          Subject: { Data: emailData.subject },
          Body: { Text: { Data: emailData.body } },
        },
      })
    );

    return {
      success: true,
      messageId: result.MessageId || `ses_${Date.now()}`,
    };
  }
}
