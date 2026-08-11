package com.eventra.dto;

import java.time.LocalDateTime;

public class EventDraftDTO {

    private Long draftId;
    private Long organizerId;
    private String eventTitle;
    private String eventDescription;
    private LocalDateTime lastSavedTimestamp;
    private boolean draftActive;

    public EventDraftDTO() {}

    public EventDraftDTO(Long draftId, Long organizerId, String eventTitle, String eventDescription, LocalDateTime lastSavedTimestamp, boolean draftActive) {
        this.draftId = draftId;
        this.organizerId = organizerId;
        this.eventTitle = eventTitle;
        this.eventDescription = eventDescription;
        this.lastSavedTimestamp = lastSavedTimestamp;
        this.draftActive = draftActive;
    }

    public Long getDraftId() { return draftId; }
    public void setDraftId(Long draftId) { this.draftId = draftId; }

    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getEventDescription() { return eventDescription; }
    public void setEventDescription(String eventDescription) { this.eventDescription = eventDescription; }

    public LocalDateTime getLastSavedTimestamp() { return lastSavedTimestamp; }
    public void setLastSavedTimestamp(LocalDateTime lastSavedTimestamp) { this.lastSavedTimestamp = lastSavedTimestamp; }

    public boolean isDraftActive() { return draftActive; }
    public void setDraftActive(boolean draftActive) { this.draftActive = draftActive; }
}
