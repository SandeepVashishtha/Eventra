package com.eventra.dto;

import java.util.List;

public class BulkParticipantStatusRequestDTO {

    public enum BulkAction {
        APPROVE,
        REJECT,
        MARK_ATTENDED,
        ADD_TO_GROUP,
        REMOVE_FROM_GROUP,
        SEND_NOTIFICATION
    }

    private Long eventId;
    private List<Long> participantIds;
    private BulkAction action;
    private String targetGroup;
    private String notificationMessage;

    public BulkParticipantStatusRequestDTO() {}

    public BulkParticipantStatusRequestDTO(Long eventId, List<Long> participantIds, BulkAction action, String targetGroup, String notificationMessage) {
        this.eventId = eventId;
        this.participantIds = participantIds;
        this.action = action;
        this.targetGroup = targetGroup;
        this.notificationMessage = notificationMessage;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public List<Long> getParticipantIds() { return participantIds; }
    public void setParticipantIds(List<Long> participantIds) { this.participantIds = participantIds; }

    public BulkAction getAction() { return action; }
    public void setAction(BulkAction action) { this.action = action; }

    public String getTargetGroup() { return targetGroup; }
    public void setTargetGroup(String targetGroup) { this.targetGroup = targetGroup; }

    public String getNotificationMessage() { return notificationMessage; }
    public void setNotificationMessage(String notificationMessage) { this.notificationMessage = notificationMessage; }
}
