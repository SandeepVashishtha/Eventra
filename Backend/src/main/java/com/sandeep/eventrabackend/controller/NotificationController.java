package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.response.NotificationResponse;
import com.sandeep.eventrabackend.service.NotificationService;
import com.sandeep.eventrabackend.dto.request.TestEmailRequest;
import com.sandeep.eventrabackend.dto.request.SaveTemplateRequest;
import com.sandeep.eventrabackend.dto.response.TestEmailResponse;
import com.sandeep.eventrabackend.dto.response.TemplateResponse;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.service.EventRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import com.sandeep.eventrabackend.dto.request.PushSubscriptionRequest;
import com.sandeep.eventrabackend.service.PushSubscriptionService;
import com.sandeep.eventrabackend.service.EmailTemplateService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Notifications", description = "Endpoints for user notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final PushSubscriptionService pushSubscriptionService;
    private final EmailTemplateService emailTemplateService;
    private final EventRoleService eventRoleService;

    public NotificationController(NotificationService notificationService,
                                  PushSubscriptionService pushSubscriptionService,
                                  EmailTemplateService emailTemplateService,
                                  EventRoleService eventRoleService) {
        this.notificationService = notificationService;
        this.pushSubscriptionService = pushSubscriptionService;
        this.emailTemplateService = emailTemplateService;
        this.eventRoleService = eventRoleService;
    }

    @GetMapping
    @Operation(
            summary = "Get notifications for the authenticated user",
            description = "Returns a list of notifications for the currently logged-in user, sorted by newest first.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Notifications retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            )
    })
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(email));
    }

    @PutMapping("/{id}/read")
    @Operation(
            summary = "Mark a notification as read",
            description = "Marks the specified notification as read for the authenticated user.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Notification marked as read successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Notification not found or does not belong to the user"
            )
    })
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        return ResponseEntity.ok(notificationService.markAsRead(id, email));
    }

    @PutMapping("/read-all")
    @Operation(
            summary = "Mark all notifications as read",
            description = "Marks every notification of the authenticated user as read.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "All notifications marked as read successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            )
    })
    public ResponseEntity<List<NotificationResponse>> markAllAsRead(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        return ResponseEntity.ok(notificationService.markAllAsRead(email));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a notification",
            description = "Deletes the specified notification for the authenticated user.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Notification deleted successfully"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Notification not found or does not belong to the user"
            )
    })
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        notificationService.deleteNotification(id, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/push-subscriptions")
    @Operation(summary = "Register a browser push subscription")
    public ResponseEntity<Map<String, Object>> subscribePush(
            @Valid @RequestBody PushSubscriptionRequest request,
            Authentication authentication) {
        pushSubscriptionService.subscribe(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/push-subscriptions/unsubscribe")
    @Operation(summary = "Remove the current user's push subscription")
    public ResponseEntity<Map<String, Object>> unsubscribePush(
            @RequestBody(required = false) PushSubscriptionRequest request,
            Authentication authentication) {
        String endpoint = request != null ? request.getEndpoint() : null;
        pushSubscriptionService.unsubscribe(authentication.getName(), endpoint);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/send-test-email")
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(
            summary = "Send a test email to organizer",
            description = "Sends a test email with the provided template to the organizer's email address for preview purposes. Only organizers and administrators can use this endpoint.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Test email sent successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have organizer or admin privileges"
            )
    })
    public ResponseEntity<?> sendTestEmail(
            @Valid @RequestBody TestEmailRequest request,
            Authentication authentication) {
        String organizerEmail = authentication.getName();

        long eventId;
        try {
            eventId = Long.parseLong(request.getEventId());
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid event id"
            ));
        }

        // The caller must be an organizer of the specific event (or a platform
        // admin / legacy owner). Platform ORGANIZER/ADMIN authority alone must
        // not grant the ability to mail for arbitrary events (#16253).
        eventRoleService.requireRole(eventId, organizerEmail, EventRole.ORGANIZER);

        return ResponseEntity.ok(emailTemplateService.sendTestEmail(request, organizerEmail));
    }

    @PostMapping("/save-template")
    @Operation(
            summary = "Save a custom email template",
            description = "Saves a custom email template for an event and template type.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Template saved successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have permission"
            )
    })
    public ResponseEntity<TemplateResponse> saveTemplate(
            @Valid @RequestBody SaveTemplateRequest request,
            Authentication authentication) {
        String organizerEmail = authentication.getName();
        return ResponseEntity.ok(emailTemplateService.saveTemplate(request, organizerEmail));
    }

    @GetMapping("/templates/{eventId}/{templateType}")
    @Operation(
            summary = "Get a custom email template",
            description = "Retrieves a custom email template for an event and template type.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Template retrieved successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Template not found"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - User does not have permission"
            )
    })
    public ResponseEntity<TemplateResponse> getTemplate(
            @PathVariable String eventId,
            @PathVariable String templateType,
            Authentication authentication) {
        String organizerEmail = authentication.getName();
        return ResponseEntity.ok(emailTemplateService.getTemplate(String.valueOf(eventId), templateType, organizerEmail));
    }
}
