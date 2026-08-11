package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a live-audience poll")
public class CreatePollRequest {

    @NotBlank(message = "Poll question is required")
    @Size(max = 300, message = "Poll question must not exceed 300 characters")
    @Schema(description = "Poll question", example = "How did you find today's keynote?")
    private String question;

    @Pattern(regexp = "single|multiple", message = "Poll type must be 'single' or 'multiple'")
    @Schema(description = "Poll type: single or multiple", example = "single")
    private String type;

    @NotEmpty(message = "Poll options are required")
    @Size(max = 10, message = "A poll can have at most 10 options")
    @Schema(description = "Poll options", example = "[\"Excellent\", \"Good\", \"Average\", \"Poor\"]")
    private List<String> options;
}
