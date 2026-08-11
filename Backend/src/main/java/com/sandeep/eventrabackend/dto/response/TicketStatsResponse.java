package com.sandeep.eventrabackend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Attendance summary returned by {@code GET /api/tickets/stats}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Attendance statistics for a single event")
public class TicketStatsResponse {

    @Schema(description = "Total registrations for the event (excluding cancelled).", example = "120")
    private long totalRegistrations;

    @Schema(description = "Number of attendees checked in.", example = "45")
    private long checkedInAttendees;

    @Schema(description = "Attendees registered but not yet checked in.", example = "75")
    private long remainingAttendees;

    @Schema(description = "Percentage of registered attendees checked in (0-100).", example = "38")
    private int attendancePercentage;
}
