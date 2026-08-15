package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.TestEmailRequest;
import com.sandeep.eventrabackend.dto.request.SaveTemplateRequest;
import com.sandeep.eventrabackend.dto.response.TestEmailResponse;
import com.sandeep.eventrabackend.dto.response.TemplateResponse;
import com.sandeep.eventrabackend.model.EmailTemplate;
import com.sandeep.eventrabackend.repository.EmailTemplateRepository;
import com.sandeep.eventrabackend.util.EmailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service for managing custom email templates and sending test emails.
 * Provides functionality for organizers to create, save, and test email templates.
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */
@Service
@Transactional
public class EmailTemplateService {

    private final EmailTemplateRepository emailTemplateRepository;
    private final EmailSender emailSender;

    public EmailTemplateService(EmailTemplateRepository emailTemplateRepository,
                               EmailSender emailSender) {
        this.emailTemplateRepository = emailTemplateRepository;
        this.emailSender = emailSender;
    }

    /**
     * Send a test email to the organizer with the provided template.
     *
     * <p>The recipient is always the authenticated organizer's own email; any
     * caller-supplied recipient is ignored so the endpoint can never be used as
     * an open relay to arbitrary addresses (#16253).</p>
     */
    public TestEmailResponse sendTestEmail(TestEmailRequest request, String organizerEmail) {
        if (request == null || request.getTemplateType() == null) {
            throw new IllegalArgumentException("Invalid template type");
        }
        String type = request.getTemplateType();
        if (!type.equals("waitlist_promotion") && !type.equals("cancellation")) {
            throw new IllegalArgumentException("Invalid template type");
        }
        try {
            // Replace placeholders in the template with actual data
            String renderedContent = renderTemplate(request.getCustomTemplate(), 
                                                   request.getEvent(), 
                                                   request.getAttendee());

            // Generate a test subject
            String subject = generateSubject(request.getTemplateType(), request.getEvent());

            // Send the email using the email sender. The recipient is pinned to
            // the authenticated organizer — request.getRecipientEmail() is never
            // trusted, preventing arbitrary-recipient phishing relays.
            // Both header-derived values (recipient + subject) are sanitized to
            // strip CR/LF and prevent email header injection (#18804).
            String messageId = emailSender.sendEmail(
                    sanitizeHeaderValue(organizerEmail),
                    subject,
                    renderedContent,
                    true // isHtml
            );

            return new TestEmailResponse(
                    true,
                    messageId,
                    organizerEmail,
                    request.getTemplateType(),
                    request.getEventId(),
                    "Test email sent successfully"
            );
        } catch (Exception e) {
            return new TestEmailResponse(
                    false,
                    null,
                    organizerEmail,
                    request.getTemplateType(),
                    request.getEventId(),
                    "Failed to send test email: " + e.getMessage()
            );
        }
    }

    /**
     * Save a custom email template
     */
    public TemplateResponse saveTemplate(SaveTemplateRequest request, String organizerEmail) {
        try {
            // Check if template already exists
            EmailTemplate existingTemplate = emailTemplateRepository
                    .findByEventIdAndTemplateTypeAndOrganizerEmail(
                            request.getEventId(),
                            request.getTemplateType(),
                            organizerEmail)
                    .orElse(null);

            EmailTemplate template;
            if (existingTemplate != null) {
                // Update existing template
                existingTemplate.setTemplateContent(request.getTemplate());
                template = emailTemplateRepository.save(existingTemplate);
            } else {
                // Create new template
                template = emailTemplateRepository.save(new EmailTemplate(
                        request.getEventId(),
                        organizerEmail,
                        request.getTemplateType(),
                        request.getTemplate()
                ));
            }

            return new TemplateResponse(
                    true,
                    template.getEventId(),
                    template.getTemplateType(),
                    template.getTemplateContent(),
                    "Template saved successfully"
            );
        } catch (Exception e) {
            return new TemplateResponse(
                    false,
                    request.getEventId(),
                    request.getTemplateType(),
                    null,
                    "Failed to save template: " + e.getMessage()
            );
        }
    }

    /**
     * Get a custom email template
     */
    @Transactional(readOnly = true)
    public TemplateResponse getTemplate(String eventId, String templateType, String organizerEmail) {
        try {
            EmailTemplate template = emailTemplateRepository
                    .findByEventIdAndTemplateTypeAndOrganizerEmail(eventId, templateType, organizerEmail)
                    .orElse(null);

            if (template != null) {
                return new TemplateResponse(
                        true,
                        template.getEventId(),
                        template.getTemplateType(),
                        template.getTemplateContent(),
                        "Template retrieved successfully"
                );
            } else {
                return new TemplateResponse(
                        false,
                        eventId,
                        templateType,
                        null,
                        "Template not found"
                );
            }
        } catch (Exception e) {
            return new TemplateResponse(
                    false,
                    eventId,
                    templateType,
                    null,
                    "Failed to retrieve template: " + e.getMessage()
            );
        }
    }

    /**
     * Render the template by replacing placeholders with actual data
     */
    private String renderTemplate(String template, Map<String, Object> event, Map<String, Object> attendee) {
        if (template == null || template.isEmpty()) {
            return "";
        }

        String content = template;
        
        // Replace event placeholders
        if (event != null) {
            content = content.replace("{eventTitle}", escapeHtml(String.valueOf(event.getOrDefault("title", "Event"))));
            content = content.replace("{eventDate}", escapeHtml(String.valueOf(event.getOrDefault("eventDate", "N/A"))));
            content = content.replace("{eventTime}", escapeHtml(String.valueOf(event.getOrDefault("eventTime", "N/A"))));
            content = content.replace("{location}", escapeHtml(String.valueOf(event.getOrDefault("location", "TBD"))));
            content = content.replace("{refundDeadline}", escapeHtml(String.valueOf(event.getOrDefault("refundDeadline", "N/A"))));
            content = content.replace("{organizerEmail}", sanitizeUrl(String.valueOf(event.getOrDefault("organizerEmail", "support@eventra.com"))));
        }

        // Replace attendee placeholders
        if (attendee != null) {
            String firstName = escapeHtml(String.valueOf(attendee.getOrDefault("firstName", "Attendee")));
            String lastName = escapeHtml(String.valueOf(attendee.getOrDefault("lastName", "")));
            String fullName = (firstName + " " + lastName).trim();
            
            content = content.replace("{attendeeName}", fullName.isEmpty() ? "Attendee" : fullName);
            content = content.replace("{firstName}", firstName);
            content = content.replace("{lastName}", lastName);
            content = content.replace("{attendeeEmail}", sanitizeUrl(String.valueOf(attendee.getOrDefault("email", ""))));
        }

        return content;
    }

    /**
     * Escape HTML special characters to prevent stored XSS when interpolating
     * user-controlled values into an HTML email body. Handles null safely.
     */
    private String escapeHtml(String s) {
        if (s == null) {
            return "";
        }
        StringBuilder out = new StringBuilder(s.length());
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '&':
                    out.append("&amp;");
                    break;
                case '<':
                    out.append("&lt;");
                    break;
                case '>':
                    out.append("&gt;");
                    break;
                case '"':
                    out.append("&quot;");
                    break;
                case '\'':
                    out.append("&#x27;");
                    break;
                default:
                    out.append(c);
            }
        }
        return out.toString();
    }

    /**
     * Sanitize a URL before placing it into an href/src attribute. Only http(s)
     * and mailto schemes are allowed; any other scheme (e.g. javascript:) is
     * replaced with a safe fallback ("#") to prevent URL-based XSS. The result
     * is also HTML-escaped.
     */
    private String sanitizeUrl(String url) {
        if (url == null) {
            return "#";
        }
        String trimmed = url.trim();
        if (trimmed.isEmpty()) {
            return "#";
        }
        int colon = trimmed.indexOf(':');
        if (colon > 0 && colon < 32) {
            String scheme = trimmed.substring(0, colon).toLowerCase();
            if (!scheme.equals("http") && !scheme.equals("https") && !scheme.equals("mailto")) {
                return "#";
            }
        }
        return escapeHtml(trimmed);
    }

    /**
     * Sanitize a value destined for an email header (e.g. Subject, recipient name)
     * so that CR/LF sequences cannot be interpreted as header separators and used
     * for header injection. The body is HTML-escaped separately.
     */
    private static String sanitizeHeaderValue(String v) {
        return v == null ? "" : v.replaceAll("[\r\n]+", " ").trim();
    }

    /**
     * Generate subject based on template type
     */
    private String generateSubject(String templateType, Map<String, Object> event) {
        String eventTitle = sanitizeHeaderValue(
                event != null ? String.valueOf(event.getOrDefault("title", "Event")) : "Event");

        switch (templateType) {
            case "waitlist_promotion":
                return "Good News! You've been promoted from the waitlist for " + eventTitle;
            case "cancellation":
            default:
                return "Event Cancelled: " + eventTitle;
        }
    }

    /**
     * Get default template for a specific type
     */
    public String getDefaultTemplate(String templateType) {
        switch (templateType) {
            case "waitlist_promotion":
                return "Dear {attendeeName},\n\n" +
                       "We're excited to inform you that a spot has opened up for:\n\n" +
                       "Event: {eventTitle}\n" +
                       "Date: {eventDate} at {eventTime}\n" +
                       "Location: {location}\n\n" +
                       "You have been promoted from the waitlist to a confirmed attendee!\n\n" +
                       "Please respond promptly to secure your spot.\n\n" +
                       "If you have any questions, please contact the organizer at {organizerEmail}.\n\n" +
                       "Best regards,\n" +
                       "Eventra Team\n\n" +
                       "This is an automated message. Please do not reply to this email.";
            
            case "cancellation":
            default:
                return "Dear {attendeeName},\n\n" +
                       "We regret to inform you that the following event has been cancelled:\n\n" +
                       "Event: {eventTitle}\n" +
                       "Original Date: {eventDate} at {eventTime}\n" +
                       "Location: {location}\n\n" +
                       "Impact on Your Registration:\n" +
                       "- Your registration for this event has been cancelled.\n" +
                       "- If you paid an entry fee, you are eligible for a full refund.\n" +
                       "- Refund deadline: {refundDeadline}\n\n" +
                       "Next Steps:\n" +
                       "1. Check your email for refund instructions\n" +
                       "2. If you have any questions, please contact the event organizer: {organizerEmail}\n" +
                       "3. Your registration details have been preserved for reference\n\n" +
                       "We apologize for any inconvenience this may cause. We appreciate your understanding.\n\n" +
                       "Best regards,\n" +
                       "Eventra Team\n\n" +
                       "This is an automated message. Please do not reply to this email.";
        }
    }
}
