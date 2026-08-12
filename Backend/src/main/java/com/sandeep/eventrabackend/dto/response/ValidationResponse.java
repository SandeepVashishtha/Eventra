package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for the public availability-validation endpoints
 * ({@code GET /api/validate/email/{email}} and {@code GET /api/validate/username/{username}}).
 *
 * <p>Matches the shape consumed by {@code src/utils/validationApi.js}, which reads
 * the {@code available} field (its default availability field).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Availability check result for email / username validation")
public class ValidationResponse {

    @Schema(description = "Whether the value is available (not already taken)", example = "true")
    private boolean available;

    @Schema(description = "Optional human-readable message", example = "Email is available")
    private String message;
}
