package com.sandeep.eventrabackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.model.RecoverySession;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.RecoverySessionRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionRecoveryService {

    private final RecoverySessionRepository recoverySessionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Map<String, Object> save(String userEmail, Map<String, Object> payload) {
        User user = requireUser(userEmail);
        String sessionId = stringOr(payload.get("sessionId"), UUID.randomUUID().toString());
        RecoverySession session = recoverySessionRepository.findByIdAndUser_Id(sessionId, user.getId())
                .orElseGet(RecoverySession::new);
        session.setId(sessionId);
        session.setUser(user);
        session.setName(stringOr(payload.get("name"), "Recovery Session"));
        session.setType(stringOr(payload.get("type"), "generic"));
        session.setDraftData(writeJson(payload.getOrDefault("draftData", payload)));
        session.setExpiresAt(LocalDateTime.now().plusDays(14));
        return toResponse(recoverySessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list(String userEmail) {
        User user = requireUser(userEmail);
        List<Map<String, Object>> sessions = recoverySessionRepository
                .findByUser_IdAndExpiresAtAfterOrderByUpdatedAtDesc(user.getId(), LocalDateTime.now())
                .stream()
                .map(this::toResponse)
                .toList();
        return Map.of("sessions", sessions);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> restore(String userEmail, String sessionId) {
        User user = requireUser(userEmail);
        RecoverySession session = recoverySessionRepository.findByIdAndUser_Id(sessionId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Recovery session not found"));
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Recovery session expired");
        }
        return Map.of("session", toResponse(session));
    }

    @Transactional
    public void delete(String userEmail, String sessionId) {
        User user = requireUser(userEmail);
        recoverySessionRepository.deleteByIdAndUser_Id(sessionId, user.getId());
    }

    @Transactional
    public Map<String, Object> cleanup(String userEmail) {
        User user = requireUser(userEmail);
        long deleted = recoverySessionRepository.deleteByUser_IdAndExpiresAtBefore(user.getId(), LocalDateTime.now());
        return Map.of("deleted", deleted);
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private Map<String, Object> toResponse(RecoverySession session) {
        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("userId", session.getUser().getId());
        response.put("name", session.getName());
        response.put("type", session.getType());
        response.put("draftData", readJson(session.getDraftData()));
        response.put("lastUpdated", session.getUpdatedAt());
        response.put("expiresAt", session.getExpiresAt());
        return response;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid draft data");
        }
    }

    private Object readJson(String value) {
        try {
            return objectMapper.readValue(value, Object.class);
        } catch (Exception e) {
            return Map.of();
        }
    }

    private static String stringOr(Object value, String fallback) {
        return value == null ? fallback : String.valueOf(value);
    }
}
