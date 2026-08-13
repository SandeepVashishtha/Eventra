package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Request DTO for bulk CSV import of legacy waitlist data.
 * Used by organizers to import existing waitlists from legacy systems.
 */
public class CsvWaitlistImportRequest {

    @NotNull(message = "Event ID is required")
    @Schema(description = "The ID of the event to import waitlist data for", example = "123")
    private Long eventId;

    @NotNull(message = "CSV data is required")
    @Schema(description = "List of waitlist entries parsed from CSV", example = "[{'name': 'John Doe', 'email': 'john@example.com', 'timestamp': '2024-01-15T10:30:00Z'}]")
    private List<CsvWaitlistEntry> entries;

    // Inner DTO representing a single CSV row
    public static class CsvWaitlistEntry {
        @NotBlank(message = "Name is required")
        @Schema(description = "Full name of the waitlist entry", example = "John Doe")
        private String name;

        @NotBlank(message = "Email is required")
        @Schema(description = "Email address of the waitlist entry", example = "john@example.com")
        private String email;

        @NotBlank(message = "Timestamp is required")
        @Schema(description = "Legacy timestamp when the user joined the waitlist (ISO format)", example = "2024-01-15T10:30:00Z")
        private String timestamp;

        // Default constructor for JSON deserialization
        public CsvWaitlistEntry() {}

        public CsvWaitlistEntry(String name, String email, String timestamp) {
            this.name = name;
            this.email = email;
            this.timestamp = timestamp;
        }

        // Getters and setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }
    }

    // Default constructor for JSON deserialization
    public CsvWaitlistImportRequest() {}

    public CsvWaitlistImportRequest(Long eventId, List<CsvWaitlistEntry> entries) {
        this.eventId = eventId;
        this.entries = entries;
    }

    // Getters and setters
    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public List<CsvWaitlistEntry> getEntries() {
        return entries;
    }

    public void setEntries(List<CsvWaitlistEntry> entries) {
        this.entries = entries;
    }
}