package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request payload for setting a new password using a reset token")
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    @Schema(description = "Password reset token received from the forgot-password flow", example = "eyJ...")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "New account password (min 8 characters)", example = "MySecret@123")
    private String newPassword;

    @NotBlank(message = "Password confirmation is required")
    @Schema(description = "Password confirmation — must match newPassword", example = "MySecret@123")
    private String confirmPassword;
}
