package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
@Schema(description = "Response payload containing event details")
public class EventResponse {

    @Schema(description = "Unique ID of the event", example = "1")
    private Long id;

    @Schema(description = "Event title", example = "Tech Conference 2026")
    private String title;

    @Schema(description = "Detailed event description", example = "A deep dive into AI and Cloud computing.")
    private String description;

    @Schema(description = "Physical or virtual location", example = "San Francisco, CA")
    private String location;

    @Schema(description = "Date and time when the event starts")
    private LocalDateTime eventDate;

    @Schema(description = "Maximum number of attendees allowed (null for unlimited)", example = "100")
    private Integer capacity;

    @Schema(description = "Number of confirmed registrations so far.", example = "42")
    private int registeredCount;

    @JsonProperty("public")
    @Schema(description = "Whether the event is publicly visible", example = "true")
    private boolean isPublic;

    @Schema(description = "URL to the event's banner or thumbnail image", example = "https://example.com/images/event-banner.jpg")
    private String imageUrl;
}
