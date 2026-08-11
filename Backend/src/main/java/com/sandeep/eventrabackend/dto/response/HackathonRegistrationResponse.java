package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Response returned after successfully registering for a hackathon")
public class HackathonRegistrationResponse {

    @Schema(description = "ID of the registration record.", example = "1")
    private Long registrationId;

    @Schema(description = "ID of the hackathon the user registered for.", example = "42")
    private Long hackathonId;

    @Schema(description = "Title of the hackathon.", example = "Global AI Hackathon")
    private String hackathonTitle;

    @Schema(description = "Email address of the registered user.", example = "alice@example.com")
    private String userEmail;

    @Schema(description = "Timestamp when the registration was confirmed.", example = "2025-06-01T10:30:00")
    private LocalDateTime registeredAt;

    @Schema(description = "Registration confirmation status.", example = "CONFIRMED")
    private String status;
}
