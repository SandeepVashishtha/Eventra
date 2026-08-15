package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.CreatePollRequest;
import com.sandeep.eventrabackend.dto.request.CreateQuestionRequest;
import com.sandeep.eventrabackend.dto.request.SubmitVoteRequest;
import com.sandeep.eventrabackend.dto.request.UpdatePollStatusRequest;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.dto.response.LiveAudienceDataResponse;
import com.sandeep.eventrabackend.dto.response.LiveAudiencePollResponse;
import com.sandeep.eventrabackend.dto.response.LiveAudienceQuestionResponse;
import com.sandeep.eventrabackend.service.LiveAudienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}/live-audience")
@RequiredArgsConstructor
@Tag(name = "Live Audience", description = "Endpoints for the live Q&A board and polls during an event")
public class LiveAudienceController {

    private final LiveAudienceService liveAudienceService;

    @GetMapping
    @Operation(summary = "Get initial live audience data",
            description = "Returns the Q&A questions and the latest poll for an event. Requires authentication.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Live audience data fetched successfully",
                    content = @Content(schema = @Schema(implementation = LiveAudienceDataResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LiveAudienceDataResponse> getInitialData(
            @PathVariable Long eventId,
            Authentication authentication) {
        return ResponseEntity.ok(liveAudienceService.getInitialData(eventId, authentication.getName()));
    }

    @GetMapping("/questions")
    @Operation(summary = "List live audience questions",
            description = "Returns the Q&A questions for an event, ordered by upvotes then recency. Requires authentication.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Questions fetched successfully",
                    content = @Content(schema = @Schema(implementation = LiveAudienceQuestionResponse.class))),
            @ApiResponse(responseCode = "404", description = "Event not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<java.util.List<LiveAudienceQuestionResponse>> getQuestions(
            @PathVariable Long eventId,
            Authentication authentication) {
        return ResponseEntity.ok(liveAudienceService.getQuestions(eventId, authentication.getName()));
    }

    @PostMapping("/questions")
    @Operation(summary = "Submit a Q&A question",
            description = "Posts a question to the live audience board. Requires authentication.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Question submitted successfully",
                    content = @Content(schema = @Schema(implementation = LiveAudienceQuestionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid payload (validation failed)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LiveAudienceQuestionResponse> createQuestion(
            @PathVariable Long eventId,
            @Valid @RequestBody CreateQuestionRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(liveAudienceService.createQuestion(eventId, request.getText(), authentication.getName()));
    }

    @PostMapping("/questions/{questionId}/upvote")
    @Operation(summary = "Upvote a Q&A question",
            description = "Upvotes a question. Each user can upvote a question at most once. Requires authentication.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Question upvoted successfully",
                    content = @Content(schema = @Schema(implementation = LiveAudienceQuestionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Question not found or already upvoted",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LiveAudienceQuestionResponse> upvoteQuestion(
            @PathVariable Long eventId,
            @PathVariable Long questionId,
            Authentication authentication) {
        return ResponseEntity.ok(
                liveAudienceService.upvoteQuestion(eventId, questionId, authentication.getName()));
    }

    @PostMapping("/questions/{questionId}/flag")
    @Operation(summary = "Flag a Q&A question",
            description = "Flags a question for moderation. Requires organizer, admin or owner access.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Question flagged successfully",
                    content = @Content(schema = @Schema(implementation = LiveAudienceQuestionResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient event role",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LiveAudienceQuestionResponse> flagQuestion(
            @PathVariable Long eventId,
            @PathVariable Long questionId,
            Authentication authentication) {
        return ResponseEntity.ok(
                liveAudienceService.flagQuestion(eventId, questionId, authentication.getName()));
    }

    @DeleteMapping("/questions/{questionId}")
    @Operation(summary = "Delete a Q&A question",
            description = "Deletes a question. Requires organizer, admin or owner access.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Question deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient event role",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long eventId,
            @PathVariable Long questionId,
            Authentication authentication) {
        liveAudienceService.deleteQuestion(eventId, questionId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/polls")
    @Operation(summary = "Create a live poll",
            description = "Creates a new poll for the event. Requires organizer, admin or owner access.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Poll created successfully",
                    content = @Content(schema = @Schema(implementation = LiveAudiencePollResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid payload (validation failed)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient event role",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LiveAudiencePollResponse> createPoll(
            @PathVariable Long eventId,
            @Valid @RequestBody CreatePollRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(liveAudienceService.createPoll(eventId, request, authentication.getName()));
    }

    @PostMapping("/polls/{pollId}/status")
    @Operation(summary = "Update poll status",
            description = "Sets a poll status to 'active', 'paused' or 'closed'. Requires organizer, admin or owner access.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Poll status updated successfully",
                    content = @Content(schema = @Schema(implementation = LiveAudiencePollResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid payload (validation failed)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient event role",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LiveAudiencePollResponse> updatePollStatus(
            @PathVariable Long eventId,
            @PathVariable Long pollId,
            @Valid @RequestBody UpdatePollStatusRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                liveAudienceService.updatePollStatus(eventId, pollId, request.getStatus(), authentication.getName()));
    }

    @PostMapping("/polls/{pollId}/vote")
    @Operation(summary = "Submit a poll vote",
            description = "Records a vote for a poll option. Each user can vote once per poll. Requires authentication.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vote submitted successfully",
                    content = @Content(schema = @Schema(implementation = LiveAudiencePollResponse.class))),
            @ApiResponse(responseCode = "400", description = "Poll not found, voting closed or already voted",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<LiveAudiencePollResponse> submitVote(
            @PathVariable Long eventId,
            @PathVariable Long pollId,
            @Valid @RequestBody SubmitVoteRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                liveAudienceService.submitVote(eventId, pollId, request.getOption(), authentication.getName()));
    }
}
