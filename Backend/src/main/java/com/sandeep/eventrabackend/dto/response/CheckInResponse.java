package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body returned by {@code POST /api/tickets/checkin}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Result of recording a ticket check-in")
public class CheckInResponse {

    @Schema(description = "Whether the check-in was recorded.", example = "true")
    private boolean success;

    @Schema(description = "Human-readable confirmation message.", example = "Attendee check-in recorded successfully")
    private String message;

    @Schema(description = "Registration id that was checked in.", example = "42")
    private Long registrationId;

    @Schema(description = "Id of the event the check-in belongs to.", example = "7")
    private Long eventId;
}
