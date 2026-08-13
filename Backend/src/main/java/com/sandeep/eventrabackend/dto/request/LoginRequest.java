package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Login request payload")
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    @Schema(description = "Username or email address", example = "john_doe or john@example.com")
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    @Schema(description = "Account password", example = "MySecret@123")
    private String password;
}
