package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update a live-audience poll status")
public class UpdatePollStatusRequest {

    @NotBlank(message = "Poll status is required")
    @Pattern(regexp = "active|paused|closed", message = "Poll status must be 'active', 'paused' or 'closed'")
    @Schema(description = "New poll status", example = "closed")
    private String status;
}
