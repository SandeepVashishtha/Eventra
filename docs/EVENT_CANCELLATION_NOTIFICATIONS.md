# Event Cancellation Notifications

## Overview

This system ensures that all registered attendees are notified immediately when an event is cancelled. Notifications are sent via email with essential information about the cancellation, refund deadlines, and next steps.

## Implementation

### Frontend Service

The `EventCancellationNotificationService` in `src/utils/eventCancellationNotifications.js` provides:

- **notifyAllAttendees()** — Send cancellation emails to all registered attendees
- **notifyAttendee()** — Send cancellation email to a single attendee
- **handleEventCancellation()** — Complete cancellation workflow

### Backend API Endpoint

`POST /api/notifications/send-email` — Send email notifications to attendees

**Request Body:**
```json
{
  "to": "attendee@example.com",
  "subject": "Event Cancelled: Annual Conference",
  "body": "Email content here...",
  "type": "event_cancellation",
  "eventId": "event-123",
  "eventTitle": "Annual Conference"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_1234567890",
  "recipient": "attendee@example.com",
  "type": "event_cancellation",
  "timestamp": "2026-07-04T10:30:00.000Z"
}
```

## Integration with Event Cancellation

### Backend Integration

When cancelling an event, the backend should:

1. Update event status to `CANCELLED`
2. Fetch all registrations for the event
3. Call `EventCancellationNotificationService.handleEventCancellation()`
4. Log results and handle any failures

**Example Pseudocode:**
```javascript
async function cancelEvent(eventId, organiserId) {
  // 1. Validate event ownership and update status
  const event = await Event.findById(eventId);
  if (event.organiserId !== organiserId) {
    throw new UnauthorizedError();
  }
  event.status = 'CANCELLED';
  await event.save();

  // 2. Send cancellation notifications
  const result = await eventCancellationNotifications.handleEventCancellation(
    eventId,
    event
  );

  // 3. Log results
  logger.info({
    eventId,
    eventTitle: event.title,
    notificationsSent: result.notificationsSent,
    notificationsFailed: result.notificationsFailed,
  }, 'Event cancellation notifications sent');

  return result;
}
```

## Email Template

The cancellation email includes:

- **Greeting** — Personalized with attendee name
- **Event Details** — Original event title, date, and time
- **Cancellation Notice** — Clear statement that event is cancelled
- **Refund Information** — Refund eligibility and deadline
- **Next Steps** — How attendees can request refunds or get support
- **Contact Information** — How to reach organizer/support

## Environment Configuration

Supported email providers:

```env
# Default (Mock - development only)
EMAIL_PROVIDER=mock

# SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_api_key

# AWS SES
EMAIL_PROVIDER=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## Testing

Run comprehensive test suite:

```bash
npm test tests/eventCancellationNotifications.test.mjs
```

Tests cover:
- Event validation (required fields)
- Email content formatting
- Single attendee notification
- Batch notifications to multiple attendees
- Error handling and partial failures
- Metadata preservation

## Error Handling

The notification system gracefully handles:

- **Missing attendee emails** — Logs warning, continues with other attendees
- **Invalid event data** — Throws descriptive error, fails fast
- **Email service failures** — Returns partial success with failure details
- **Network timeouts** — Retries with exponential backoff

## Monitoring

Monitor notification delivery:

1. **Check logs** for notification success/failure rates
2. **Track metrics** — Total notifications sent, failures, retry attempts
3. **Alert on** — More than X% failures, timeouts, missing attendees
4. **Audit trail** — Log all cancellation notifications for compliance

## Compliance

- **GDPR** — Respects email preferences and unsubscribe requests
- **CAN-SPAM** — Includes unsubscribe link and organizational contact
- **Accessibility** — Plain text alternative provided
- **Data Protection** — No sensitive data in email headers

## Future Enhancements

- SMS notifications for critical cancellations
- In-app push notifications
- Multi-language email templates
- Customizable cancellation email templates per organizer
- Scheduled notification retry logic
- Cancellation reason communication to attendees
