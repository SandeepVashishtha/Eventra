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
@Schema(description = "User profile update request payload")
public class UserProfileUpdateRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "User's unique username", example = "johndoe123")
    private String username;

    @Size(max = 160, message = "Profile headline must be 160 characters or fewer")
    @Schema(description = "Short professional headline shown when the user opts into attendee directories", example = "Full Stack Developer looking for a hackathon team")
    private String profileHeadline;

    @Size(max = 255, message = "LinkedIn URL must be 255 characters or fewer")
    @Schema(description = "LinkedIn profile URL", example = "https://www.linkedin.com/in/johndoe")
    private String linkedinUrl;

    @Size(max = 255, message = "GitHub URL must be 255 characters or fewer")
    @Schema(description = "GitHub profile URL", example = "https://github.com/johndoe")
    private String githubUrl;
}
