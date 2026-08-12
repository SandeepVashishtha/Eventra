package com.sandeep.eventrabackend.dto.response;

/**
 * Response DTO for custom email templates.
 * Contains template information for retrieval and management.
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */
public class TemplateResponse {

    private boolean success;
    private String eventId;
    private String templateType;
    private String template;
    private String message;
    private String timestamp;

    // Constructors
    public TemplateResponse() {}

    public TemplateResponse(boolean success, String eventId, String templateType, 
                           String template, String message) {
        this.success = success;
        this.eventId = eventId;
        this.templateType = templateType;
        this.template = template;
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

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "TemplateResponse{" +
                "success=" + success +
                ", eventId='" + eventId + '\'' +
                ", templateType='" + templateType + '\'' +
                ", template='" + template + '\'' +
                ", message='" + message + '\'' +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}
