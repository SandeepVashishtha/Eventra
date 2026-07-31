package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.HackathonCreateRequest;
import com.sandeep.eventrabackend.dto.request.HackathonUpdateRequest;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.dto.response.HackathonRegistrationResponse;
import com.sandeep.eventrabackend.dto.response.HackathonResponse;
import com.sandeep.eventrabackend.service.HackathonService;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hackathons")
@Tag(name = "Hackathons", description = "Endpoints for viewing and interacting with hackathons")
public class HackathonController {

    private final HackathonService hackathonService;

    public HackathonController(HackathonService hackathonService) {
        this.hackathonService = hackathonService;
    }

    @PostMapping("/{id}/register")
    @Operation(
            summary = "Register for a hackathon",
            description = "Allows an authenticated user to register for a specific hackathon.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Registered successfully",
                    content = @Content(
                            schema = @Schema(implementation = HackathonRegistrationResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Registration closed / invalid request",
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
                    responseCode = "404",
                    description = "Hackathon not found",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Already registered",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<HackathonRegistrationResponse> registerForHackathon(
            @Parameter(description = "ID of the hackathon to register for")
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(hackathonService.registerUserForHackathon(id, userEmail));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(
            summary = "Create a new hackathon",
            description = "Allows an ORGANIZER, ADMIN, or SUPER_ADMIN to create a new hackathon.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Hackathon created successfully",
                    content = @Content(
                            schema = @Schema(implementation = HackathonResponse.class)
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
    public ResponseEntity<HackathonResponse> createHackathon(
            @Valid @RequestBody HackathonCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hackathonService.createHackathon(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(
            summary = "Update an existing hackathon",
            description = "Allows an ORGANIZER, ADMIN, or SUPER_ADMIN to update hackathon details.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Hackathon updated successfully",
                    content = @Content(
                            schema = @Schema(implementation = HackathonResponse.class)
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
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Hackathon not found",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<HackathonResponse> updateHackathon(
            @Parameter(description = "ID of the hackathon to update")
            @PathVariable Long id,
            @Valid @RequestBody HackathonUpdateRequest request) {
        return ResponseEntity.ok(hackathonService.updateHackathon(id, request));
    }

    @GetMapping
    @Operation(
            summary = "Get all hackathons",
            description = "Returns a list of all available hackathons."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Hackathons fetched successfully",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = HackathonResponse.class))
                    )
            )
    })
    public ResponseEntity<List<HackathonResponse>> getAllHackathons() {
        return ResponseEntity.ok(hackathonService.getAllHackathons());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get a hackathon by ID",
            description = "Returns details of a specific hackathon by its ID."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Hackathon fetched successfully",
                    content = @Content(
                            schema = @Schema(implementation = HackathonResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Hackathon not found",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<HackathonResponse> getHackathonById(
            @Parameter(description = "ID of the hackathon")
            @PathVariable Long id) {
        return ResponseEntity.ok(hackathonService.getHackathonById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN')")
    @Operation(
            summary = "Delete a hackathon",
            description = "Allows an ADMIN or SUPER_ADMIN to delete a hackathon.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Hackathon deleted successfully"
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
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Hackathon not found",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> deleteHackathon(
            @Parameter(description = "ID of the hackathon to delete")
            @PathVariable Long id) {
        hackathonService.deleteHackathon(id);
        return ResponseEntity.noContent().build();
    }
}
