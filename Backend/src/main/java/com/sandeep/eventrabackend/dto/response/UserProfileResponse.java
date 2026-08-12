package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Authenticated user profile response")
public class UserProfileResponse {

    @Schema(description = "User ID", example = "1")
    private Long id;

    @Schema(description = "User first name", example = "John")
    private String firstName;

    @Schema(description = "User last name", example = "Doe")
    private String lastName;

    @Schema(description = "Unique username", example = "john_doe")
    private String username;

    @Schema(description = "User email address", example = "john@example.com")
    private String email;

    @Schema(description = "User role", example = "CLIENT")
    private String role;

    @Schema(description = "Short professional headline", example = "Full Stack Developer looking for a team")
    private String profileHeadline;

    @Schema(description = "LinkedIn profile URL", example = "https://www.linkedin.com/in/john-doe")
    private String linkedinUrl;

    @Schema(description = "GitHub profile URL", example = "https://github.com/johndoe")
    private String githubUrl;

    @Schema(description = "User preferences, e.g. { \"theme\": \"dark\" }")
    private Map<String, Object> preferences;
}
