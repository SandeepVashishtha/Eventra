package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response body returned by {@code POST /api/events/{id}/register}.
 * <p>
 * Returns a clean, minimal view of the registration — the raw {@code Event}
 * entity is intentionally NOT returned to avoid leaking the full attendees
 * collection and internal JPA fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Response returned after successfully registering for an event")
public class RegistrationResponse {

    @Schema(description = "ID of the event the user registered for.", example = "42")
    private Long eventId;

    @Schema(description = "Title of the event.", example = "Spring Boot Workshop 2025")
    private String eventTitle;

    @Schema(description = "Email address of the registered user.", example = "alice@example.com")
    private String userEmail;

    /**
     * Timestamp when the registration was processed.
     * Set server-side so the client always gets an accurate time.
     */
    @Schema(description = "Timestamp when the registration was confirmed.", example = "2025-06-01T10:30:00")
    private LocalDateTime registeredAt;

    /**
     * Remaining spots after this registration.
     * Null when the event has unlimited capacity.
     */
    @Schema(description = "Spots remaining after this registration. Null for unlimited-capacity events.", example = "13")
    private Integer spotsRemaining;

    @Schema(description = "Registration confirmation status.", example = "CONFIRMED")
    @Builder.Default
    private String registrationStatus = "CONFIRMED";
}
