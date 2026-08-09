package com.sandeep.eventrabackend.model;

import com.sandeep.eventrabackend.config.JsonMapAttributeConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A live poll run by the event organizer. Option labels are stored in a join
 * table and running vote tallies in a JSON text column ({@code option -> count}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "live_audience_polls",
        indexes = @Index(name = "idx_lap_event", columnList = "event_id"))
public class LiveAudiencePoll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(nullable = false, length = 300)
    private String question;

    /** single | multiple */
    @Column(nullable = false, length = 20)
    private String type = "single";

    /** active | paused | closed */
    @Column(nullable = false, length = 20)
    private String status = "active";

    @ElementCollection
    @CollectionTable(name = "live_audience_poll_options",
            joinColumns = @JoinColumn(name = "poll_id"))
    @Column(name = "option_text", length = 200)
    private List<String> options = new ArrayList<>();

    @Convert(converter = JsonMapAttributeConverter.class)
    @Column(name = "results", columnDefinition = "TEXT")
    private Map<String, Object> results = new HashMap<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
