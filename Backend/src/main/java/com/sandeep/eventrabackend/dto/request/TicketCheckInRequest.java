package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for {@code POST /api/tickets/validate} and
 * {@code POST /api/tickets/checkin}.
 * <p>
 * {@code ticketId} is either the numeric registration id or a signed JWT QR
 * token issued when the attendee registered.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to validate or check in a ticket")
public class TicketCheckInRequest {

    @Schema(description = "Numeric registration id or signed JWT ticket token scanned from the QR code.", example = "42")
    @NotBlank(message = "ticketId is required")
    private String ticketId;

    @Schema(description = "Id of the event the ticket is being scanned at.", example = "7")
    @NotNull(message = "eventId is required")
    private Long eventId;
}
