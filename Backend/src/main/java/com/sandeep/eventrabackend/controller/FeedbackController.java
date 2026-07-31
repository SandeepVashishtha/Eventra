package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.FeedbackRequest;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.dto.response.FeedbackResponse;
import com.sandeep.eventrabackend.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback", description = "Endpoints for submitting event feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @Operation(
            summary = "Submit feedback for an event",
            description = "Allows an attendee to rate and comment on an event they registered for."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Feedback submitted successfully",
                    content = @Content(schema = @Schema(implementation = FeedbackResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT required",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - User not registered for event",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event or User not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflict - Duplicate feedback",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            Authentication authentication) {
        
        FeedbackResponse response = feedbackService.submitFeedback(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
