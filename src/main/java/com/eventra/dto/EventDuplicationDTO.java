package com.eventra.dto;

import java.time.LocalDateTime;

public class EventDuplicationDTO {

    private Long sourceEventId;
    private String newEventTitle;
    private LocalDateTime newStartDate;
    private LocalDateTime newEndDate;
    private String newVenue;
    private int newCapacity;
    private boolean copyDescription = true;
    private boolean copyCategory = true;
    private boolean copyRules = true;
    private boolean copyFaq = true;
    private boolean copyRegistrationSettings = true;
    private boolean copyCustomFields = true;
    private boolean copyResources = true;

    public EventDuplicationDTO() {}

    public EventDuplicationDTO(Long sourceEventId, String newEventTitle, LocalDateTime newStartDate, LocalDateTime newEndDate, String newVenue, int newCapacity) {
        this.sourceEventId = sourceEventId;
        this.newEventTitle = newEventTitle;
        this.newStartDate = newStartDate;
        this.newEndDate = newEndDate;
        this.newVenue = newVenue;
        this.newCapacity = newCapacity;
    }

    public Long getSourceEventId() { return sourceEventId; }
    public void setSourceEventId(Long sourceEventId) { this.sourceEventId = sourceEventId; }

    public String getNewEventTitle() { return newEventTitle; }
    public void setNewEventTitle(String newEventTitle) { this.newEventTitle = newEventTitle; }

    public LocalDateTime getNewStartDate() { return newStartDate; }
    public void setNewStartDate(LocalDateTime newStartDate) { this.newStartDate = newStartDate; }

    public LocalDateTime getNewEndDate() { return newEndDate; }
    public void setNewEndDate(LocalDateTime newEndDate) { this.newEndDate = newEndDate; }

    public String getNewVenue() { return newVenue; }
    public void setNewVenue(String newVenue) { this.newVenue = newVenue; }

    public int getNewCapacity() { return newCapacity; }
    public void setNewCapacity(int newCapacity) { this.newCapacity = newCapacity; }

    public boolean isCopyDescription() { return copyDescription; }
    public void setCopyDescription(boolean copyDescription) { this.copyDescription = copyDescription; }

    public boolean isCopyCategory() { return copyCategory; }
    public void setCopyCategory(boolean copyCategory) { this.copyCategory = copyCategory; }

    public boolean isCopyRules() { return copyRules; }
    public void setCopyRules(boolean copyRules) { this.copyRules = copyRules; }

    public boolean isCopyFaq() { return copyFaq; }
    public void setCopyFaq(boolean copyFaq) { this.copyFaq = copyFaq; }

    public boolean isCopyRegistrationSettings() { return copyRegistrationSettings; }
    public void setCopyRegistrationSettings(boolean copyRegistrationSettings) { this.copyRegistrationSettings = copyRegistrationSettings; }

    public boolean isCopyCustomFields() { return copyCustomFields; }
    public void setCopyCustomFields(boolean copyCustomFields) { this.copyCustomFields = copyCustomFields; }

    public boolean isCopyResources() { return copyResources; }
    public void setCopyResources(boolean copyResources) { this.copyResources = copyResources; }
}
