package com.sandeep.eventrabackend.subtitles;

import com.sandeep.eventrabackend.exception.ResourceNotFoundException;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.service.EventRoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import jakarta.validation.Valid;
import java.util.*;

/**
 * REST Controller for managing real-time multilingual subtitles
 * 
 * Provides endpoints for:
 * - Creating and retrieving subtitles
 * - Managing subtitle sessions
 * - Streaming subtitles via SSE
 * - Getting statistics and analytics
 */
@RestController
@RequestMapping("/api/v1/subtitles")
@Slf4j
@RequiredArgsConstructor
public class SubtitleController {
    
    private final SubtitleService subtitleService;
    private final EventRoleService eventRoleService;
    private final UserRepository userRepository;
    
    // ==================== Subtitle CRUD Operations ====================
    
    /**
     * Create a new subtitle
     *
     * FIX (#16191): The caller must organize the target event and the subtitle
     * is attributed to the authenticated principal, never to a client-supplied
     * userId.
     */
    @PostMapping
    public ResponseEntity<SubtitleDTO> createSubtitle(Authentication authentication,
            @Valid @RequestBody SubtitleDTO subtitleDTO) {
        assertCanModifyEvent(resolveEventId(subtitleDTO.getEventId(), subtitleDTO.getSessionId()), authentication);
        subtitleDTO.setUserId(currentUser(authentication).getId());
        Subtitle subtitle = subtitleService.createSubtitle(subtitleDTO);
        SubtitleDTO result = SubtitleDTO.fromEntity(subtitle);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
    
    /**
     * Create a real-time subtitle (for streaming)
     *
     * FIX (#16191): The caller must organize the target event and the subtitle
     * is attributed to the authenticated principal, never to a client-supplied
     * userId.
     */
    @PostMapping("/realtime")
    public ResponseEntity<SubtitleDTO> createRealTimeSubtitle(Authentication authentication,
            @Valid @RequestBody RealTimeSubtitleRequest request) {
        assertCanModifyEvent(resolveEventId(request.getEventId(), request.getSessionId()), authentication);
        request.setUserId(currentUser(authentication).getId());
        Subtitle subtitle = subtitleService.createRealTimeSubtitle(request);
        SubtitleDTO result = SubtitleDTO.fromEntity(subtitle);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
    
    /**
     * Get subtitle by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubtitleDTO> getSubtitleById(@PathVariable Long id) {
        Optional<Subtitle> subtitle = subtitleService.getSubtitleById(id);
        return subtitle
                .map(SubtitleDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * Get subtitle by UUID
     */
    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<SubtitleDTO> getSubtitleByUuid(@PathVariable String uuid) {
        Optional<Subtitle> subtitle = subtitleService.getSubtitleByUuid(uuid);
        return subtitle
                .map(SubtitleDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * Get subtitles by event ID
     */
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<SubtitleDTO>> getSubtitlesByEventId(@PathVariable Long eventId) {
        List<Subtitle> subtitles = subtitleService.getSubtitlesByEventId(eventId);
        List<SubtitleDTO> dtos = subtitles.stream()
                .map(SubtitleDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * Get active subtitles for an event
     */
    @GetMapping("/event/{eventId}/active")
    public ResponseEntity<List<SubtitleDTO>> getActiveSubtitlesByEventId(@PathVariable Long eventId) {
        List<Subtitle> subtitles = subtitleService.getActiveSubtitlesByEventId(eventId);
        List<SubtitleDTO> dtos = subtitles.stream()
                .map(SubtitleDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * Get recent subtitles for an event (paginated)
     */
    @GetMapping("/event/{eventId}/recent")
    public ResponseEntity<Page<SubtitleDTO>> getRecentSubtitlesByEventId(
            @PathVariable Long eventId,
            @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
        Page<Subtitle> page = subtitleService.getRecentSubtitlesByEventId(eventId, pageable);
        Page<SubtitleDTO> dtoPage = page.map(SubtitleDTO::fromEntity);
        return ResponseEntity.ok(dtoPage);
    }
    
    /**
     * Get subtitles by session ID
     */
    @GetMapping("/session/{sessionId}/subtitles")
    public ResponseEntity<List<SubtitleDTO>> getSubtitlesBySessionId(@PathVariable String sessionId) {
        List<Subtitle> subtitles = subtitleService.getSubtitlesBySessionId(sessionId);
        List<SubtitleDTO> dtos = subtitles.stream()
                .map(SubtitleDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * Get subtitles by user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubtitleDTO>> getSubtitlesByUserId(
            @PathVariable Long userId,
            Authentication authentication) {
        assertCanReadUser(userId, authentication);
        List<Subtitle> subtitles = subtitleService.getSubtitlesByUserId(userId);
        List<SubtitleDTO> dtos = subtitles.stream()
                .map(SubtitleDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * Update a subtitle
     */
    @PutMapping("/{id}")
    public ResponseEntity<SubtitleDTO> updateSubtitle(
            @PathVariable Long id,
            @Valid @RequestBody SubtitleDTO subtitleDTO,
            Authentication authentication) {
        assertCanModifySubtitle(id, authentication);
        Subtitle subtitle = subtitleService.updateSubtitle(id, subtitleDTO);
        SubtitleDTO result = SubtitleDTO.fromEntity(subtitle);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Mark a subtitle as final
     */
    @PostMapping("/{id}/finalize")
    public ResponseEntity<SubtitleDTO> finalizeSubtitle(
            @PathVariable Long id,
            Authentication authentication) {
        assertCanModifySubtitle(id, authentication);
        Subtitle subtitle = subtitleService.finalizeSubtitle(id);
        SubtitleDTO result = SubtitleDTO.fromEntity(subtitle);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Delete a subtitle by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubtitle(@PathVariable Long id, Authentication authentication) {
        assertCanModifySubtitle(id, authentication);
        subtitleService.deleteSubtitle(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Delete subtitles by session ID
     */
    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> deleteSubtitlesBySessionId(
            @PathVariable String sessionId,
            Authentication authentication) {
        assertCanModifySession(sessionId, authentication);
        subtitleService.deleteSubtitlesBySessionId(sessionId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Delete subtitles by event ID
     */
    @DeleteMapping("/event/{eventId}")
    public ResponseEntity<Void> deleteSubtitlesByEventId(
            @PathVariable Long eventId,
            Authentication authentication) {
        assertCanModifyEvent(eventId, authentication);
        subtitleService.deleteSubtitlesByEventId(eventId);
        return ResponseEntity.noContent().build();
    }
    
    // ==================== Session Management ====================
    
    /**
     * Start a new subtitle session
     */
    @PostMapping("/session/start")
    public ResponseEntity<SubtitleSession> startSession(
            @RequestParam Long eventId,
            @RequestParam(required = false) Long userId) {
        String sessionId = UUID.randomUUID().toString();
        SubtitleSession session = subtitleService.startSession(sessionId, eventId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }
    
    /**
     * Start a new subtitle session with custom session ID
     */
    @PostMapping("/session/{sessionId}/start")
    public ResponseEntity<SubtitleSession> startSessionWithId(
            @PathVariable String sessionId,
            @RequestParam Long eventId,
            @RequestParam(required = false) Long userId) {
        SubtitleSession session = subtitleService.startSession(sessionId, eventId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }
    
    /**
     * End a subtitle session
     */
    @PostMapping("/session/{sessionId}/end")
    public ResponseEntity<SubtitleSession> endSession(@PathVariable String sessionId) {
        SubtitleSession session = subtitleService.endSession(sessionId);
        if (session != null) {
            return ResponseEntity.ok(session);
        }
        return ResponseEntity.notFound().build();
    }
    
    /**
     * Get session by ID
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<SubtitleSession> getSession(@PathVariable String sessionId) {
        Optional<SubtitleSession> session = subtitleService.getSession(sessionId);
        return session
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * Get active sessions for an event
     */
    @GetMapping("/event/{eventId}/sessions")
    public ResponseEntity<List<SubtitleSession>> getActiveSessionsByEventId(@PathVariable Long eventId) {
        List<SubtitleSession> sessions = subtitleService.getActiveSessionsByEventId(eventId);
        return ResponseEntity.ok(sessions);
    }
    
    // ==================== Statistics and Analytics ====================
    
    /**
     * Get subtitle count for an event
     */
    @GetMapping("/event/{eventId}/count")
    public ResponseEntity<Long> getSubtitleCount(@PathVariable Long eventId) {
        long count = subtitleService.getSubtitleCountByEventId(eventId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get subtitle statistics for an event
     */
    @GetMapping("/event/{eventId}/statistics")
    public ResponseEntity<SubtitleStatistics> getEventStatistics(@PathVariable Long eventId) {
        SubtitleStatistics stats = subtitleService.getEventStatistics(eventId);
        return ResponseEntity.ok(stats);
    }
    
    // ==================== SSE Streaming Endpoint ====================
    
    /**
     * This would be implemented using Spring's SseEmitter or WebSocket
     * For now, this is a placeholder showing the intent
     */
    /*
    @GetMapping("/stream/{eventId}")
    public SseEmitter streamSubtitles(@PathVariable Long eventId) {
        SseEmitter emitter = new SseEmitter(0L);
        
        // Register emitter with service
        subtitleService.registerEmitter(eventId, emitter);
        
        // Send initial data
        List<Subtitle> subtitles = subtitleService.getActiveSubtitlesByEventId(eventId);
        subtitles.forEach(subtitle -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("subtitle")
                        .data(SubtitleDTO.fromEntity(subtitle)));
            } catch (IOException e) {
                emitter.complete();
            }
        });
        
        // Handle completion
        emitter.onCompletion(() -> subtitleService.unregisterEmitter(eventId, emitter));
        emitter.onTimeout(() -> subtitleService.unregisterEmitter(eventId, emitter));
        
        return emitter;
    }
    */
    
    // ==================== Health and Maintenance ====================
    
    /**
     * Delete expired subtitles
     */
    @PostMapping("/cleanup/expired")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteExpiredSubtitles() {
        int deletedCount = subtitleService.deleteExpiredSubtitles();
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("deletedCount", deletedCount);
        response.put("timestamp", new Date());
        
        return ResponseEntity.ok(response);
    }
    
    // ==================== Authorization helpers ====================

    /**
     * FIX (#15368): Moderation/deletion of a subtitle requires the subtitle
     * owner, an event organizer for the subtitle's event, or a platform admin.
     */
    private void assertCanModifySubtitle(Long subtitleId, Authentication authentication) {
        Subtitle subtitle = subtitleService.getSubtitleById(subtitleId)
                .orElseThrow(() -> new ResourceNotFoundException("Subtitle not found with id: " + subtitleId));
        User caller = currentUser(authentication);
        if (isAdmin(caller)) {
            return;
        }
        if (subtitle.getUserId() != null && subtitle.getUserId().equals(caller.getId())) {
            return;
        }
        if (subtitle.getEventId() != null
                && eventRoleService.hasRole(subtitle.getEventId(), caller.getEmail(), EventRole.ORGANIZER)) {
            return;
        }
        throw new AccessDeniedException(
                "Only the subtitle owner, an event organizer, or an admin can modify this subtitle.");
    }

    /**
     * FIX (#15368): Deleting a whole session requires organizer/admin access to
     * the session's event. Resolves the event through the session's subtitles.
     */
    private void assertCanModifySession(String sessionId, Authentication authentication) {
        List<Subtitle> subtitles = subtitleService.getSubtitlesBySessionId(sessionId);
        if (subtitles.isEmpty()) {
            return;
        }
        Long eventId = subtitles.get(0).getEventId();
        if (eventId != null) {
            assertCanModifyEvent(eventId, authentication);
        }
    }

    /**
     * FIX (#15368): Event-scoped subtitle operations require an event organizer
     * or a platform admin.
     */
    private void assertCanModifyEvent(Long eventId, Authentication authentication) {
        User caller = currentUser(authentication);
        if (isAdmin(caller)) {
            return;
        }
        if (eventRoleService.hasRole(eventId, caller.getEmail(), EventRole.ORGANIZER)) {
            return;
        }
        throw new AccessDeniedException(
                "Only an event organizer or an admin can manage subtitles for this event.");
    }

    /**
     * FIX (#16168): A user may only list their own subtitles; admins may list
     * any user's subtitles.
     */
    private void assertCanReadUser(Long userId, Authentication authentication) {
        User caller = currentUser(authentication);
        if (isAdmin(caller) || caller.getId().equals(userId)) {
            return;
        }
        throw new AccessDeniedException("You can only view your own subtitles.");
    }

    /**
     * Resolve the event a subtitle belongs to, either from the eventId directly
     * or through the subtitle session.
     */
    private Long resolveEventId(Long eventId, String sessionId) {
        if (eventId != null) {
            return eventId;
        }
        if (sessionId != null && !sessionId.isBlank()) {
            return subtitleService.getSession(sessionId)
                    .map(SubtitleSession::getEventId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Subtitle session not found: " + sessionId));
        }
        throw new IllegalArgumentException("eventId or sessionId is required to create a subtitle.");
    }

    private User currentUser(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        if (email == null || email.isBlank()) {
            throw new AccessDeniedException("Authentication is required.");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN;
    }
    
    // ==================== Exception Handlers ====================
    
    /**
     * Handle invalid request exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid request");
        error.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
    
    /**
     * Handle not found exceptions
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFound(ResourceNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Not found");
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
