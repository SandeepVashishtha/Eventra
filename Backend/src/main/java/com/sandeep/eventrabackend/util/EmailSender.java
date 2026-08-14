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
            
            if (subject == null || subject.isBlank()) {
                throw new IllegalArgumentException("Subject cannot be empty");
            }
            
            if (body == null || body.isBlank()) {
                throw new IllegalArgumentException("Body cannot be empty");
            }

            // Generate a mock message ID for testing purposes
            String messageId = "test-msg-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 10000);
            
            // In a real implementation, this would call the actual email service
            // For example:
            // - SendGrid API
            // - AWS SES
            // - SMTP server
            // - etc.
            
            // Log the email details (for development/debugging)
            log.info("Email sent to: {}, subject: {}, messageId: {}, isHtml: {}", to, subject, messageId, isHtml);
            
            return messageId;
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            return null;
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
