package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * A question posted by an attendee on the live audience Q&A board.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "live_audience_questions",
        indexes = {
                @Index(name = "idx_laq_event", columnList = "event_id"),
                @Index(name = "idx_laq_event_created", columnList = "event_id, created_at")
        })
public class LiveAudienceQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(nullable = false)
    private int upvotes = 0;

    @Column(nullable = false)
    private boolean flagged = false;

    @Column(name = "is_speaker", nullable = false)
    private boolean isSpeaker = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
