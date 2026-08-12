package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * A single event registration row returned by
 * {@code GET /api/events/{id}/registrants} for organizer/admin CSV & JSON export.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Event registrant row used for organizer/admin export")
public class EventRegistrantResponse {

    @Schema(description = "Registrant user ID", example = "7")
    private Long userId;

    @Schema(description = "Registrant display name", example = "Jane Doe")
    private String name;

    @Schema(description = "Registrant email", example = "jane@example.com")
    private String email;

    @Schema(description = "Registrant username", example = "janedoe")
    private String username;

    @Schema(description = "Registration timestamp", example = "2026-08-04T10:30:00")
    private LocalDateTime registeredAt;

    @Schema(description = "Registration status (CONFIRMED, CANCELLED, ...)", example = "CONFIRMED")
    private String status;

    @Schema(description = "Selected seat identifier, when the event offers seat selection")
    private String seatId;
}
