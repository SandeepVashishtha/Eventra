package com.eventra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @GetMapping("/profile")
    public ResponseEntity<Map<String, String>> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Map<String, String> response = new HashMap<>();
        response.put("email", email);
        response.put("message", "User profile retrieved successfully");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/events")
    public ResponseEntity<java.util.List<UserEventInfo>> getUserEvents() {
        // For now, return sample data since we don't have Event entity yet
        java.util.List<UserEventInfo> events = java.util.List.of(
            new UserEventInfo(1L, "My Event 1", "2025-08-10", "A sample event I'm attending"),
            new UserEventInfo(2L, "My Event 2", "2025-08-12", "Another event I'm registered for")
        );
        return ResponseEntity.ok(events);
    }

    // Inner class for user event info
    public static class UserEventInfo {
        public Long id;
        public String title;
        public String date;
        public String description;

        public UserEventInfo(Long id, String title, String date, String description) {
            this.id = id;
            this.title = title;
            this.date = date;
            this.description = description;
        }
    }
}
