package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body returned by {@code POST /api/tickets/validate}.
 * <p>
 * Mirrors the response contract the ticket scanner frontend expects: the
 * {@code valid} flag gates entry, {@code alreadyCheckedIn} surfaces duplicate
 * scans without an error, and {@code registrationId} normalizes the scanned
 * token to the canonical registration id.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Result of validating a ticket QR code")
public class TicketValidationResponse {

    @Schema(description = "Whether the ticket is valid for entry.", example = "true")
    private boolean valid;

    @Schema(description = "Whether the ticket was already checked in.", example = "false")
    private boolean alreadyCheckedIn;

    @Schema(description = "Canonical registration id the scanned token resolved to.", example = "42")
    private Long registrationId;

    @Schema(description = "Display name of the attendee.", example = "Alice Smith")
    private String userName;

    @Schema(description = "Email of the attendee.", example = "alice@example.com")
    private String email;

    @Schema(description = "Id of the event the ticket belongs to.", example = "7")
    private Long eventId;

    @Schema(description = "Current registration status (CONFIRMED, CHECKED_IN, CANCELLED).", example = "CONFIRMED")
    private String attendanceStatus;

    @Schema(description = "Human-readable result message.", example = "Ticket verified successfully.")
    private String message;
}
