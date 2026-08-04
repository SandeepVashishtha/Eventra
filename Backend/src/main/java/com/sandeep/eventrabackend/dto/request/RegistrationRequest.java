package com.sandeep.eventrabackend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Optional body accepted by {@code POST /api/events/{id}/register}.
 * All fields are optional; the request is omitted entirely when no
 * extra metadata (e.g. a selected seat) is provided.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Optional metadata sent when registering for an event")
public class RegistrationRequest {

    @Schema(
            description = "Selected seat identifier (elementId:seatIndex) when the event offers seat selection.",
            example = "table-1:3"
    )
    private String seatId;

    @Schema(
            description = "Whether this attendee explicitly opted in to appear in this event's attendee directory.",
            example = "false",
            defaultValue = "false"
    )
    @Builder.Default
    private Boolean showProfileInAttendeeDirectory = false;
}
