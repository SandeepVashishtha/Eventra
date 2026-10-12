package com.eventra.dto;

import java.time.LocalDateTime;

public class DeadlineExtensionRequestDTO {

    private Long eventId;
    private LocalDateTime previousDeadline;
    private LocalDateTime newDeadline;
    private String extensionReason;
    private boolean notifyUsers;

    public DeadlineExtensionRequestDTO() {}

    public DeadlineExtensionRequestDTO(Long eventId, LocalDateTime previousDeadline, LocalDateTime newDeadline, String extensionReason, boolean notifyUsers) {
        this.eventId = eventId;
        this.previousDeadline = previousDeadline;
        this.newDeadline = newDeadline;
        this.extensionReason = extensionReason;
        this.notifyUsers = notifyUsers;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public LocalDateTime getPreviousDeadline() { return previousDeadline; }
    public void setPreviousDeadline(LocalDateTime previousDeadline) { this.previousDeadline = previousDeadline; }

    public LocalDateTime getNewDeadline() { return newDeadline; }
    public void setNewDeadline(LocalDateTime newDeadline) { this.newDeadline = newDeadline; }

    public String getExtensionReason() { return extensionReason; }
    public void setExtensionReason(String extensionReason) { this.extensionReason = extensionReason; }

    public boolean isNotifyUsers() { return notifyUsers; }
    public void setNotifyUsers(boolean notifyUsers) { this.notifyUsers = notifyUsers; }
}
