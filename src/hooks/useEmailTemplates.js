/**
 * useEmailTemplates.js
 * 
 * Custom hook for managing email templates and sending test emails.
 * Provides functionality for organizers to create, save, and test email templates.
 * 
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { apiUtils, API_ENDPOINTS } from '../config/api';

/**
 * Default email templates for different notification types
 */
const DEFAULT_TEMPLATES = {
  cancellation: `Dear {attendeeName},

We regret to inform you that the following event has been cancelled:

Event: {eventTitle}
Original Date: {eventDate} at {eventTime}
Location: {location}

Impact on Your Registration:
- Your registration for this event has been cancelled.
- If you paid an entry fee, you are eligible for a full refund.
- Refund deadline: {refundDeadline}

Next Steps:
1. Check your email for refund instructions
2. If you have any questions, please contact the event organizer: {organizerEmail}
3. Your registration details have been preserved for reference

We apologize for any inconvenience this may cause. We appreciate your understanding.

Best regards,
Eventra Team

This is an automated message. Please do not reply to this email.`,

  waitlist_promotion: `Dear {attendeeName},

We're excited to inform you that a spot has opened up for:

Event: {eventTitle}
Date: {eventDate} at {eventTime}
Location: {location}

You have been promoted from the waitlist to a confirmed attendee!

Please respond promptly to secure your spot.

If you have any questions, please contact the organizer at {organizerEmail}.

Best regards,
Eventra Team

This is an automated message. Please do not reply to this email.`
};

/**
 * useEmailTemplates Hook
 * 
 * @param {string} eventId - The event ID
 * @param {string} organizerEmail - The organizer's email address (optional)
 * @returns {Object} - Functions and state for managing email templates
 */
export const useEmailTemplates = (eventId, organizerEmail = null) => {
  const [templates, setTemplates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get a template for a specific type
   */
  const getTemplate = useCallback(async (templateType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiUtils.get(
        API_ENDPOINTS.NOTIFICATIONS.GET_TEMPLATE(eventId, templateType)
      );

      if (response.data?.success) {
        return response.data.template || DEFAULT_TEMPLATES[templateType];
      } else {
        // Return default template if custom one not found
        return DEFAULT_TEMPLATES[templateType];
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError(err.message || 'Failed to fetch template');
      // Return default template on error
      return DEFAULT_TEMPLATES[templateType];
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  /**
   * Save a custom template
   */
  const saveTemplate = useCallback(async (templateType, templateContent) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        eventId,
        templateType,
        template: templateContent,
      };

      const response = await apiUtils.post(
        API_ENDPOINTS.NOTIFICATIONS.SAVE_TEMPLATE,
        payload
      );

      if (response.data?.success) {
        setTemplates(prev => ({
          ...prev,
          [templateType]: templateContent,
        }));
        toast.success('Email template saved successfully!');
        return true;
      } else {
        setError(response.data?.message || 'Failed to save template');
        toast.error('Failed to save template');
        return false;
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save template');
      toast.error('Failed to save template');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  /**
   * Send a test email
   */
  const sendTestEmail = useCallback(async (templateType, event, customTemplate) => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate dummy attendee data
      const dummyAttendee = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      };

      // Use provided organizer email or try to get from context
      const recipientEmail = organizerEmail || (await getCurrentUserEmail());
      
      if (!recipientEmail) {
        setError('Unable to determine your email address');
        toast.error('Unable to determine your email address');
        setIsLoading(false);
        return false;
      }

      const payload = {
        eventId,
        templateType,
        event: {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          location: event.location,
          organizerEmail: event.organizerEmail || recipientEmail,
          refundDeadline: event.refundDeadline,
        },
        attendee: dummyAttendee,
        customTemplate: customTemplate || DEFAULT_TEMPLATES[templateType],
        recipientEmail,
        isTest: true,
      };

      const response = await apiUtils.post(
        API_ENDPOINTS.NOTIFICATIONS.TEST_EMAIL,
        payload
      );

      if (response.data?.success) {
        toast.success(`Test email sent to ${recipientEmail}! Check your inbox.`);
        return true;
      } else {
        setError(response.data?.message || 'Failed to send test email');
        toast.error('Failed to send test email');
        return false;
      }
    } catch (err) {
      console.error('Error sending test email:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send test email');
      toast.error('Failed to send test email');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [eventId, organizerEmail]);

  /**
   * Get current user's email from context/API
   */
  const getCurrentUserEmail = useCallback(async () => {
    try {
      // This would be replaced with actual auth context in a real implementation
      const userResponse = await apiUtils.get(API_ENDPOINTS.USERS.PROFILE);
      return userResponse.data?.email;
    } catch (err) {
      console.warn('Could not fetch current user email:', err);
      return null;
    }
  }, []);

  /**
   * Get default template for a specific type
   */
  const getDefaultTemplate = useCallback((templateType) => {
    return DEFAULT_TEMPLATES[templateType] || '';
  }, []);

  /**
   * Render template with placeholders replaced by actual data
   */
  const renderTemplate = useCallback((template, event, attendee) => {
    if (!template) return '';

    let content = template;

    // Replace event placeholders
    if (event) {
      content = content.replace(/\{eventTitle\}/g, event.title || 'Event');
      content = content.replace(/\{eventDate\}/g, event.eventDate || 'N/A');
      content = content.replace(/\{eventTime\}/g, event.eventTime || 'N/A');
      content = content.replace(/\{location\}/g, event.location || 'TBD');
      content = content.replace(/\{refundDeadline\}/g, event.refundDeadline || 'N/A');
      content = content.replace(/\{organizerEmail\}/g, event.organizerEmail || 'support@eventra.com');
    }

    // Replace attendee placeholders
    if (attendee) {
      const fullName = `${attendee.firstName || ''} ${attendee.lastName || ''}`.trim() || 'Attendee';
      content = content.replace(/\{attendeeName\}/g, fullName);
      content = content.replace(/\{firstName\}/g, attendee.firstName || 'Attendee');
      content = content.replace(/\{lastName\}/g, attendee.lastName || '');
      content = content.replace(/\{attendeeEmail\}/g, attendee.email || '');
    }

    return content;
  }, []);

  return {
    templates,
    isLoading,
    error,
    getTemplate,
    saveTemplate,
    sendTestEmail,
    getDefaultTemplate,
    renderTemplate,
    DEFAULT_TEMPLATES,
  };
};

export default useEmailTemplates;
