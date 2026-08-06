package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for cancelling an existing event")
public class CancelEventRequest {

    @NotBlank(message = "Reason is required")
    @Schema(description = "Reason for cancelling the event", example = "Venue unavailable")
    private String reason;

    @NotBlank(message = "Refund policy is required (FULL, PARTIAL or NONE)")
    @Pattern(regexp = "FULL|PARTIAL|NONE", message = "Refund policy must be one of: FULL, PARTIAL, NONE")
    @Schema(description = "Refund policy for registered attendees (FULL, PARTIAL, NONE)", example = "FULL")
    private String refundPolicy;

    @Min(value = 1, message = "Refund percentage must be at least 1")
    @Max(value = 100, message = "Refund percentage cannot exceed 100")
    @Schema(description = "Refund percentage when the refund policy is PARTIAL", example = "50")
    private Integer refundPercent;

    @Schema(description = "Optional timestamp recording when the event was cancelled (defaults to now)")
    private LocalDateTime cancelledAt;
}
