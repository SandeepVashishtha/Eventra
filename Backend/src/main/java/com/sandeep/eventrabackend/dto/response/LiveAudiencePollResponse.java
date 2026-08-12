package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Live-audience poll")
public class LiveAudiencePollResponse {

    @Schema(description = "Poll ID", example = "3")
    private Long id;

    @Schema(description = "Poll question", example = "How did you find today's keynote?")
    private String question;

    @Schema(description = "Poll type: single or multiple", example = "single")
    private String type;

    @Schema(description = "Poll status: active, paused or closed", example = "active")
    private String status;

    @Schema(description = "Poll options", example = "[\"Excellent\", \"Good\", \"Average\"]")
    private List<String> options;

    @Schema(description = "Running vote tally per option", example = "{\"Excellent\": 12, \"Good\": 8}")
    private Map<String, Object> results;

    @Schema(description = "Poll creation time", example = "2026-08-09T13:00:00")
    private LocalDateTime createdAt;
}
