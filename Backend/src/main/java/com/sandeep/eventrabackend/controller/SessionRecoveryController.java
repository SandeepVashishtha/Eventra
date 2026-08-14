package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.SessionRecoveryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/session-recovery")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Session Recovery")
public class SessionRecoveryController {

    private final SessionRecoveryService sessionRecoveryService;

    public SessionRecoveryController(SessionRecoveryService sessionRecoveryService) {
        this.sessionRecoveryService = sessionRecoveryService;
    }

    @PostMapping
    public ResponseEntity<?> save(
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (body == null || body.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "Session recovery payload cannot be null or empty."
            ));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionRecoveryService.save(authentication.getName(), body));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(Authentication authentication) {
        return ResponseEntity.ok(sessionRecoveryService.list(authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @RequestBody Map<String, Object> body, Authentication authentication) {
        body.put("sessionId", id);
        return ResponseEntity.ok(sessionRecoveryService.save(authentication.getName(), body));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restore(@PathVariable String id, Authentication authentication) {
        return ResponseEntity.ok(sessionRecoveryService.restore(authentication.getName(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication authentication) {
        sessionRecoveryService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanup(Authentication authentication) {
        return ResponseEntity.ok(sessionRecoveryService.cleanup(authentication.getName()));
    }
}
