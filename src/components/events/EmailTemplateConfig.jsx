/**
 * EmailTemplateConfig.jsx
 * 
 * Component for configuring custom email templates with "Send Test Email" functionality.
 * Allows organizers to write custom email copy for Event Cancellation or Waitlist promotions
 * and test how it will look by sending a rendered copy to their own email address.
 * 
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */

import { useState, useCallback } from 'react';
import { Mail, Send, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiUtils, API_ENDPOINTS } from '../../config/api';

/**
 * EmailTemplateConfig Component
 * 
 * @param {Object} props
 * @param {string} props.eventId - The event ID
 * @param {'cancellation' | 'waitlist_promotion'} props.templateType - Type of email template
 * @param {Object} props.event - Event details
 * @param {string} props.defaultTemplate - Default template content
 * @param {Function} props.onTemplateSave - Callback when template is saved
 * @param {string} props.organizerEmail - Organizer's email address (optional, defaults to current user)
 */
const EmailTemplateConfig = ({
  eventId,
  templateType = 'cancellation',
  event = {},
  defaultTemplate = '',
  onTemplateSave,
  organizerEmail: organizerEmailProp,
}) => {
  const [customTemplate, setCustomTemplate] = useState(defaultTemplate);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [error, setError] = useState(null);

  // Generate dummy attendee data for testing
  const getDummyAttendeeData = useCallback(() => {
    const dummyAttendees = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
      { firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com' },
    ];
    return dummyAttendees[Math.floor(Math.random() * dummyAttendees.length)];
  }, []);

  // Get organizer's email (either from props or context)
  const getOrganizerEmail = useCallback(async () => {
    if (organizerEmailProp) {
      return organizerEmailProp;
    }
    
    // Try to get from context/auth
    try {
      // This would be replaced with actual auth context in a real implementation
      const userResponse = await apiUtils.get(API_ENDPOINTS.USER.ME);
      return userResponse.data?.email;
    } catch (err) {
      console.warn('Could not fetch organizer email:', err);
      return null;
    }
  }, [organizerEmailProp]);

  /**
   * Send test email to organizer
   */
  const handleSendTestEmail = useCallback(async () => {
    try {
      setIsSendingTest(true);
      setError(null);
      setTestEmailSent(false);

      const organizerEmail = await getOrganizerEmail();
      
      if (!organizerEmail) {
        setError('Unable to determine your email address. Please ensure you are logged in.');
        setIsSendingTest(false);
        return;
      }

      // Get dummy attendee data
      const dummyAttendee = getDummyAttendeeData();

      // Prepare test email payload
      const payload = {
        eventId,
        templateType,
        event: {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          location: event.location,
          organizerEmail: event.organizerEmail || organizerEmail,
          refundDeadline: event.refundDeadline,
        },
        attendee: dummyAttendee,
        customTemplate: customTemplate || defaultTemplate,
        recipientEmail: organizerEmail, // Send to organizer
        isTest: true,
      };

      // Call API to send test email
      const response = await apiUtils.post(
        API_ENDPOINTS.NOTIFICATIONS.TEST_EMAIL,
        payload
      );

      if (response.data?.success) {
        setTestEmailSent(true);
        toast.success(`Test email sent to ${organizerEmail}! Check your inbox.`);
        
        // Clear the test email sent flag after 5 seconds
        setTimeout(() => setTestEmailSent(false), 5000);
      } else {
        setError(response.data?.message || 'Failed to send test email');
        toast.error('Failed to send test email');
      }
    } catch (err) {
      console.error('Error sending test email:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send test email');
      toast.error('Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  }, [eventId, templateType, event, customTemplate, defaultTemplate, getDummyAttendeeData, getOrganizerEmail]);

  /**
   * Save the custom template
   */
  const handleSaveTemplate = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        eventId,
        templateType,
        template: customTemplate,
      };

      // Call API to save template
      const response = await apiUtils.post(
        API_ENDPOINTS.NOTIFICATIONS.SAVE_TEMPLATE,
        payload
      );

      if (response.data?.success) {
        toast.success('Email template saved successfully!');
        onTemplateSave?.(customTemplate);
      } else {
        setError(response.data?.message || 'Failed to save template');
        toast.error('Failed to save template');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save template');
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  }, [eventId, templateType, customTemplate, onTemplateSave]);

  /**
   * Reset to default template
   */
  const handleResetToDefault = useCallback(() => {
    setCustomTemplate(defaultTemplate);
    setError(null);
    toast.info('Reset to default template');
  }, [defaultTemplate]);

  // Determine template label based on type
  const getTemplateLabel = () => {
    switch (templateType) {
      case 'waitlist_promotion':
        return 'Waitlist Promotion Email';
      case 'cancellation':
      default:
        return 'Event Cancellation Email';
    }
  };

  // Help text based on template type
  const getHelpText = () => {
    switch (templateType) {
      case 'waitlist_promotion':
        return 'Customize the email sent when promoting users from the waitlist. Use {attendeeName}, {eventTitle}, and other placeholders.';
      case 'cancellation':
      default:
        return 'Customize the email sent when an event is cancelled. Use {attendeeName}, {eventTitle}, {refundDeadline}, and other placeholders.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Custom {getTemplateLabel()} Template
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {getHelpText()}
          </p>
        </div>
      </div>

      {/* Template Editor */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Content
        </label>
        
        <textarea
          value={customTemplate || defaultTemplate}
          onChange={(e) => {
            setCustomTemplate(e.target.value);
            setTestEmailSent(false);
          }}
          rows={12}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          placeholder="Enter your custom email template here...\n\nUse placeholders like:\n- {attendeeName}\n- {eventTitle}\n- {eventDate}\n- {eventTime}\n- {location}\n- {refundDeadline}"
        />

        {/* Placeholder Help */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Available placeholders: {`{attendeeName}`, `{eventTitle}`, `{eventDate}`, `{eventTime}`, `{location}`, `{refundDeadline}`}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <X className="inline h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {testEmailSent && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
          <Check className="inline h-4 w-4 mr-2" />
          Test email sent successfully! Check your inbox to see how it looks.
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSendTestEmail}
          disabled={isSendingTest || !customTemplate?.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingTest ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Test Email
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSaveTemplate}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 transition hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save Template
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleResetToDefault}
          disabled={!customTemplate || customTemplate === defaultTemplate}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4" />
          Reset to Default
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
        <Mail className="inline h-4 w-4 mr-2" />
        <strong>Why test?</strong> Email clients (like Outlook or Gmail) render HTML differently. 
        Sending a test email to your own inbox lets you see exactly how attendees will see it.
      </div>
    </div>
  );
};

export default EmailTemplateConfig;
