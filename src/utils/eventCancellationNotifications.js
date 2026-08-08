/**
 * eventCancellationNotifications.js
 *
 * Handles event cancellation notification logic and email composition.
 * Integrates with backend notification service to send emails to all registered attendees.
 * Ensures attendees are properly informed of event cancellations with essential details.
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

class EventCancellationNotificationService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL || 'http://localhost:8080/api',
      timeout: 15000,
    });
  }

  /**
   * Validate that event has essential data for notifications
   */
  validateEventData(event) {
    const requiredFields = ['id', 'title', 'organiserId'];
    const missingFields = requiredFields.filter(field => !event[field]);

    if (missingFields.length > 0) {
      throw new Error(`Event missing required fields: ${missingFields.join(', ')}`);
    }

    return true;
  }

  /**
   * Format cancellation email content
   */
  formatCancellationEmailContent(event, attendee) {
    const eventDate = event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A';
    const eventTime = event.eventTime || 'N/A';
    const refundDeadline = event.refundDeadline ? new Date(event.refundDeadline).toLocaleDateString() : 'N/A';

    return {
      subject: `Event Cancelled: ${event.title}`,
      body: `
Dear ${attendee.firstName || 'Attendee'},

We regret to inform you that the following event has been cancelled:

Event: ${event.title}
Original Date: ${eventDate} at ${eventTime}
Location: ${event.location || 'TBD'}

Impact on Your Registration:
- Your registration for this event has been cancelled.
- If you paid an entry fee, you are eligible for a full refund.
- Refund deadline: ${refundDeadline}

Next Steps:
1. Check your email for refund instructions
2. If you have any questions, please contact the event organizer: ${event.organizerEmail || 'support@eventra.com'}
3. Your registration details have been preserved for reference

We apologize for any inconvenience this may cause. We appreciate your understanding.

Best regards,
Eventra Team

This is an automated message. Please do not reply to this email.
      `.trim(),
      plainText: true,
    };
  }

  /**
   * Send cancellation notification to a single attendee
   */
  async notifyAttendee(attendeeEmail, event, attendeeInfo) {
    try {
      const emailContent = this.formatCancellationEmailContent(event, attendeeInfo || {});

      const response = await this.apiClient.post('/notifications/send-email', {
        to: attendeeEmail,
        subject: emailContent.subject,
        body: emailContent.body,
        type: 'event_cancellation',
        eventId: event.id,
        eventTitle: event.title,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        email: attendeeEmail,
        messageId: response.data?.messageId,
      };
    } catch (error) {
      console.error(`Failed to notify attendee ${attendeeEmail}:`, error);
      return {
        success: false,
        email: attendeeEmail,
        error: error.message,
      };
    }
  }

  /**
   * Build the no-op result returned when there are no attendees to notify
   */
  buildEmptyNotificationResult() {
    return {
      success: true,
      message: 'No attendees to notify',
      notificationsSent: 0,
      notificationsFailed: 0,
      details: [],
    };
  }

  /**
   * Dispatch cancellation emails to every attendee and collect settled results
   */
  async dispatchCancellationEmails(event, attendees) {
    return Promise.allSettled(
      attendees.map(attendee =>
        this.notifyAttendee(
          attendee.email,
          event,
          { firstName: attendee.firstName, lastName: attendee.lastName }
        )
      )
    );
  }

  /**
   * Describe the outcome of a single settled notification for the details report
   */
  describeNotificationOutcome(settledResult, attendeeEmail) {
    const wasFulfilled = settledResult.status === 'fulfilled';
    const status = wasFulfilled
      ? (settledResult.value.success ? 'sent' : 'failed')
      : 'error';

    return {
      attendeeEmail,
      status,
      error: settledResult.reason?.message || settledResult.value?.error,
    };
  }

  /**
   * Summarize settled notification promises into a single results object
   */
  summarizeNotificationResults(notifications, attendees) {
    const isSuccessful = (n) => n.status === 'fulfilled' && n.value.success;
    const successful = notifications.filter(isSuccessful);
    const failed = notifications.filter((n) => !isSuccessful(n));

    return {
      success: failed.length === 0,
      notificationsSent: successful.length,
      notificationsFailed: failed.length,
      details: notifications.map((n, idx) =>
        this.describeNotificationOutcome(n, attendees[idx]?.email)
      ),
    };
  }

  /**
   * Send cancellation notifications to all registered attendees
   * Should be called immediately after event status is set to CANCELLED
   */
  async notifyAllAttendees(eventId, event, attendees) {
    try {
      this.validateEventData(event);

      if (!attendees || attendees.length === 0) {
        return this.buildEmptyNotificationResult();
      }

      console.log(`Sending event cancellation notifications to ${attendees.length} attendees for event: ${event.title}`);

      const notifications = await this.dispatchCancellationEmails(event, attendees);
      const results = this.summarizeNotificationResults(notifications, attendees);

      if (results.notificationsFailed > 0) {
        console.warn(`Failed to notify ${results.notificationsFailed} attendees of event cancellation`);
      }

      return results;
    } catch (error) {
      console.error('Error notifying attendees of event cancellation:', error);
      return {
        success: false,
        error: error.message,
        notificationsSent: 0,
        notificationsFailed: attendees?.length || 0,
      };
    }
  }

  /**
   * Fetch all registrations for an event (to get attendee email list)
   */
  async fetchEventRegistrations(eventId) {
    try {
      const response = await this.apiClient.get(`/events/${eventId}/registrations`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch registrations for event ${eventId}:`, error);
      return [];
    }
  }

  /**
   * Complete cancellation workflow:
   * 1. Fetch all registered attendees
   * 2. Send cancellation notifications to each
   * 3. Return summary of notifications sent/failed
   */
  async handleEventCancellation(eventId, event) {
    try {
      this.validateEventData(event);

      console.log(`Starting event cancellation workflow for event: ${event.title} (ID: ${eventId})`);

      // Fetch list of attendees
      const registrations = await this.fetchEventRegistrations(eventId);

      if (!registrations || registrations.length === 0) {
        console.log(`No registrations found for event ${eventId}`);
        return {
          success: true,
          message: 'Event cancelled with no registered attendees',
          notificationsSent: 0,
        };
      }

      // Extract attendee contact info
      const attendees = registrations.map(reg => ({
        email: reg.attendeeEmail || reg.email,
        firstName: reg.attendeeFirstName || reg.firstName,
        lastName: reg.attendeeLastName || reg.lastName,
      })).filter(a => a.email);

      if (attendees.length === 0) {
        console.warn(`No attendee emails found in registrations for event ${eventId}`);
        return {
          success: true,
          message: 'Event cancelled but no attendee emails found',
          notificationsSent: 0,
        };
      }

      // Send notifications
      return await this.notifyAllAttendees(eventId, event, attendees);
    } catch (error) {
      console.error('Error in event cancellation workflow:', error);
      return {
        success: false,
        error: error.message,
        notificationsSent: 0,
      };
    }
  }
}

export const eventCancellationNotifications = new EventCancellationNotificationService();
