package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response payload containing event details")
public class EventResponse {

    @Schema(description = "Unique ID of the event", example = "1")
    private Long id;

    @Schema(description = "Event title", example = "Tech Conference 2026")
    private String title;

    @Schema(description = "Detailed event description", example = "A deep dive into AI and Cloud computing.")
    private String description;

    @Schema(description = "Physical or virtual location", example = "San Francisco, CA")
    private String location;

    @Schema(description = "Date and time when the event starts")
    private LocalDateTime eventDate;

    @Schema(description = "Maximum number of attendees allowed (null for unlimited)", example = "100")
    private Integer capacity;

    @Schema(description = "Number of confirmed registrations so far.", example = "42")
    private int registeredCount;

    @JsonProperty("public")
    @Schema(description = "Whether the event is publicly visible", example = "true")
    private boolean isPublic;

    @Schema(description = "URL to the event's banner or thumbnail image", example = "https://example.com/images/event-banner.jpg")
    private String imageUrl;

    @Schema(description = "ID of the user who created (owns) this event", example = "7")
    private Long ownerId;

    @Schema(description = "Event category for filtering and discovery", example = "Tech")
    private String category;

    @Schema(description = "Tags for the event to enable granular filtering and search", example = "AI,Conference,2026")
    private Set<String> tags;

    @Schema(description = "Lifecycle status of the event", example = "SCHEDULED")
    private String status;

    @Schema(description = "Reason provided when the event was cancelled", example = "Venue unavailable")
    private String cancellationReason;

    @Schema(description = "Timestamp when the event was cancelled")
    private LocalDateTime cancelledAt;

    @Schema(description = "Refund policy chosen at cancellation (FULL / PARTIAL / NONE)", example = "FULL")
    private String refundPolicy;

    @Schema(description = "Refund percentage when the refund policy is PARTIAL", example = "50")
    private Integer refundPercent;
}
