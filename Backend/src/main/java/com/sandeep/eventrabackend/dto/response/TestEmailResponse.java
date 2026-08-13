package com.sandeep.eventrabackend.dto.response;

/**
 * Response DTO for test email sending.
 * Contains information about the sent test email.
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */
public class TestEmailResponse {

    private boolean success;
    private String messageId;
    private String recipient;
    private String templateType;
    private String eventId;
    private String timestamp;
    private String message;

    // Constructors
    public TestEmailResponse() {}

    public TestEmailResponse(boolean success, String messageId, String recipient, 
                             String templateType, String eventId, String message) {
        this.success = success;
        this.messageId = messageId;
        this.recipient = recipient;
        this.templateType = templateType;
        this.eventId = eventId;
        this.message = message;
        this.timestamp = java.time.Instant.now().toString();
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "TestEmailResponse{" +
                "success=" + success +
                ", messageId='" + messageId + '\'' +
                ", recipient='" + recipient + '\'' +
                ", templateType='" + templateType + '\'' +
                ", eventId='" + eventId + '\'' +
                ", timestamp='" + timestamp + '\'' +
                ", message='" + message + '\'' +
                '}';
    }
}
