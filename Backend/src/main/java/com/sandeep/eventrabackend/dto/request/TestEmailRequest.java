package com.sandeep.eventrabackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

/**
 * Request DTO for sending test emails.
 * Used by organizers to preview email templates before sending to attendees.
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */
public class TestEmailRequest {

    @NotBlank(message = "Event ID is required")
    private String eventId;

    @NotBlank(message = "Template type is required")
    private String templateType; // e.g., "cancellation", "waitlist_promotion"

    @NotNull(message = "Event details are required")
    private Map<String, Object> event;

    @NotNull(message = "Attendee details are required")
    private Map<String, Object> attendee;

    @NotBlank(message = "Custom template is required")
    private String customTemplate;

    @Email(message = "Recipient email must be valid")
    @NotBlank(message = "Recipient email is required")
    private String recipientEmail;

    private boolean isTest = true;

    // Constructors
    public TestEmailRequest() {}

    public TestEmailRequest(String eventId, String templateType, Map<String, Object> event, 
                           Map<String, Object> attendee, String customTemplate, String recipientEmail) {
        this.eventId = eventId;
        this.templateType = templateType;
        this.event = event;
        this.attendee = attendee;
        this.customTemplate = customTemplate;
        this.recipientEmail = recipientEmail;
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

    public Map<String, Object> getEvent() {
        return event;
    }

    public void setEvent(Map<String, Object> event) {
        this.event = event;
    }

    public Map<String, Object> getAttendee() {
        return attendee;
    }

    public void setAttendee(Map<String, Object> attendee) {
        this.attendee = attendee;
    }

    public String getCustomTemplate() {
        return customTemplate;
    }

    public void setCustomTemplate(String customTemplate) {
        this.customTemplate = customTemplate;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public boolean isTest() {
        return isTest;
    }

    public void setTest(boolean test) {
        isTest = test;
    }

    @Override
    public String toString() {
        return "TestEmailRequest{" +
                "eventId='" + eventId + '\'' +
                ", templateType='" + templateType + '\'' +
                ", event=" + event +
                ", attendee=" + attendee +
                ", recipientEmail='" + recipientEmail + '\'' +
                ", isTest=" + isTest +
                '}';
    }
}
