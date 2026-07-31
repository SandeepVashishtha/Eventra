package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.EventCreateRequest;
import com.sandeep.eventrabackend.dto.request.EventUpdateRequest;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.dto.response.EventAvailabilityResponse;
import com.sandeep.eventrabackend.dto.response.EventResponse;
import com.sandeep.eventrabackend.dto.response.RegistrationResponse;
import com.sandeep.eventrabackend.model.Event;
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
@Tag(
        name = "Events",
        description = "Endpoints for managing and interacting with events"
)
public class EventController {

    private final EventService eventService;
    private final EventStreamService eventStreamService;

    public EventController(EventService eventService, EventStreamService eventStreamService) {
        this.eventService = eventService;
        this.eventStreamService = eventStreamService;
    }

    // ── Issue #2102 — POST /api/events/create ────────────────────────────────

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN')")
    @Operation(
            summary = "Create a new event",
            description = "Allows an ORGANIZER or ADMIN to create a new event. " +
                          "The event registeredCount defaults to 0.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Event created successfully",
                    content = @Content(
                            schema = @Schema(implementation = EventResponse.class)
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
                    description = "Forbidden - User does not have ORGANIZER or ADMIN role",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody EventCreateRequest request) {

        EventResponse createdEvent = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    // ── Issue #2099 — PUT /api/events/{id} ──────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN')")
    @Operation(
            summary = "Update an existing event",
            description = "Allows an ORGANIZER or ADMIN to update event details.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Event updated successfully",
                    content = @Content(
                            schema = @Schema(implementation = EventResponse.class)
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
                    description = "Forbidden - User does not have ORGANIZER or ADMIN role",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Event not found",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<EventResponse> updateEvent(
            @Parameter(description = "ID of the event to update")
            @PathVariable Long id,
            @Valid @RequestBody EventUpdateRequest request) {

        EventResponse updatedEvent = eventService.updateEvent(id, request);
        return ResponseEntity.ok(updatedEvent);
    }

    // ── GET /api/events/stream ───────────────────────────────────────────────

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(
            summary = "Stream event updates",
            description = "Establishes a Server-Sent Events (SSE) connection to receive real-time event updates."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "SSE connection established"
            )
    })
    public SseEmitter streamEvents() {
        return eventStreamService.createEmitter();
    }

    @GetMapping
    @Operation(
            summary = "Get all events",
            description = "Returns a list of all available events."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Events fetched successfully",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = EventResponse.class))
                    )
            )
    })
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // ── Issue #2101 — GET /api/events/{id} ──────────────────────────────────

    @GetMapping("/{id}")
    @Operation(
            summary = "Get a public event by ID",
            description = "Fetches a public event using its unique event ID."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Event fetched successfully",
                    content = @Content(
                            schema = @Schema(implementation = EventResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Event not found or not public",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<EventResponse> getPublicEventById(
            @Parameter(description = "ID of the public event")
            @PathVariable Long id) {

        EventResponse event = eventService.getPublicEventById(id);
        return ResponseEntity.ok(event);
    }

    // ── Issue #2101 — GET /api/events/{id}/availability ─────────────────────

    @GetMapping("/{id}/availability")
    @Operation(
            summary = "Get event availability",
            description =
                    "Returns capacity, registered users count, remaining spots, " +
                    "and whether the event has already passed."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Event availability fetched successfully",
                    content = @Content(
                            schema = @Schema(
                                    implementation = EventAvailabilityResponse.class
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Event not found",
                    content = @Content(
                            schema = @Schema(
                                    implementation = ErrorResponse.class
                            )
                    )
            )
    })
    public ResponseEntity<EventAvailabilityResponse> getEventAvailability(
            @Parameter(description = "ID of the event")
            @PathVariable Long id) {

        EventAvailabilityResponse response =
                eventService.getEventAvailability(id);

        return ResponseEntity.ok(response);
    }

    // ── Issue #2102 — POST /api/events/{id}/register ─────────────────────────

    @PostMapping("/{id}/register")
    @Operation(
            summary = "Register the authenticated user for an event",
            description =
                    "Registers the currently authenticated user for a specific event. " +
                    "Returns 409 if the event is full or the user is already registered.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully registered for event",
                    content = @Content(
                            schema = @Schema(
                                    implementation = RegistrationResponse.class
                            )
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
                    description = "Event or user not found",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Event is already full or user already registered",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<RegistrationResponse> registerForEvent(
            @Parameter(description = "ID of the event to register for")
            @PathVariable Long id,
            Authentication authentication) {

        String userEmail = authentication.getName();

        RegistrationResponse response =
                eventService.registerUserForEvent(id, userEmail);

        return ResponseEntity.ok(response);
    }

    // ── Issue #2100 — DELETE /api/events/{id} ───────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN')")
    @Operation(
            summary = "Delete an event",
            description = "Allows an ADMIN or SUPER_ADMIN to delete an event.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "204",
                    description = "Event deleted successfully"
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
                    description = "Forbidden - User does not have ADMIN or SUPER_ADMIN role",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Event not found",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> deleteEvent(
            @Parameter(description = "ID of the event to delete")
            @PathVariable Long id) {

        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
