package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.AdminDashboardStatsDTO;
import com.sandeep.eventrabackend.dto.RegistrationTrendDTO;
import com.sandeep.eventrabackend.dto.request.AdminUpdateRoleRequest;
import com.sandeep.eventrabackend.dto.response.*;
import com.sandeep.eventrabackend.service.AdminService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Panel REST Controller.
 *
 * All endpoints are restricted to users with the ADMIN or SUPER_ADMIN role.
 * Security is enforced at both the SecurityConfig level and via @PreAuthorize
 * on each method.
 *
 * Base path: /api/admin
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin Panel", description = "Admin-only endpoints for managing users, events, hackathons, feedback, and analytics")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ══════════════════════════════════════════════════════════════════════
    // 1. USER MANAGEMENT  —  /api/admin/users
    // ══════════════════════════════════════════════════════════════════════

    @GetMapping("/users")
    @Operation(
            summary = "List all users",
            description = "Returns a paginated list of all registered users. " +
                          "Optionally filter by role (CLIENT, ORGANIZER, ADMIN, SUPER_ADMIN)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Users fetched successfully",
                    content = @Content(schema = @Schema(implementation = PagedResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PagedResponse<AdminUserResponse>> getAllUsers(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Number of users per page", example = "10")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Filter by role: CLIENT | ORGANIZER | ADMIN | SUPER_ADMIN")
            @RequestParam(required = false) String role
    ) {
        return ResponseEntity.ok(adminService.getUsers(page, size, role));
    }

    @GetMapping("/users/{id}")
    @Operation(
            summary = "Get a user by ID",
            description = "Returns full details of a single user including role and timestamps."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User found",
                    content = @Content(schema = @Schema(implementation = AdminUserResponse.class))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AdminUserResponse> getUserById(
            @Parameter(description = "ID of the user") @PathVariable Long id
    ) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}/role")
    @Operation(
            summary = "Update a user's role",
            description = "Changes the role of an existing user. " +
                          "Valid roles: CLIENT, ORGANIZER, ADMIN, SUPER_ADMIN."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Role updated successfully",
                    content = @Content(schema = @Schema(implementation = AdminUserResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid role value",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @Parameter(description = "ID of the user to update") @PathVariable Long id,
            @Valid @RequestBody AdminUpdateRoleRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request.getRole()));
    }

    @DeleteMapping("/users/{id}")
    @Operation(
            summary = "Delete a user",
            description = "Permanently deletes a user account. Use with caution — this is irreversible."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID of the user to delete") @PathVariable Long id
    ) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2. EVENT MANAGEMENT  —  /api/admin/events
    // ══════════════════════════════════════════════════════════════════════

    @GetMapping("/events")
    @Operation(
            summary = "List all events (admin view)",
            description = "Returns a paginated list of ALL events regardless of their visibility " +
                          "(public or private), ordered by event date descending."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Events fetched successfully",
                    content = @Content(schema = @Schema(implementation = PagedResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PagedResponse<EventResponse>> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getEvents(page, size));
    }

    @GetMapping("/events/{id}/attendees")
    @Operation(
            summary = "Get attendees of an event",
            description = "Returns all users registered for a specific event."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Attendees fetched successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = AdminUserResponse.class)))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<AdminUserResponse>> getEventAttendees(
            @Parameter(description = "ID of the event") @PathVariable Long id
    ) {
        return ResponseEntity.ok(adminService.getEventAttendees(id));
    }

    @DeleteMapping("/events/{id}")
    @Operation(
            summary = "Force-delete an event",
            description = "Admin override to delete any event regardless of organizer ownership."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Event deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteEvent(
            @Parameter(description = "ID of the event to delete") @PathVariable Long id
    ) {
        adminService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // ══════════════════════════════════════════════════════════════════════
    // 3. HACKATHON MANAGEMENT  —  /api/admin/hackathons
    // ══════════════════════════════════════════════════════════════════════

    @GetMapping("/hackathons")
    @Operation(
            summary = "List all hackathons (admin view)",
            description = "Returns a paginated list of all hackathons, ordered by start date descending."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hackathons fetched successfully",
                    content = @Content(schema = @Schema(implementation = PagedResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PagedResponse<HackathonResponse>> getAllHackathons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getHackathons(page, size));
    }

    @DeleteMapping("/hackathons/{id}")
    @Operation(
            summary = "Delete a hackathon",
            description = "Permanently deletes a hackathon by ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Hackathon deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Hackathon not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteHackathon(
            @Parameter(description = "ID of the hackathon to delete") @PathVariable Long id
    ) {
        adminService.deleteHackathon(id);
        return ResponseEntity.noContent().build();
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. ANALYTICS  —  /api/admin/analytics
    // ══════════════════════════════════════════════════════════════════════

    @GetMapping("/analytics/dashboard")
    @Operation(
            summary = "Admin dashboard stats",
            description = "Returns a comprehensive overview: total users (by role), events, " +
                          "registrations, hackathons, and feedback metrics."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dashboard stats fetched successfully",
                    content = @Content(schema = @Schema(implementation = AdminDashboardStatsDTO.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AdminDashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(adminService.getAdminDashboard());
    }

    @GetMapping("/analytics/users/growth")
    @Operation(
            summary = "User growth trend",
            description = "Returns monthly registration trend data for the past N months. " +
                          "Useful for plotting user growth charts in the admin panel."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User growth trend fetched successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = RegistrationTrendDTO.class)))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<RegistrationTrendDTO>> getUserGrowthTrend(
            @Parameter(description = "Number of months to look back", example = "6")
            @RequestParam(defaultValue = "6") int months
    ) {
        return ResponseEntity.ok(adminService.getUserGrowthTrend(months));
    }

    @GetMapping("/analytics/events/popular")
    @Operation(
            summary = "Most popular events",
            description = "Returns the top N events ordered by registration count, " +
                          "including capacity utilization percentage."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Popular events fetched successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<Map<String, Object>>> getPopularEvents(
            @Parameter(description = "Maximum number of events to return", example = "10")
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(adminService.getPopularEvents(limit));
    }

    // ══════════════════════════════════════════════════════════════════════
    // 5. FEEDBACK MANAGEMENT  —  /api/admin/feedback
    // ══════════════════════════════════════════════════════════════════════

    @GetMapping("/feedback")
    @Operation(
            summary = "List all feedback",
            description = "Returns a paginated list of all feedback submissions across all events, " +
                          "ordered by submission date descending."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Feedback fetched successfully",
                    content = @Content(schema = @Schema(implementation = PagedResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<PagedResponse<AdminFeedbackResponse>> getAllFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(adminService.getAllFeedback(page, size));
    }

    @DeleteMapping("/feedback/{id}")
    @Operation(
            summary = "Delete a feedback entry",
            description = "Permanently removes a feedback entry by ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Feedback deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Feedback not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteFeedback(
            @Parameter(description = "ID of the feedback to delete") @PathVariable Long id
    ) {
        adminService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
