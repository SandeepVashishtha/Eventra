package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Live-audience Q&A question")
public class LiveAudienceQuestionResponse {

    @Schema(description = "Question ID", example = "12")
    private Long id;

    @Schema(description = "Question text", example = "Will there be a networking session?")
    private String text;

    @Schema(description = "Number of upvotes", example = "7")
    private Integer upvotes;

    @Schema(description = "Whether the question was flagged for moderation")
    private Boolean flagged;

    @Schema(description = "Whether the author is a speaker / organizer")
    private Boolean isSpeaker;

    @Schema(description = "Author display name")
    private String userName;

    @Schema(description = "Question creation time", example = "2026-08-09T12:30:00")
    private LocalDateTime createdAt;
}
