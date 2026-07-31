package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(
        description = "Event availability information including capacity, " +
                "current registrations, and remaining spots"
)
public class EventAvailabilityResponse {

    // ── Primary fields ───────────────────────────────────────────────────────

    @Schema(
            description = "Maximum number of attendees allowed. Null means unlimited.",
            example = "100"
    )
    private Integer capacity;

    @Schema(
            description = "Number of confirmed registrations so far.",
            example = "42"
    )
    private int registeredCount;

    @Schema(
            description = "Remaining spots. Null when the event has unlimited capacity.",
            example = "58"
    )
    private Integer spotsLeft;

    @Schema(
            description = "True when the event has reached its maximum capacity.",
            example = "false"
    )
    private boolean isFull;

    /**
     * True when the event date is in the past.
     * Frontend should use this flag to display a notice like
     * "This event has already passed" rather than a registration button.
     */
    @Schema(
            description = "True when the event date has already passed.",
            example = "false"
    )
    private boolean eventPassed;

    // ── Alias fields (issue #2101 spec names) ────────────────────────────────

    /**
     * Alias for {@code capacity}
     * for a {@code maxAttendees} field in the JSON response.
     */
    @JsonProperty("maxAttendees")
    @Schema(
            description = "Alias for capacity (max attendees).",
            example = "100"
    )
    public Integer getMaxAttendees() {
        return capacity;
    }

    /**
     * Alias for {@code registeredCount}
     * for a {@code currentAttendees} field in the JSON response.
     */
    @JsonProperty("currentAttendees")
    @Schema(
            description = "Alias for registeredCount (current attendees).",
            example = "42"
    )
    public int getCurrentAttendees() {
        return registeredCount;
    }

    /**
     * Human-readable availability status string.
     * Returns "FULL", "UNLIMITED", "AVAILABLE", or "PAST".
     */
    @JsonProperty("availabilityStatus")
    @Schema(
            description = "Human-readable availability status.",
            example = "AVAILABLE",
            allowableValues = {
                    "AVAILABLE",
                    "FULL",
                    "UNLIMITED",
                    "PAST"
            }
    )
    public String getAvailabilityStatus() {

        if (eventPassed) {
            return "PAST";
        }

        if (capacity == null) {
            return "UNLIMITED";
        }

        if (isFull) {
            return "FULL";
        }

        return "AVAILABLE";
    }
}