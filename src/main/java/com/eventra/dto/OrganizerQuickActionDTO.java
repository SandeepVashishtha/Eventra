package com.eventra.dto;

public class OrganizerQuickActionDTO {

    public enum QuickActionType {
        CREATE_EVENT,
        EDIT_EVENT,
        VIEW_PARTICIPANTS,
        SEND_ANNOUNCEMENT,
        EXPORT_REGISTRATIONS,
        MANAGE_FEEDBACK,
        CLOSE_REGISTRATION
    }

    private Long eventId;
    private QuickActionType actionType;
    private String actionLabel;

    public OrganizerQuickActionDTO() {}

    public OrganizerQuickActionDTO(Long eventId, QuickActionType actionType, String actionLabel) {
        this.eventId = eventId;
        this.actionType = actionType;
        this.actionLabel = actionLabel;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public QuickActionType getActionType() { return actionType; }
    public void setActionType(QuickActionType actionType) { this.actionType = actionType; }

    public String getActionLabel() { return actionLabel; }
    public void setActionLabel(String actionLabel) { this.actionLabel = actionLabel; }
}
