package com.sandeep.eventrabackend.controller;

import com.eventra.service.QrCodeValidationService;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.TicketCheckIn;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.TicketCheckInRepository;
import com.sandeep.eventrabackend.service.EventRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Ticket scanning endpoints backing the admin ticket scanner
 * ({@code src/services/ticketService.js}). Exposes validate / check-in /
 * history / stats under {@code /api/tickets} (FIX #15369).
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Tickets", description = "Ticket validation and venue check-in for organizers and admins")
public class TicketController {

    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRepository eventRepository;
    private final TicketCheckInRepository ticketCheckInRepository;
    private final QrCodeValidationService qrCodeValidationService;
    private final EventRoleService eventRoleService;

    @PostMapping("/validate")
    @Operation(summary = "Validate a ticket",
            description = "Validates a ticket (registration) for an event without recording a check-in.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Validation result",
                    content = @Content(schema = @Schema(example = """
                            {"valid": true, "userName": "Alex Rivera", "registrationId": 42,
                             "alreadyCheckedIn": false, "message": "Ticket is valid"}"""))),
            @ApiResponse(responseCode = "403", description = "Forbidden - organizer/admin access required")
    })
    public ResponseEntity<Map<String, Object>> validateTicket(Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        Long eventId = asLong(payload.get("eventId"));
        Long registrationId = asLong(payload.get("ticketId"));

        if (eventId == null || registrationId == null) {
            return ResponseEntity.ok(result(false, null, null, false,
                    "ticketId and eventId are required."));
        }

        Optional<EventRegistration> registration =
                eventRegistrationRepository.findById(registrationId);
        if (registration.isEmpty()
                || !registration.get().getEvent().getId().equals(eventId)) {
            return ResponseEntity.ok(result(false, null, registrationId, false,
                    "This ticket does not match the selected event."));
        }

        // Object-level authorization: the caller must organize the event the ticket belongs to.
        if (!isAuthorizedForEvent(eventId, authentication)) {
            return forbidden();
        }

        EventRegistration reg = registration.get();
        if (!"CONFIRMED".equals(reg.getStatus())) {
            return ResponseEntity.ok(result(false, null, registrationId, false,
                    "This ticket is no longer valid."));
        }

        Event event = reg.getEvent();
        if ("CANCELLED".equals(event.getStatus()) || "COMPLETED".equals(event.getStatus())) {
            return ResponseEntity.ok(result(false, null, registrationId, false,
                    "Event status does not allow check-in."));
        }

        boolean alreadyCheckedIn =
                ticketCheckInRepository.existsByEventIdAndRegistrationId(eventId, registrationId);

        QrCodeValidationService.QrValidationResult qrResult = qrCodeValidationService
                .validateQrCodeWithRegistrationId(registrationId, reg.getStatus(), event.getStatus(), null);
        if (!qrResult.isValid()) {
            return ResponseEntity.ok(result(false, displayName(reg), registrationId, alreadyCheckedIn, qrResult.message()));
        }

        return ResponseEntity.ok(result(true, displayName(reg), registrationId, alreadyCheckedIn,
                alreadyCheckedIn ? "This ticket has already been checked in." : "Ticket is valid"));
    }

    @PostMapping("/checkin")
    @Operation(summary = "Record a check-in",
            description = "Validates a ticket and records an idempotent, duplicate-guarded check-in.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Check-in result",
                    content = @Content(schema = @Schema(example = """
                            {"valid": true, "userName": "Alex Rivera", "registrationId": 42,
                             "alreadyCheckedIn": false, "checkedInAt": "2026-08-12T10:00:00",
                             "message": "Check-in recorded"}"""))),
            @ApiResponse(responseCode = "403", description = "Forbidden - organizer/admin access required")
    })
    public ResponseEntity<Map<String, Object>> checkIn(Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        Long eventId = asLong(payload.get("eventId"));
        Long registrationId = asLong(payload.get("ticketId"));

        if (eventId == null || registrationId == null) {
            return ResponseEntity.ok(result(false, null, null, false,
                    "ticketId and eventId are required."));
        }

        Optional<EventRegistration> registration =
                eventRegistrationRepository.findById(registrationId);
        if (registration.isEmpty()
                || !registration.get().getEvent().getId().equals(eventId)) {
            return ResponseEntity.ok(result(false, null, registrationId, false,
                    "This ticket does not match the selected event."));
        }

        // Object-level authorization: the caller must organize the event the ticket belongs to.
        if (!isAuthorizedForEvent(eventId, authentication)) {
            return forbidden();
        }

        EventRegistration reg = registration.get();
        if (!"CONFIRMED".equals(reg.getStatus())) {
            return ResponseEntity.ok(result(false, null, registrationId, false,
                    "This ticket is no longer valid."));
        }

        Event event = reg.getEvent();
        if ("CANCELLED".equals(event.getStatus()) || "COMPLETED".equals(event.getStatus())) {
            return ResponseEntity.ok(result(false, null, registrationId, false,
                    "Event status does not allow check-in."));
        }

        QrCodeValidationService.QrValidationResult qrResult = qrCodeValidationService
                .validateQrCodeWithRegistrationId(registrationId, reg.getStatus(), event.getStatus(), null);
        if (!qrResult.isValid()) {
            return ResponseEntity.ok(result(false, displayName(reg), registrationId,
                    ticketCheckInRepository.existsByEventIdAndRegistrationId(eventId, registrationId),
                    qrResult.message()));
        }

        if (ticketCheckInRepository.existsByEventIdAndRegistrationId(eventId, registrationId)) {
            return ResponseEntity.ok(result(true, displayName(reg), registrationId, true,
                    "This ticket has already been checked in."));
        }

        // Two concurrent scans can both pass the exists() check above and race to insert
        // the same (event, registration) row; the unique constraint then rejects the loser.
        // Flush eagerly so the violation surfaces here and is mapped to a friendly 409.
        try {
            ticketCheckInRepository.saveAndFlush(TicketCheckIn.builder()
                    .eventId(eventId)
                    .registrationId(registrationId)
                    .attendeeName(displayName(reg))
                    .checkedInBy(payload.get("checkedInBy") != null ? String.valueOf(payload.get("checkedInBy")) : null)
                    .build());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    result(true, displayName(reg), registrationId, true,
                            "This ticket has already been checked in."));
        }

        Map<String, Object> response = result(true, displayName(reg), registrationId, false,
                "Check-in recorded successfully.");
        response.put("checkedInAt", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/checkins")
    @Operation(summary = "Check-in history",
            description = "Returns the check-in history for an event, newest first.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Check-in history list",
                    content = @Content(schema = @Schema(example = """
                            [{"id": 1, "ticketId": 42, "name": "Alex Rivera",
                              "event": "Spring Boot Workshop 2025", "status": "Verified",
                              "time": "2026-08-12T10:00:00"}]"""))),
            @ApiResponse(responseCode = "403", description = "Forbidden - organizer/admin access required")
    })
    public ResponseEntity<List<Map<String, Object>>> checkInHistory(@RequestParam(required = false) Long eventId) {
        if (eventId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<Map<String, Object>> entries = ticketCheckInRepository
                .findByEventIdOrderByCheckedInAtDesc(eventId)
                .stream()
                .map(checkIn -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("id", checkIn.getId());
                    entry.put("ticketId", checkIn.getRegistrationId());
                    entry.put("name", checkIn.getAttendeeName());
                    entry.put("event", eventRepository.findById(checkIn.getEventId())
                            .map(Event::getTitle).orElse(null));
                    entry.put("status", "Verified");
                    entry.put("time", checkIn.getCheckedInAt() != null
                            ? checkIn.getCheckedInAt().toString()
                            : null);
                    return entry;
                })
                .toList();
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/stats")
    @Operation(summary = "Ticket statistics",
            description = "Returns registration/check-in statistics for an event.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ticket statistics",
                    content = @Content(schema = @Schema(example = """
                            {"totalRegistrations": 100, "checkedInAttendees": 45,
                             "remainingAttendees": 55, "attendancePercentage": 45}"""))),
            @ApiResponse(responseCode = "403", description = "Forbidden - organizer/admin access required")
    })
    public ResponseEntity<Map<String, Object>> ticketStats(@RequestParam(required = false) Long eventId) {
        if (eventId == null) {
            return ResponseEntity.ok(emptyStats());
        }
        long total = eventRegistrationRepository.countByEvent_IdAndStatus(eventId, "CONFIRMED");
        long checkedIn = ticketCheckInRepository.countByEventId(eventId);
        long remaining = Math.max(0, total - checkedIn);
        int percentage = total > 0 ? (int) Math.round((checkedIn * 100.0) / total) : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRegistrations", total);
        stats.put("checkedInAttendees", checkedIn);
        stats.put("remainingAttendees", remaining);
        stats.put("attendancePercentage", percentage);
        return ResponseEntity.ok(stats);
    }

    private Map<String, Object> result(boolean valid, String userName, Long registrationId,
            boolean alreadyCheckedIn, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("valid", valid);
        response.put("userName", userName);
        response.put("registrationId", registrationId);
        response.put("alreadyCheckedIn", alreadyCheckedIn);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> emptyStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRegistrations", 0L);
        stats.put("checkedInAttendees", 0L);
        stats.put("remainingAttendees", 0L);
        stats.put("attendancePercentage", 0);
        return stats;
    }

    private boolean isAuthorizedForEvent(Long eventId, Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        try {
            eventRoleService.requireRole(eventId, authentication.getName(), EventRole.ORGANIZER);
            return true;
        } catch (AccessDeniedException e) {
            return false;
        }
    }

    private ResponseEntity<Map<String, Object>> forbidden() {
        Map<String, Object> response = new HashMap<>();
        response.put("valid", false);
        response.put("message", "You are not authorized to manage this event.");
        return ResponseEntity.status(403).body(response);
    }

    private String displayName(EventRegistration reg) {
        String first = reg.getUser() != null ? reg.getUser().getFirstName() : null;
        String last = reg.getUser() != null ? reg.getUser().getLastName() : null;
        if (first != null && last != null) {
            return first + " " + last;
        }
        return reg.getUser() != null ? reg.getUser().getUsername() : "Unknown";
    }

    private Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
