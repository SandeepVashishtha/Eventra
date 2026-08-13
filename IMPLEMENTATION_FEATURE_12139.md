# Feature #12139: "Send Test Email" Button for Custom Notifications

## Overview

This implementation adds a "Send Test Email" button to notification configuration panels, allowing organizers to preview how custom email templates will look before sending them to attendees. This prevents embarrassing formatting mistakes in mass communications.

## Problem Statement

Organizers can write custom email copy for Event Cancellation or Waitlist promotions, but they have no way to see what the email will actually look like (with their logo and colors) before blasting it out to 1,000 attendees.

## Solution

Added a "Send Test Email" button in the notification configuration panel. When clicked, it instantly sends a rendered copy of the email template (populated with dummy attendee data) directly to the organizer's own email address.

## Implementation Details

### Frontend Components

#### 1. EmailTemplateConfig.jsx (`src/components/events/EmailTemplateConfig.jsx`)
- **Purpose**: Main component for configuring custom email templates
- **Features**:
  - Textarea for editing custom email templates
  - "Send Test Email" button that sends a test email to the organizer
  - "Save Template" button to save custom templates for reuse
  - "Reset to Default" button to restore the default template
  - Placeholder help text showing available template variables
  - Real-time preview functionality
  - Loading states and error handling

#### 2. EventCancellationWithEmailPreview.jsx (`src/components/events/EventCancellationWithEmailPreview.jsx`)
- **Purpose**: Enhanced event cancellation modal with email template configuration
- **Features**:
  - Integrates EmailTemplateConfig into the cancellation workflow
  - Collapsible email configuration section
  - Maintains all existing cancellation functionality
  - Allows organizers to customize email before cancelling event

#### 3. useEmailTemplates.js (`src/hooks/useEmailTemplates.js`)
- **Purpose**: Custom hook for managing email templates
- **Features**:
  - Functions for getting, saving, and sending test emails
  - Template rendering with placeholder replacement
  - Default templates for different notification types
  - State management for templates and loading states

### Backend Components

#### 1. Controller Layer

**NotificationController.java** (`Backend/src/main/java/com/sandeep/eventrabackend/controller/NotificationController.java`)
- Added new endpoints:
  - `POST /api/notifications/send-test-email` - Send test email to organizer
  - `POST /api/notifications/save-template` - Save custom email template
  - `GET /api/notifications/templates/{eventId}/{templateType}` - Get saved template

#### 2. Service Layer

**EmailTemplateService.java** (`Backend/src/main/java/com/sandeep/eventrabackend/service/EmailTemplateService.java`)
- **Purpose**: Core service for managing email templates and sending test emails
- **Features**:
  - Template rendering with placeholder replacement
  - Test email sending functionality
  - Template saving and retrieval
  - Default templates for different notification types
  - Support for multiple template types (cancellation, waitlist_promotion)

**EmailSender.java** (`Backend/src/main/java/com/sandeep/eventrabackend/util/EmailSender.java`)
- **Purpose**: Utility class for sending emails
- **Features**:
  - Simple interface for sending emails
  - Support for both HTML and plain text emails
  - Mock implementation for development/testing
  - Ready for integration with real email services (SendGrid, AWS SES, SMTP)

#### 3. Data Access Layer

**EmailTemplateRepository.java** (`Backend/src/main/java/com/sandeep/eventrabackend/repository/EmailTemplateRepository.java`)
- **Purpose**: JPA repository for storing custom email templates
- **Features**:
  - CRUD operations for email templates
  - Query methods for finding templates by event, type, and organizer
  - Support for template management per organizer

**EmailTemplate.java** (`Backend/src/main/java/com/sandeep/eventrabackend/model/EmailTemplate.java`)
- **Purpose**: Entity class for email templates
- **Features**:
  - Stores template content, type, event ID, and organizer email
  - Timestamps for creation and updates
  - JPA entity with proper mappings

#### 4. DTO Classes

- **TestEmailRequest.java** - Request DTO for sending test emails
- **SaveTemplateRequest.java** - Request DTO for saving templates
- **TestEmailResponse.java** - Response DTO for test email results
- **TemplateResponse.java** - Response DTO for template operations

### Configuration

#### API Endpoints (`src/config/api.js`)
Added new endpoints to the NOTIFICATIONS configuration:
```javascript
NOTIFICATIONS: {
  // ... existing endpoints
  TEST_EMAIL: buildApiUrl("/notifications/send-test-email"),
  SAVE_TEMPLATE: buildApiUrl("/notifications/save-template"),
  GET_TEMPLATE: (eventId, templateType) => buildApiUrl(`/notifications/templates/${eventId}/${templateType}`),
}
```

### Template Placeholders

The following placeholders are supported in email templates:

- `{attendeeName}` - Attendee's full name
- `{firstName}` - Attendee's first name
- `{lastName}` - Attendee's last name
- `{attendeeEmail}` - Attendee's email address
- `{eventTitle}` - Event title
- `{eventDate}` - Event date
- `{eventTime}` - Event time
- `{location}` - Event location
- `{refundDeadline}` - Refund deadline
- `{organizerEmail}` - Organizer's email address

### Template Types

Currently supports two template types:

1. **cancellation** - For event cancellation notifications
2. **waitlist_promotion** - For waitlist promotion notifications

## Usage Examples

### Using EmailTemplateConfig Component

```jsx
import EmailTemplateConfig from 'components/events/EmailTemplateConfig';

const MyEventSettings = ({ event }) => {
  const handleTemplateSave = (savedTemplate) => {
    console.log('Template saved:', savedTemplate);
  };

  return (
    <div>
      <h2>Event Notifications</h2>
      <EmailTemplateConfig
        eventId={event.id}
        templateType="cancellation"
        event={event}
        defaultTemplate={DEFAULT_CANCELLATION_TEMPLATE}
        onTemplateSave={handleTemplateSave}
        organizerEmail={user?.email}
      />
    </div>
  );
};
```

### Using the useEmailTemplates Hook

```jsx
import useEmailTemplates from 'hooks/useEmailTemplates';

const MyComponent = ({ event }) => {
  const { 
    templates, 
    isLoading, 
    error, 
    getTemplate, 
    saveTemplate, 
    sendTestEmail,
    getDefaultTemplate,
    renderTemplate
  } = useEmailTemplates(event.id, user?.email);

  const handleSendTest = async () => {
    const success = await sendTestEmail(
      'cancellation',
      event,
      customTemplate
    );
    if (success) {
      // Test email sent successfully
    }
  };

  return (
    <button onClick={handleSendTest}>
      Send Test Email
    </button>
  );
};
```

### Backend API Usage

#### Send Test Email

```bash
POST /api/notifications/send-test-email
Content-Type: application/json

{
  "eventId": "123",
  "templateType": "cancellation",
  "event": {
    "id": "123",
    "title": "Test Event",
    "eventDate": "2026-12-25",
    "eventTime": "10:00 AM",
    "location": "Conference Center",
    "organizerEmail": "organizer@test.com",
    "refundDeadline": "2027-01-10"
  },
  "attendee": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@test.com"
  },
  "customTemplate": "Dear {attendeeName}, the event {eventTitle} has been cancelled.",
  "recipientEmail": "organizer@test.com",
  "isTest": true
}
```

#### Save Template

```bash
POST /api/notifications/save-template
Content-Type: application/json

{
  "eventId": "123",
  "templateType": "cancellation",
  "template": "Custom email template content with {placeholders}"
}
```

#### Get Template

```bash
GET /api/notifications/templates/123/cancellation
```

## Database Schema

The implementation adds a new table `email_templates` with the following schema:

```sql
CREATE TABLE email_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id VARCHAR(255) NOT NULL,
    organizer_email VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    template_content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    
    INDEX idx_email_templates_event_organizer (event_id, organizer_email),
    INDEX idx_email_templates_type (template_type)
);
```

## Security Considerations

- All endpoints require authentication (`@PreAuthorize("isAuthenticated()")`)
- Organizer email is used to ensure users can only access their own templates
- Template content is validated before saving
- Email sending includes proper error handling

## Error Handling

- Frontend: Shows user-friendly error messages with toast notifications
- Backend: Returns appropriate HTTP status codes and error messages
- Database: Uses transactions for data consistency

## Testing

### Backend Tests

**EmailTemplateServiceTest.java** (`Backend/src/test/java/com/sandeep/eventrabackend/service/EmailTemplateServiceTest.java`)
- Tests for sending test emails
- Tests for saving and retrieving templates
- Tests for template rendering with placeholders
- Tests for error handling

### Frontend Tests

**EmailTemplateConfig.test.jsx** (`src/components/events/EmailTemplateConfig.test.jsx`)
- Tests for component rendering
- Tests for template editing
- Tests for button interactions
- Tests for API integration
- Tests for error handling

## Integration with Existing Features

### Event Cancellation
The `EventCancellationWithEmailPreview` component integrates with the existing event cancellation workflow:
- Maintains all existing cancellation functionality
- Adds optional email template customization
- Allows organizers to preview emails before cancelling

### Waitlist Management
The same `EmailTemplateConfig` component can be used with `templateType="waitlist_promotion"` for waitlist notification customization.

## Future Enhancements

1. **HTML Email Support**: Add support for HTML email templates with rich formatting
2. **Email Preview Pane**: Add a side-by-side HTML preview in the browser
3. **Template Library**: Allow organizers to create and share template libraries
4. **Multi-language Templates**: Support for templates in different languages
5. **Email Themes**: Support for different email themes and branding
6. **Attachment Support**: Allow adding attachments to notification emails

## Deployment Notes

1. **Database Migration**: Run the database migration to create the `email_templates` table
2. **Email Service Configuration**: Configure the `EmailSender` with actual email service credentials
3. **API Documentation**: Update API documentation to include new endpoints
4. **Frontend Routes**: Ensure the new components are properly integrated into the application routes

## Files Changed

### Frontend Files
- `src/components/events/EmailTemplateConfig.jsx` (new)
- `src/components/events/EventCancellationWithEmailPreview.jsx` (new)
- `src/hooks/useEmailTemplates.js` (new)
- `src/components/events/EmailTemplateConfig.test.jsx` (new)
- `src/config/api.js` (modified)

### Backend Files
- `Backend/src/main/java/com/sandeep/eventrabackend/controller/NotificationController.java` (modified)
- `Backend/src/main/java/com/sandeep/eventrabackend/service/EmailTemplateService.java` (new)
- `Backend/src/main/java/com/sandeep/eventrabackend/util/EmailSender.java` (new)
- `Backend/src/main/java/com/sandeep/eventrabackend/model/EmailTemplate.java` (new)
- `Backend/src/main/java/com/sandeep/eventrabackend/repository/EmailTemplateRepository.java` (new)
- `Backend/src/main/java/com/sandeep/eventrabackend/dto/request/TestEmailRequest.java` (new)
- `Backend/src/main/java/com/sandeep/eventrabackend/dto/request/SaveTemplateRequest.java` (new)
- `Backend/src/main/java/com/sandeep/eventrabackend/dto/response/TestEmailResponse.java` (new)
- `Backend/src/main/java/com/sandeep/eventrabackend/dto/response/TemplateResponse.java` (new)
- `Backend/src/test/java/com/sandeep/eventrabackend/service/EmailTemplateServiceTest.java` (new)

## Compliance

- **GDPR**: Respects email preferences and data protection
- **CAN-SPAM**: Includes proper email headers and unsubscribe information
- **Accessibility**: Follows WCAG guidelines for form accessibility
- **Data Protection**: No sensitive data in email headers

## Benefits

1. **Prevents Errors**: Organizers can preview emails before sending to all attendees
2. **Customization**: Full control over email content and formatting
3. **Efficiency**: Saves time by allowing template reuse across events
4. **Confidence**: Builds organizer confidence in mass communications
5. **Professionalism**: Ensures professional-looking communications to attendees

---

**Feature Request**: #12139
**Status**: Implemented
**Date**: 2026-08-12
