package com.sandeep.eventrabackend.dto.response;

import java.time.LocalDateTime;

public class EventRoleAuditResponse {
    private Long id;
    private Long eventId;
    private Long targetUserId;
    private Long actorUserId;
    private String previousRole;
    private String newRole;
    private String action;
    private LocalDateTime changedAt;

    public EventRoleAuditResponse(
            Long id,
            Long eventId,
            Long targetUserId,
            Long actorUserId,
            String previousRole,
            String newRole,
            String action,
            LocalDateTime changedAt) {
        this.id = id;
        this.eventId = eventId;
        this.targetUserId = targetUserId;
        this.actorUserId = actorUserId;
        this.previousRole = previousRole;
        this.newRole = newRole;
        this.action = action;
        this.changedAt = changedAt;
    }

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public Long getTargetUserId() { return targetUserId; }
    public Long getActorUserId() { return actorUserId; }
    public String getPreviousRole() { return previousRole; }
    public String getNewRole() { return newRole; }
    public String getAction() { return action; }
    public LocalDateTime getChangedAt() { return changedAt; }
}
