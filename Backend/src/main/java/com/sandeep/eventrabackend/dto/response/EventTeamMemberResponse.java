package com.sandeep.eventrabackend.dto.response;

import java.time.LocalDateTime;

public class EventTeamMemberResponse {
    private Long userId;
    private String email;
    private String username;
    private String role;
    private LocalDateTime assignedAt;

    public EventTeamMemberResponse(Long userId, String email, String username, String role, LocalDateTime assignedAt) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.role = role;
        this.assignedAt = assignedAt;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
}
