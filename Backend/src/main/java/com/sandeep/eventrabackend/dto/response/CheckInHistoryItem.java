package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A single entry in the check-in history list returned by
 * {@code GET /api/tickets/checkins}.
 * <p>
 * {@code status} is mapped to the display values the ticket scanner UI renders
 * ({@code Verified} / {@code Flagged}) and {@code time} is the authoritative
 * server-side scan timestamp.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "A single check-in history entry")
public class CheckInHistoryItem {

    @Schema(description = "Id of the scan log entry.", example = "99")
    private Long id;

    @Schema(description = "Registration id of the scanned ticket.", example = "42")
    private Long ticketId;

    @Schema(description = "Display name of the attendee.", example = "Alice Smith")
    private String name;

    @Schema(description = "Event title (or 'Event #id' fallback).", example = "Spring Boot Workshop 2025")
    private String event;

    @Schema(description = "Scan outcome shown in the UI: Verified or Flagged.", example = "Verified")
    private String status;

    @Schema(description = "Timestamp when the ticket was scanned.", example = "2025-06-01T10:30:00")
    private LocalDateTime time;
}
