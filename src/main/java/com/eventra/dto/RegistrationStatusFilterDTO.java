package com.eventra.dto;

public class RegistrationStatusFilterDTO {

    public enum RegistrationStatus {
        ALL,
        UPCOMING,
        PENDING,
        CONFIRMED,
        ATTENDED,
        COMPLETED,
        CANCELLED
    }

    private Long participantId;
    private RegistrationStatus statusFilter;

    public RegistrationStatusFilterDTO() {}

    public RegistrationStatusFilterDTO(Long participantId, RegistrationStatus statusFilter) {
        this.participantId = participantId;
        this.statusFilter = statusFilter;
    }

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public RegistrationStatus getStatusFilter() { return statusFilter; }
    public void setStatusFilter(RegistrationStatus statusFilter) { this.statusFilter = statusFilter; }
}
