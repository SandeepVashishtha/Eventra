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
@Schema(description = "Admin view of a feedback entry")
public class AdminFeedbackResponse {

    @Schema(description = "Feedback ID", example = "1")
    private Long id;

    @Schema(description = "ID of the event the feedback belongs to", example = "5")
    private Long eventId;

    @Schema(description = "Title of the event", example = "Tech Conference 2026")
    private String eventTitle;

    @Schema(description = "ID of the user who submitted the feedback", example = "12")
    private Long userId;

    @Schema(description = "Username of the reviewer", example = "john_doe")
    private String username;

    @Schema(description = "Rating from 1–5", example = "4")
    private Integer rating;

    @Schema(description = "Optional comment", example = "Great event!")
    private String comment;

    @Schema(description = "Timestamp when feedback was submitted")
    private LocalDateTime submittedAt;
}
