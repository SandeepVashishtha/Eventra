package com.eventra.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    @GetMapping
    public ResponseEntity<List<EventInfo>> getAllEvents() {
        // For now, return sample data since we don't have Event entity yet
        List<EventInfo> events = List.of(
            new EventInfo(1L, "Public Event 1", "2025-09-01", "This is a sample public event"),
            new EventInfo(2L, "Public Event 2", "2025-09-05", "Another sample public event"),
            new EventInfo(3L, "Public Event 3", "2025-09-10", "A third sample public event")
        );
        return ResponseEntity.ok(events);
    }

    // Inner class for event info
    public static class EventInfo {
        public Long id;
        public String title;
        public String date;
        public String description;

        public EventInfo(Long id, String title, String date, String description) {
            this.id = id;
            this.title = title;
            this.date = date;
            this.description = description;
        }
    }
}
