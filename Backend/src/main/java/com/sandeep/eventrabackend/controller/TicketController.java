package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.TicketCheckInRequest;
import com.sandeep.eventrabackend.dto.response.CheckInHistoryItem;
import com.sandeep.eventrabackend.dto.response.CheckInResponse;
import com.sandeep.eventrabackend.dto.response.TicketStatsResponse;
import com.sandeep.eventrabackend.dto.response.TicketValidationResponse;
import com.sandeep.eventrabackend.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Ticket scanning endpoints used by the organizer's QR code scanner.
 * <p>
 * Implements the contract previously provided by the serverless
 * {@code api/tickets/*} functions so the scanner can validate, check in, and
 * report on tickets against the real backend. Event-level authorization is
 * enforced via {@link com.sandeep.eventrabackend.service.EventRoleService} so
 * organizers can only scan and view data for events they manage.
 */
@RestController
@RequestMapping("/api/tickets")
@PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Ticket Scanning", description = "Organizer ticket validation, check-in, history, and stats")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/validate")
    @Operation(
            summary = "Validate a ticket QR code",
            description = "Checks whether a scanned ticket is valid for the given event without checking it in. Accepts a signed JWT QR token or a raw registration id.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<TicketValidationResponse> validate(
            @Valid @RequestBody TicketCheckInRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                ticketService.validateTicket(request.getTicketId(), request.getEventId(), authentication.getName()));
    }

    @PostMapping("/checkin")
    @Operation(
            summary = "Check in an attendee",
            description = "Records a check-in for a scanned ticket. Returns 409 when the attendee is already checked in and 403 when the organizer does not manage the event.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<CheckInResponse> checkIn(
            @Valid @RequestBody TicketCheckInRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                ticketService.checkIn(request.getTicketId(), request.getEventId(), authentication.getName()));
    }

    @GetMapping("/checkins")
    @Operation(
            summary = "List check-in history",
            description = "Returns the scan history for one event (when eventId is given) or across all events the organizer manages.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<List<CheckInHistoryItem>> getCheckInHistory(
            @Parameter(description = "Optional event id to filter history by")
            @RequestParam(required = false) Long eventId,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.getCheckInHistory(eventId, authentication.getName()));
    }

    @GetMapping("/stats")
    @Operation(
            summary = "Get attendance stats",
            description = "Returns registration and check-in totals for an event the organizer manages.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<TicketStatsResponse> getTicketStats(
            @Parameter(description = "Event id to compute stats for")
            @RequestParam Long eventId,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketStats(eventId, authentication.getName()));
    }
}
