package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.CreateLostItemRequest;
import com.sandeep.eventrabackend.dto.request.UpdateLostItemRequest;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.dto.response.LostItemResponse;
import com.sandeep.eventrabackend.security.CustomUserDetails;
import com.sandeep.eventrabackend.service.LostItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events/{eventId}/lost-items")
@RequiredArgsConstructor
@Tag(name = "Lost Items", description = "Endpoints for managing lost and found items for events")
public class LostItemController {

    private final LostItemService lostItemService;

    @GetMapping
    @Operation(
            summary = "Get all lost items for an event",
            description = "Retrieves all lost and found items for a specific event, ordered by most recent"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of lost items retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = LostItemResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<LostItemResponse>> getAllLostItems(@PathVariable Long eventId) {
        List<LostItemResponse> responses = lostItemService.getAllLostItemsByEvent(eventId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/unclaimed")
    @Operation(
            summary = "Get unclaimed lost items for an event",
            description = "Retrieves only unclaimed lost and found items for a specific event"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of unclaimed lost items retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = LostItemResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<LostItemResponse>> getUnclaimedLostItems(@PathVariable Long eventId) {
        List<LostItemResponse> responses = lostItemService.getUnclaimedLostItemsByEvent(eventId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/search")
    @Operation(
            summary = "Search lost items for an event",
            description = "Searches lost and found items by keyword in title, description, or tags"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = LostItemResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<LostItemResponse>> searchLostItems(
            @PathVariable Long eventId,
            @RequestParam String q) {
        List<LostItemResponse> responses = lostItemService.searchLostItemsByEvent(eventId, q);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/tag/{tag}")
    @Operation(
            summary = "Get lost items by AI tag for an event",
            description = "Retrieves lost and found items that have been tagged with specific AI-generated tags"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of lost items with tag retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = LostItemResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<LostItemResponse>> getLostItemsByTag(
            @PathVariable Long eventId,
            @PathVariable String tag) {
        List<LostItemResponse> responses = lostItemService.searchByTag(eventId, tag);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/category/{category}")
    @Operation(
            summary = "Get lost items by category for an event",
            description = "Retrieves lost and found items filtered by category"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of lost items by category retrieved successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = LostItemResponse.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<LostItemResponse>> getLostItemsByCategory(
            @PathVariable Long eventId,
            @PathVariable String category) {
        List<LostItemResponse> responses = lostItemService.getLostItemsByCategory(eventId, category);
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @Operation(
            summary = "Create a new lost item",
            description = "Creates a new lost and found item for the specified event"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Lost item created successfully",
                    content = @Content(schema = @Schema(implementation = LostItemResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LostItemResponse> createLostItem(
            @PathVariable Long eventId,
            @Valid @RequestBody CreateLostItemRequest request) {
        Long userId = getCurrentUserId();
        LostItemResponse response = lostItemService.createLostItem(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update a lost item",
            description = "Updates an existing lost and found item"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lost item updated successfully",
                    content = @Content(schema = @Schema(implementation = LostItemResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - Not authorized to update this item",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Lost item not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LostItemResponse> updateLostItem(
            @PathVariable Long eventId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateLostItemRequest request) {
        Long userId = getCurrentUserId();
        LostItemResponse response = lostItemService.updateLostItem(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/claim")
    @Operation(
            summary = "Mark a lost item as claimed",
            description = "Marks a lost and found item as claimed by the current user"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lost item marked as claimed successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Lost item not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> markAsClaimed(
            @PathVariable Long eventId,
            @PathVariable Long id) {
        Long userId = getCurrentUserId();
        lostItemService.markAsClaimed(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a lost item",
            description = "Deletes a lost and found item"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Lost item deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - Not authorized to delete this item",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Lost item not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteLostItem(
            @PathVariable Long eventId,
            @PathVariable Long id) {
        Long userId = getCurrentUserId();
        lostItemService.deleteLostItem(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get a specific lost item by ID",
            description = "Retrieves details for a specific lost and found item"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lost item retrieved successfully",
                    content = @Content(schema = @Schema(implementation = LostItemResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Lost item not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LostItemResponse> getLostItemById(
            @PathVariable Long eventId,
            @PathVariable Long id) {
        LostItemResponse response = lostItemService.getLostItemById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    @Operation(
            summary = "Get count of lost items for an event",
            description = "Returns the total count of lost and found items for a specific event"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Count retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Map<String, Long>> getLostItemCount(@PathVariable Long eventId) {
        long total = lostItemService.getLostItemCountByEvent(eventId);
        long unclaimed = lostItemService.getUnclaimedLostItemCountByEvent(eventId);
        
        return ResponseEntity.ok(Map.of(
                "total", total,
                "unclaimed", unclaimed
        ));
    }

    // Helper method to extract current user ID from JWT
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails customUser) {
            return customUser.getUser().getId();
        }
        
        return null;
    }
}