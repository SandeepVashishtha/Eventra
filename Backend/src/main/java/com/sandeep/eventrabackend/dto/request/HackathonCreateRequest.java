package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating a new hackathon")
public class HackathonCreateRequest {

    @NotBlank(message = "Title is required")
    @Schema(description = "Hackathon title", example = "Global AI Hackathon 2026")
    private String title;

    @NotBlank(message = "Description is required")
    @Schema(description = "Detailed hackathon description", example = "A 48-hour hackathon focused on Generative AI.")
    private String description;

    @NotBlank(message = "Organizer is required")
    @Schema(description = "Name of the organizing body", example = "Tech Innovators")
    private String organizer;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    @Schema(description = "Start date and time of the hackathon")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    @Schema(description = "End date and time of the hackathon")
    private LocalDateTime endDate;

    @NotBlank(message = "Location is required")
    @Schema(description = "Physical or virtual location", example = "Hybrid / San Francisco")
    private String location;

    @NotBlank(message = "Mode is required")
    @Schema(description = "Mode of the hackathon", example = "Online")
    private String mode;

    @Schema(description = "Total prize pool description", example = "$50,000 in prizes")
    private String prizePool;

    @NotNull(message = "Registration deadline is required")
    @Future(message = "Registration deadline must be in the future")
    @Schema(description = "Deadline for registration")
    private LocalDateTime registrationDeadline;

    @Schema(description = "URL to the hackathon's promotional image", example = "https://example.com/hackathon.png")
    private String imageUrl;
}
