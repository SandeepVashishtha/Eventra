package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_role_audit_logs")
public class EventRoleAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "target_user_id", nullable = false)
    private Long targetUserId;

    @Column(name = "actor_user_id")
    private Long actorUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_role", length = 20)
    private EventRole previousRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_role", nullable = false, length = 20)
    private EventRole newRole;

    @Column(nullable = false, length = 20)
    private String action;

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public Long getActorUserId() { return actorUserId; }
    public void setActorUserId(Long actorUserId) { this.actorUserId = actorUserId; }

    public EventRole getPreviousRole() { return previousRole; }
    public void setPreviousRole(EventRole previousRole) { this.previousRole = previousRole; }

    public EventRole getNewRole() { return newRole; }
    public void setNewRole(EventRole newRole) { this.newRole = newRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
