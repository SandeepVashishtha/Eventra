package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating a new project")
public class ProjectCreateRequest {

    @NotBlank(message = "Title is required")
    @Schema(description = "Project title", example = "E-commerce Platform")
    private String title;

    @NotBlank(message = "Description is required")
    @Schema(description = "Detailed project description", example = "A full-stack e-commerce solution.")
    private String description;

    @NotBlank(message = "Category is required")
    @Schema(description = "Project category", example = "Web Development")
    private String category;

    @Schema(description = "URL to the project's thumbnail image", example = "https://example.com/thumb.png")
    private String thumbnailUrl;

    @Schema(description = "URL to the project's GitHub repository", example = "https://github.com/user/repo")
    private String githubUrl;
}
