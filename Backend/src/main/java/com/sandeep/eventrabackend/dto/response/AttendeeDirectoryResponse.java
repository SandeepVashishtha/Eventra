package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Opted-in attendee shown in an event attendee directory")
public class AttendeeDirectoryResponse {

    @Schema(description = "User ID", example = "7")
    private Long userId;

    @Schema(description = "Attendee display name", example = "Jane Doe")
    private String displayName;

    @Schema(description = "Unique username", example = "janedoe")
    private String username;

    @Schema(description = "Short professional headline", example = "Backend engineer looking for a team")
    private String profileHeadline;

    @Schema(description = "LinkedIn profile URL", example = "https://www.linkedin.com/in/janedoe")
    private String linkedinUrl;

    @Schema(description = "GitHub profile URL", example = "https://github.com/janedoe")
    private String githubUrl;

    @Schema(description = "Registration timestamp", example = "2026-08-04T10:30:00")
    private LocalDateTime registeredAt;
}
