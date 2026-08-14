package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Records one attendee's vote on a live poll option so each attendee can vote at
 * most once per option (unique {@code poll_id + user_id + option_text}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "live_audience_poll_votes",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_lapv_poll_user_option",
                columnNames = {"poll_id", "user_id", "option_text"}))
public class LiveAudiencePollVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "poll_id", nullable = false)
    private Long pollId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "option_text", nullable = false, length = 200)
    private String optionText;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
