package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.CancelEventRequest;
import com.sandeep.eventrabackend.dto.request.EventCreateRequest;
import com.sandeep.eventrabackend.dto.request.EventScheduleRequest;
import com.sandeep.eventrabackend.dto.request.EventUpdateRequest;
import com.sandeep.eventrabackend.dto.request.RegistrationRequest;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.dto.response.AttendeeDirectoryResponse;
import com.sandeep.eventrabackend.dto.response.EventAvailabilityResponse;
import com.sandeep.eventrabackend.dto.response.EventResponse;
import com.sandeep.eventrabackend.dto.response.EventScheduleResponse;
import com.sandeep.eventrabackend.dto.response.PagedResponse;
import com.sandeep.eventrabackend.dto.response.RegistrationResponse;
import com.sandeep.eventrabackend.dto.response.WaitlistResponse;
import com.sandeep.eventrabackend.service.EventService;
import com.sandeep.eventrabackend.service.EventStreamService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Events", description = "Endpoints for managing and interacting with events")
public class EventController {

        private final EventService eventService;
        private final EventStreamService eventStreamService;

        public EventController(EventService eventService, EventStreamService eventStreamService) {
                this.eventService = eventService;
                this.eventStreamService = eventStreamService;
        }

        // ── Issue #2102 — POST /api/events/create ────────────────────────────────

        @PostMapping("/create")
        @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Create a new event", description = "Allows an ORGANIZER, ADMIN or SUPER_ADMIN to create a new event. "
                        +
                        "The event registeredCount defaults to 0.", security = @SecurityRequirement(name = "bearerAuth"))
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Event created successfully", content = @Content(schema = @Schema(implementation = EventResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid payload (validation failed)", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Forbidden - User does not have ORGANIZER, ADMIN or SUPER_ADMIN role", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<EventResponse> createEvent(
                        @Valid @RequestBody EventCreateRequest request,
                        Authentication authentication) {

                EventResponse createdEvent = eventService.createEvent(request, authentication.getName());
                return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
        }

        // ── Issue #2099 — PUT /api/events/{id} ──────────────────────────────────

        @PutMapping("/{id}")
        @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Update an existing event", description = "Allows an ORGANIZER, ADMIN or SUPER_ADMIN to update event details.", security = @SecurityRequirement(name = "bearerAuth"))
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Event updated successfully", content = @Content(schema = @Schema(implementation = EventResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid payload (validation failed)", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Forbidden - User does not have ORGANIZER, ADMIN or SUPER_ADMIN role", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Event not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<EventResponse> updateEvent(
                        @Parameter(description = "ID of the event to update") @PathVariable Long id,
                        @Valid @RequestBody EventUpdateRequest request,
                        Authentication authentication) {

                EventResponse updatedEvent = eventService.updateEvent(id, request, authentication.getName());
                return ResponseEntity.ok(updatedEvent);
        }

        @GetMapping("/{id}/schedule")
        @Operation(summary = "Get event schedule", description = "Returns the persisted schedule for an event.")
        public ResponseEntity<EventScheduleResponse> getEventSchedule(
                        @Parameter(description = "ID of the event") @PathVariable Long id) {
                return ResponseEntity.ok(eventService.getEventSchedule(id));
        }

        @PatchMapping("/{id}/schedule")
        @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Update event schedule", description = "Persists the event schedule start time.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<EventScheduleResponse> updateEventSchedule(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        @Valid @RequestBody EventScheduleRequest request,
                        Authentication authentication) {
                return ResponseEntity.ok(eventService.updateEventSchedule(id, request, authentication.getName()));
        }

        // ── GET /api/events/stream ───────────────────────────────────────────────

        @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        @Operation(summary = "Stream event updates", description = "Establishes a Server-Sent Events (SSE) connection to receive real-time event updates.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "SSE connection established")
        })
        public SseEmitter streamEvents() {
                return eventStreamService.createEmitter();
        }

        @GetMapping
        @Operation(summary = "Get public events (paginated)", description = "Returns a page of public events. Supports page/size/search/status/sort query params.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Events fetched successfully", content = @Content(schema = @Schema(implementation = PagedResponse.class)))
        })
        public ResponseEntity<PagedResponse<EventResponse>> getAllEvents(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size,
                        @RequestParam(required = false) String search,
                        @RequestParam(required = false) List<String> status,
                        @RequestParam(required = false) String sort) {

                int clampedSize = Math.min(Math.max(size, 1), 100);
                int safePage = Math.max(page, 0);
                return ResponseEntity.ok(
                                eventService.getAllEvents(safePage, clampedSize, search, status, sort));
        }

        @GetMapping("/alternatives")
        @Operation(
                        summary = "Suggest alternative events in a date window",
                        description = "Returns a limited list of public events near a date for conflict resolution UI.")
        public ResponseEntity<List<EventResponse>> getAlternativeEvents(
                        @RequestParam(required = false) Long excludeId,
                        @RequestParam(required = false) String around,
                        @RequestParam(defaultValue = "14") int windowDays,
                        @RequestParam(defaultValue = "20") int limit) {
                java.time.LocalDateTime aroundDate = null;
                if (around != null && !around.isBlank()) {
                        aroundDate = java.time.LocalDateTime.parse(around);
                }
                return ResponseEntity.ok(
                                eventService.findAlternativeEvents(excludeId, aroundDate, windowDays, limit));
        }

        // ── Issue #12229 — GET /api/events/search ─────────────────────────────

        @GetMapping("/search")
        @Operation(summary = "Search and filter events", description = "Search and filter events by category, date range, price, and tags.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Events fetched successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = EventResponse.class))))
        })
        public ResponseEntity<List<EventResponse>> searchEvents(
                        @Parameter(description = "Search term for full-text search on title and description") @RequestParam(required = false) String search,
                        @Parameter(description = "Event category for filtering") @RequestParam(required = false) String category,
                        @Parameter(description = "Start date for filtering (ISO format)") @RequestParam(required = false) String startDate,
                        @Parameter(description = "End date for filtering (ISO format)") @RequestParam(required = false) String endDate,
                        @Parameter(description = "Filter for free events only") @RequestParam(required = false) Boolean free) {

                List<EventResponse> events = eventService.searchEvents(search, category, startDate, endDate, free);
                return ResponseEntity.ok(events);
        }

        // ── Issue #2101 — GET /api/events/{id} ──────────────────────────────────

        @GetMapping("/{id}")
        @Operation(summary = "Get a public event by ID", description = "Fetches a public event using its unique event ID.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Event fetched successfully", content = @Content(schema = @Schema(implementation = EventResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Event not found or not public", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<EventResponse> getPublicEventById(
                        @Parameter(description = "ID of the public event") @PathVariable Long id) {

                EventResponse event = eventService.getPublicEventById(id);
                return ResponseEntity.ok(event);
        }

        // ── Issue #2101 — GET /api/events/{id}/availability ─────────────────────

        @GetMapping("/{id}/availability")
        @Operation(summary = "Get event availability", description = "Returns capacity, registered users count, remaining spots, "
                        +
                        "and whether the event has already passed.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Event availability fetched successfully", content = @Content(schema = @Schema(implementation = EventAvailabilityResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Event not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<EventAvailabilityResponse> getEventAvailability(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        Authentication authentication) {

                EventAvailabilityResponse response = eventService.getEventAvailability(
                                id,
                                authentication == null ? null : authentication.getName());

                return ResponseEntity.ok(response);
        }

        @PostMapping("/{id}/waitlist")
        @Operation(summary = "Join an event waitlist", description = "Adds the authenticated user to the waitlist when an event is full.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<WaitlistResponse> joinWaitlist(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        Authentication authentication) {

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(eventService.joinWaitlist(id, authentication.getName()));
        }

        @GetMapping("/{id}/waitlist")
        @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "List waitlisted users for an event", description = "Admin and organizer view of active waitlist entries.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<List<WaitlistResponse>> getWaitlist(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        Authentication authentication) {

                return ResponseEntity.ok(eventService.getEventWaitlist(id, authentication.getName()));
        }

        @GetMapping("/{id}/attendees")
        @Operation(summary = "List opted-in attendees for an event", description = "Returns attendees who explicitly opted into the event attendee directory. Only registered attendees, event owners, and administrators can view it.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<List<AttendeeDirectoryResponse>> getAttendeeDirectory(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        Authentication authentication) {

                return ResponseEntity.ok(eventService.getAttendeeDirectory(id, authentication.getName()));
        }

        @DeleteMapping("/{id}/waitlist")
        @Operation(summary = "Leave an event waitlist", description = "Removes the authenticated user's active waitlist entry.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<Void> leaveWaitlist(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        Authentication authentication) {

                eventService.leaveWaitlist(id, authentication.getName());
                return ResponseEntity.noContent().build();
        }

        @GetMapping("/{id}/waitlist/me")
        @Operation(summary = "Get my waitlist position for an event", description = "Returns the authenticated user's active waitlist entry and position.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<WaitlistResponse> getMyWaitlistEntry(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        Authentication authentication) {

                return ResponseEntity.ok(eventService.getMyWaitlistEntry(id, authentication.getName()));
        }

        @DeleteMapping("/{id}/waitlist/{waitlistId}")
        @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Remove a waitlisted user", description = "Organizer/admin removes a waitlist entry without promoting them.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<Void> removeWaitlistEntry(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        @Parameter(description = "ID of the waitlist entry") @PathVariable Long waitlistId,
                        Authentication authentication) {

                eventService.removeWaitlistEntry(id, waitlistId, authentication.getName());
                return ResponseEntity.noContent().build();
        }

        @PostMapping("/{id}/waitlist/{waitlistId}/promote")
        @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Manually promote a waitlisted user", description = "Registers a waitlisted user when a spot is available.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<RegistrationResponse> promoteWaitlistedUser(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        @Parameter(description = "ID of the waitlist entry") @PathVariable Long waitlistId,
                        Authentication authentication) {

                return ResponseEntity.ok(eventService.promoteWaitlistedUser(id, waitlistId, authentication.getName()));
        }

        // ── Issue #2102 — POST /api/events/{id}/register ─────────────────────────

        @PostMapping("/{id}/register")
        @Operation(summary = "Register the authenticated user for an event", description = "Registers the currently authenticated user for a specific event. "
                        +
                        "Returns 409 if the event is full or the user is already registered.", security = @SecurityRequirement(name = "bearerAuth"))
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Successfully registered for event", content = @Content(schema = @Schema(implementation = RegistrationResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Registration closed - the event has already ended", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Event or user not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "409", description = "Event is already full or user already registered", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<RegistrationResponse> registerForEvent(
                        @Parameter(description = "ID of the event to register for") @PathVariable Long id,
                        @RequestBody(required = false) RegistrationRequest request,
                        Authentication authentication) {

                String userEmail = authentication.getName();
                String seatId = (request != null) ? request.getSeatId() : null;
                boolean showProfileInAttendeeDirectory = request != null
                                && Boolean.TRUE.equals(request.getShowProfileInAttendeeDirectory());

                RegistrationResponse response = eventService.registerUserForEvent(
                                id,
                                userEmail,
                                seatId,
                                showProfileInAttendeeDirectory);

                return ResponseEntity.ok(response);
        }

        @DeleteMapping("/{id}/registration")
        @Operation(summary = "Cancel the authenticated user's event registration", description = "Cancels a confirmed registration and auto-promotes the first waitlisted user.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<Void> cancelRegistration(
                        @Parameter(description = "ID of the event") @PathVariable Long id,
                        Authentication authentication) {

                eventService.cancelRegistration(id, authentication.getName());
                return ResponseEntity.noContent().build();
        }

        // ── Issue #11025 — GET /api/events/{id}/seats ───────────────────────────

        @GetMapping("/{id}/seats")
        @Operation(summary = "Get seats already reserved for an event", description = "Returns the seat identifiers already reserved for the event, "
                        +
                        "used to derive live occupancy for the seat selector.")
        public ResponseEntity<List<String>> getOccupiedSeats(
                        @Parameter(description = "ID of the event") @PathVariable Long id) {

                return ResponseEntity.ok(eventService.getOccupiedSeats(id));
        }

        // ── Event cancellation ─ POST /api/events/{id}/cancel ─────────────────

        @PostMapping("/{id}/cancel")
        @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Cancel an event", description = "Cancels an event. Only the event's own organizer or an "
                        +
                        "administrator (ADMIN / SUPER_ADMIN) may cancel an event.", security = @SecurityRequirement(name = "bearerAuth"))
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Event cancelled successfully", content = @Content(schema = @Schema(implementation = EventResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid payload (validation failed)", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Forbidden - User is not the event owner or an administrator", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Event not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "409", description = "Event is already cancelled", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<EventResponse> cancelEvent(
                        @Parameter(description = "ID of the event to cancel") @PathVariable Long id,
                        @Valid @RequestBody CancelEventRequest request,
                        Authentication authentication) {

                return ResponseEntity.ok(
                                eventService.cancelEvent(id, authentication.getName(), request));
        }

        @PostMapping("/{id}/resend-cancellation-notice")
        @PreAuthorize("isAuthenticated()")
        @Operation(summary = "Resend cancellation notice", description = "Resends the cancellation notification to a specific attendee.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<Void> resendCancellationNotice(
                        @PathVariable Long id,
                        @RequestBody java.util.Map<String, String> body,
                        Authentication authentication) {
                eventService.resendCancellationNotice(id, authentication.getName(), body.get("attendeeEmail"));
                return ResponseEntity.ok().build();
        }

        @GetMapping("/{id}/notified-attendees")
        @PreAuthorize("isAuthenticated()")
        @Operation(summary = "List notified attendees", description = "Returns emails of confirmed attendees for a cancelled event.", security = @SecurityRequirement(name = "bearerAuth"))
        public ResponseEntity<List<String>> getNotifiedAttendees(
                        @PathVariable Long id,
                        Authentication authentication) {
                return ResponseEntity.ok(eventService.getNotifiedAttendees(id, authentication.getName()));
        }

        // ── Issue #2100 — DELETE /api/events/{id} ───────────────────────────────

        @DeleteMapping("/{id}")
        @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN')")
        @Operation(summary = "Delete an event", description = "Allows an ADMIN or SUPER_ADMIN to delete an event.", security = @SecurityRequirement(name = "bearerAuth"))
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Event deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Forbidden - User does not have ADMIN or SUPER_ADMIN role", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Event not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<Void> deleteEvent(
                        @Parameter(description = "ID of the event to delete") @PathVariable Long id) {

                eventService.deleteEvent(id);
                return ResponseEntity.noContent().build();
        }
}
