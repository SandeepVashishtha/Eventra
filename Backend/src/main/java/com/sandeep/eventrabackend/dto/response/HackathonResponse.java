package com.sandeep.eventrabackend.dto.response;

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
@Schema(description = "Response payload containing hackathon details")
public class HackathonResponse {

    @Schema(description = "Unique ID of the hackathon", example = "1")
    private Long id;

    @Schema(description = "Hackathon title", example = "Global AI Hackathon 2026")
    private String title;

    @Schema(description = "Detailed hackathon description", example = "A 48-hour hackathon focused on Generative AI.")
    private String description;

    @Schema(description = "Name of the organizing body", example = "Tech Innovators")
    private String organizer;

    @Schema(description = "Start date and time of the hackathon")
    private LocalDateTime startDate;

    @Schema(description = "End date and time of the hackathon")
    private LocalDateTime endDate;

    @Schema(description = "Physical or virtual location", example = "Hybrid / San Francisco")
    private String location;

    @Schema(description = "Mode of the hackathon", example = "Online")
    private String mode;

    @Schema(description = "Total prize pool description", example = "$50,000 in prizes")
    private String prizePool;

    @Schema(description = "Deadline for registration")
    private LocalDateTime registrationDeadline;

    @Schema(description = "URL to the hackathon's promotional image", example = "https://example.com/hackathon.png")
    private String imageUrl;
}
