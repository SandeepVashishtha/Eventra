package com.eventra.dto;

import java.time.LocalDateTime;

public class WaitlistNotificationDTO {

    public enum WaitlistStatusUpdate {
        POSITION_IMPROVED,
        SEAT_AVAILABLE,
        PROMOTED,
        CONFIRMATION_DEADLINE_APPROACHING
    }

    private Long participantId;
    private String participantName;
    private Long eventId;
    private String eventTitle;
    private int previousPosition;
    private int currentPosition;
    private WaitlistStatusUpdate updateType;
    private LocalDateTime confirmationDeadline;

    public WaitlistNotificationDTO() {}

    public WaitlistNotificationDTO(Long participantId, String participantName, Long eventId, String eventTitle, int previousPosition, int currentPosition, WaitlistStatusUpdate updateType, LocalDateTime confirmationDeadline) {
        this.participantId = participantId;
        this.participantName = participantName;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.previousPosition = previousPosition;
        this.currentPosition = currentPosition;
        this.updateType = updateType;
        this.confirmationDeadline = confirmationDeadline;
    }

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public int getPreviousPosition() { return previousPosition; }
    public void setPreviousPosition(int previousPosition) { this.previousPosition = previousPosition; }

    public int getCurrentPosition() { return currentPosition; }
    public void setCurrentPosition(int currentPosition) { this.currentPosition = currentPosition; }

    public WaitlistStatusUpdate getUpdateType() { return updateType; }
    public void setUpdateType(WaitlistStatusUpdate updateType) { this.updateType = updateType; }

    public LocalDateTime getConfirmationDeadline() { return confirmationDeadline; }
    public void setConfirmationDeadline(LocalDateTime confirmationDeadline) { this.confirmationDeadline = confirmationDeadline; }
}
