package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating a new event")
public class EventCreateRequest {

    @NotBlank(message = "Title is required")
    @Schema(description = "Event title", example = "Tech Conference 2026")
    private String title;

    @NotBlank(message = "Description is required")
    @Schema(description = "Detailed event description", example = "A deep dive into AI and Cloud computing.")
    private String description;

    @NotBlank(message = "Location is required")
    @Schema(description = "Physical or virtual location", example = "San Francisco, CA")
    private String location;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    @Schema(description = "Date and time when the event starts")
    private LocalDateTime eventDate;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Schema(description = "Maximum number of attendees allowed (null for unlimited)", example = "100")
    private Integer capacity;

    @Schema(description = "Whether the event is publicly visible", defaultValue = "true")
    private Boolean isPublic;

    @URL(message = "Image URL must be a valid URL")
    @Schema(description = "Optional URL to the event's banner or thumbnail image (link only)",
            example = "https://example.com/images/event-banner.jpg")
    private String imageUrl;
}
