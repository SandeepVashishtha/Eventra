package com.sandeep.eventrabackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for saving custom email templates.
 * Used by organizers to save their custom email templates for reuse.
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */
public class SaveTemplateRequest {

    @NotBlank(message = "Event ID is required")
    private String eventId;

    @NotBlank(message = "Template type is required")
    private String templateType; // e.g., "cancellation", "waitlist_promotion"

    @NotBlank(message = "Template content is required")
    private String template;

    // Constructors
    public SaveTemplateRequest() {}

    public SaveTemplateRequest(String eventId, String templateType, String template) {
        this.eventId = eventId;
        this.templateType = templateType;
        this.template = template;
    }

    // Getters and Setters
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

    @Override
    public String toString() {
        return "SaveTemplateRequest{" +
                "eventId='" + eventId + '\'' +
                ", templateType='" + templateType + '\'' +
                ", template='" + template + '\'' +
                '}';
    }
}
