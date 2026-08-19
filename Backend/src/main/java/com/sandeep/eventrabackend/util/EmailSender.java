package com.sandeep.eventrabackend.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Utility class for sending emails.
 * Provides a simple interface for sending test and notification emails.
 * This is a basic implementation that can be extended to integrate with actual
 * email services like SendGrid, AWS SES, or SMTP.
 * 
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */
@Component
@Slf4j
public class EmailSender {

    private static final java.util.regex.Pattern EMAIL_PATTERN =
            java.util.regex.Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    /**
     * Send an email with the specified parameters
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param body Email body content (can be plain text or HTML)
     * @param isHtml Whether the body is HTML (true) or plain text (false)
     * @return A message ID or tracking identifier, or null if sending failed
     */
    public String sendEmail(String to, String subject, String body, boolean isHtml) {
        // In a production environment, this would integrate with an actual email service
        // For now, we'll simulate successful sending and log the details
        
        try {
            // Validate inputs
            if (to == null || to.isBlank()) {
                throw new IllegalArgumentException("Recipient email cannot be empty");
            }

            if (!EMAIL_PATTERN.matcher(to).matches()) {
                throw new IllegalArgumentException("Recipient email is not a valid address: " + to);
            }

            if (subject == null || subject.isBlank()) {
                throw new IllegalArgumentException("Subject cannot be empty");
            }

            if (body == null || body.isBlank()) {
                throw new IllegalArgumentException("Body cannot be empty");
            }

            // This is a mock sender with no real transport: do NOT fabricate a
            // message id and do NOT report delivery as successful. Returning null
            // honestly signals that no message was actually delivered, and the
            // caller's "non-null == delivered" assumption is no longer misled.
            log.info("Email dispatch requested to: {}, subject: {}, isHtml: {}", to, subject, isHtml);
            return null;
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }

    /**
     * Send a plain text email
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param body Plain text email body
     * @return A message ID or null if sending failed
     */
    public String sendPlainTextEmail(String to, String subject, String body) {
        return sendEmail(to, subject, body, false);
    }

    /**
     * Send an HTML email
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param htmlBody HTML email body
     * @return A message ID or null if sending failed
     */
    public String sendHtmlEmail(String to, String subject, String htmlBody) {
        return sendEmail(to, subject, htmlBody, true);
    }
}
