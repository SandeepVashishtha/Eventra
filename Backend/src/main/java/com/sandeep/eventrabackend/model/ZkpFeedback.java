package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Persisted anonymous feedback submitted through the ZKP proof channel
 * (feature #13898). No link to a user identity is stored.
 */
@Entity
@Table(name = "zkp_feedback",
        indexes = {
                @Index(name = "idx_zkp_feedback_event", columnList = "event_id")
        })
public class ZkpFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "nullifier_hash", nullable = false, unique = true, length = 128)
    private String nullifierHash;

    @Column(name = "feedback_category", length = 64)
    private String feedbackCategory;

    @Column(length = 2000)
    private String feedbackContent;

    @Column(length = 16)
    private String severity;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    public ZkpFeedback() {
    }

    public ZkpFeedback(Long eventId, String nullifierHash, String feedbackCategory,
            String feedbackContent, String severity) {
        this.eventId = eventId;
        this.nullifierHash = nullifierHash;
        this.feedbackCategory = feedbackCategory;
        this.feedbackContent = feedbackContent;
        this.severity = severity;
    }

    public Long getId() {
        return id;
    }

    public Long getEventId() {
        return eventId;
    }

    public String getNullifierHash() {
        return nullifierHash;
    }

    public String getFeedbackCategory() {
        return feedbackCategory;
    }

    public String getFeedbackContent() {
        return feedbackContent;
    }

    public String getSeverity() {
        return severity;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
}