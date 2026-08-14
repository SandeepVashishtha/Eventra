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
@Schema(description = "Request payload for confirming password reset with a raw token and new password")
public class ConfirmResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    @Schema(description = "Raw, unhashed single-use password reset token received via email/link")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(description = "New password (minimum 8 characters)", example = "NewSecurePassword@123")
    private String newPassword;
}
