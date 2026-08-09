package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Request payload for requesting a password reset link")
public class ForgotPasswordRequest {

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    @Schema(description = "Email address of the account to reset", example = "john@example.com")
    private String email;
}
