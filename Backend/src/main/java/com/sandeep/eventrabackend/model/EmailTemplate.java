package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Entity for storing custom email templates.
 * Allows organizers to save and reuse custom email templates for different notification types.
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */
@Entity
@Table(name = "email_templates")
public class EmailTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "organizer_email", nullable = false)
    private String organizerEmail;

    @Column(name = "template_type", nullable = false, length = 50)
    private String templateType; // e.g., "cancellation", "waitlist_promotion"

    @Column(name = "template_content", columnDefinition = "TEXT", nullable = false)
    private String templateContent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Pre-persist and pre-update lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Constructors
    public EmailTemplate() {}

    public EmailTemplate(String eventId, String organizerEmail, String templateType, String templateContent) {
        this.eventId = eventId;
        this.organizerEmail = organizerEmail;
        this.templateType = templateType;
        this.templateContent = templateContent;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getOrganizerEmail() {
        return organizerEmail;
    }

    public void setOrganizerEmail(String organizerEmail) {
        this.organizerEmail = organizerEmail;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public String getTemplateContent() {
        return templateContent;
    }

    public void setTemplateContent(String templateContent) {
        this.templateContent = templateContent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "EmailTemplate{" +
                "id=" + id +
                ", eventId='" + eventId + '\'' +
                ", organizerEmail='" + organizerEmail + '\'' +
                ", templateType='" + templateType + '\'' +
                ", templateContent='" + templateContent + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
