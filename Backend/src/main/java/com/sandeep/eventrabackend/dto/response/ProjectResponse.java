package com.sandeep.eventrabackend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response payload containing project details")
public class ProjectResponse {

    @Schema(description = "Unique ID of the project", example = "1")
    private Long id;

    @Schema(description = "Project title", example = "E-commerce Platform")
    private String title;

    @Schema(description = "Detailed project description", example = "A full-stack e-commerce solution.")
    private String description;

    @Schema(description = "Project category", example = "Web Development")
    private String category;

    @Schema(description = "URL to the project's thumbnail image", example = "https://example.com/thumb.png")
    private String thumbnailUrl;

    @Schema(description = "URL to the project's GitHub repository", example = "https://github.com/user/repo")
    private String githubUrl;

    @Schema(description = "Number of upvotes received", example = "15")
    private int upvotes;
}
