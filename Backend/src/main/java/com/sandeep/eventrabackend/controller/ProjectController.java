package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.ProjectCreateRequest;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.dto.response.ProjectResponse;
import com.sandeep.eventrabackend.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Endpoints for managing and interacting with projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    private static final List<String> CATEGORIES = List.of(
            "Mobile Development",
            "Web Development",
            "Developer Tools",
            "Machine Learning",
            "DevOps",
            "Design",
            "IoT",
            "Blockchain"
    );

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(
            summary = "Create a new project",
            description = "Allows an ORGANIZER, ADMIN, or SUPER_ADMIN to create a new project.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Project created successfully",
                    content = @Content(
                            schema = @Schema(implementation = ProjectResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid payload (validation failed)",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have the required role",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
    }

    @GetMapping
    @Operation(
            summary = "Get all projects",
            description = "Returns a list of all available projects."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Projects fetched successfully",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = ProjectResponse.class))
                    )
            )
    })
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get a project by ID",
            description = "Returns details of a specific project by its ID."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Project fetched successfully",
                    content = @Content(
                            schema = @Schema(implementation = ProjectResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Project not found",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ProjectResponse> getProjectById(
            @Parameter(description = "ID of the project")
            @PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/categories")
    @Operation(
            summary = "Get all project categories",
            description = "Returns a list of available categories for projects."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Categories fetched successfully",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = String.class))
                    )
            )
    })
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(CATEGORIES);
    }

    @PostMapping("/{id}/upvote")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Upvote a project",
            description = "Allows any authenticated user to increment the upvote count of a project by 1.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Project upvoted successfully",
                    content = @Content(
                            schema = @Schema(implementation = ProjectResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Project not found",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ProjectResponse> upvoteProject(
            @Parameter(description = "ID of the project to upvote")
            @PathVariable Long id) {
        return ResponseEntity.ok(projectService.upvoteProject(id));
    }
}
