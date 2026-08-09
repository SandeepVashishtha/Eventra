package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to submit a live-audience poll vote")
public class SubmitVoteRequest {

    @NotBlank(message = "Option is required")
    @Size(max = 200, message = "Option must not exceed 200 characters")
    @Schema(description = "Selected poll option", example = "Excellent")
    private String option;
}
