package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Event registration returned for the authenticated user")
public class MyRegisteredEventResponse {

    @Schema(description = "Registration ID.", example = "101")
    private Long registrationId;

    @Schema(description = "Event ID.", example = "42")
    private Long eventId;

    @Schema(description = "Event title.", example = "Tech Conference 2026")
    private String title;

    @Schema(description = "Event description.")
    private String description;

    @Schema(description = "Event location.", example = "Mumbai")
    private String location;

    @Schema(description = "Event date and time.", example = "2026-08-15T10:00:00")
    private LocalDateTime eventDate;

    @Schema(description = "Registration timestamp.", example = "2026-05-20T14:30:00")
    private LocalDateTime registeredAt;

    @Schema(description = "Registration status.", example = "CONFIRMED")
    private String status;

    @Schema(description = "URL to the event's banner or thumbnail image",
            example = "https://example.com/images/event-banner.jpg")
    private String imageUrl;

    @JsonProperty("date")
    @Schema(description = "Event date alias for frontend clients.", example = "2026-08-15")
    public LocalDate getDate() {
        return eventDate == null ? null : eventDate.toLocalDate();
    }

    @JsonProperty("time")
    @Schema(description = "Event time alias for frontend clients.", example = "10:00:00")
    public LocalTime getTime() {
        return eventDate == null ? null : eventDate.toLocalTime();
    }
}
