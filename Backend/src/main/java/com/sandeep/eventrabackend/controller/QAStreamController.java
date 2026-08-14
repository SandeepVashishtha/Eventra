package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.SessionQuestion;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stream/qa")
public class QAStreamController {

    private final Map<String, SessionQuestion> questionsDatabase = new ConcurrentHashMap<>();

    @GetMapping("/{sessionId}")
    public ResponseEntity<List<SessionQuestion>> getSessionQuestions(@PathVariable String sessionId) {
        List<SessionQuestion> sorted = questionsDatabase.values().stream()
                .filter(q -> sessionId.equals(q.getSessionId()))
                .sorted((a, b) -> {
                    if (a.isPinned() != b.isPinned()) return a.isPinned() ? -1 : 1;
                    return Integer.compare(b.getUpvotes(), a.getUpvotes());
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(sorted);
    }

    @PostMapping("/submit")
    public ResponseEntity<SessionQuestion> submitQuestion(@RequestBody SessionQuestion payload,
            Authentication authentication) {
        if (authentication == null || !StringUtils.hasText(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (payload.getSessionId() == null || payload.getSessionId().isBlank()
                || payload.getQuestionText() == null || payload.getQuestionText().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        String id = "q-" + UUID.randomUUID().toString().substring(0, 8);
        SessionQuestion q = new SessionQuestion(id, payload.getSessionId(), authentication.getName(), payload.getQuestionText());
        questionsDatabase.put(id, q);
        return ResponseEntity.ok(q);
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<SessionQuestion> upvoteQuestion(@PathVariable String id, Authentication authentication) {
        SessionQuestion q = questionsDatabase.get(id);
        if (q == null) {
            return ResponseEntity.notFound().build();
        }
        if (authentication == null || !StringUtils.hasText(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!q.addVoter(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok(q);
    }

    @PostMapping("/{id}/pin")
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SessionQuestion> pinQuestion(@PathVariable String id) {
        SessionQuestion q = questionsDatabase.get(id);
        if (q != null) {
            q.setPinned(!q.isPinned());
            return ResponseEntity.ok(q);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/answer")
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SessionQuestion> markAnswered(@PathVariable String id) {
        SessionQuestion q = questionsDatabase.get(id);
        if (q != null) {
            q.setAnswered(true);
            return ResponseEntity.ok(q);
        }
        return ResponseEntity.notFound().build();
    }
}