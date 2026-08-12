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
     * Send a test email to the organizer with the provided template
     */
    public TestEmailResponse sendTestEmail(TestEmailRequest request, String organizerEmail) {
        try {
            // Replace placeholders in the template with actual data
            String renderedContent = renderTemplate(request.getCustomTemplate(), 
                                                   request.getEvent(), 
                                                   request.getAttendee());

            // Generate a test subject
            String subject = generateSubject(request.getTemplateType(), request.getEvent());

            // Send the email using the email sender
            String messageId = emailSender.sendEmail(
                    request.getRecipientEmail(),
                    subject,
                    renderedContent,
                    true // isHtml
            );

            return new TestEmailResponse(
                    true,
                    messageId,
                    request.getRecipientEmail(),
                    request.getTemplateType(),
                    request.getEventId(),
                    "Test email sent successfully"
            );
        } catch (Exception e) {
            return new TestEmailResponse(
                    false,
                    null,
                    request.getRecipientEmail(),
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
            content = content.replace("{eventTitle}", String.valueOf(event.getOrDefault("title", "Event")));
            content = content.replace("{eventDate}", String.valueOf(event.getOrDefault("eventDate", "N/A")));
            content = content.replace("{eventTime}", String.valueOf(event.getOrDefault("eventTime", "N/A")));
            content = content.replace("{location}", String.valueOf(event.getOrDefault("location", "TBD")));
            content = content.replace("{refundDeadline}", String.valueOf(event.getOrDefault("refundDeadline", "N/A")));
            content = content.replace("{organizerEmail}", String.valueOf(event.getOrDefault("organizerEmail", "support@eventra.com")));
        }

        // Replace attendee placeholders
        if (attendee != null) {
            String firstName = String.valueOf(attendee.getOrDefault("firstName", "Attendee"));
            String lastName = String.valueOf(attendee.getOrDefault("lastName", ""));
            String fullName = (firstName + " " + lastName).trim();
            
            content = content.replace("{attendeeName}", fullName.isEmpty() ? "Attendee" : fullName);
            content = content.replace("{firstName}", firstName);
            content = content.replace("{lastName}", lastName);
            content = content.replace("{attendeeEmail}", String.valueOf(attendee.getOrDefault("email", "")));
        }

        return content;
    }

    /**
     * Generate subject based on template type
     */
    private String generateSubject(String templateType, Map<String, Object> event) {
        String eventTitle = event != null ? String.valueOf(event.getOrDefault("title", "Event")) : "Event";
        
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
