package com.eventra.dto;

public class CancellationReasonDTO {

    public enum CancellationReason {
        SCHEDULE_CONFLICT,
        PERSONAL_REASONS,
        EVENT_LOCATION,
        EVENT_TIMING,
        FOUND_ANOTHER_EVENT,
        OTHER
    }

    private Long registrationId;
    private Long participantId;
    private CancellationReason reason;
    private String optionalExplanation;

    public CancellationReasonDTO() {}

    public CancellationReasonDTO(Long registrationId, Long participantId, CancellationReason reason, String optionalExplanation) {
        this.registrationId = registrationId;
        this.participantId = participantId;
        this.reason = reason;
        this.optionalExplanation = optionalExplanation;
    }

    public Long getRegistrationId() { return registrationId; }
    public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public CancellationReason getReason() { return reason; }
    public void setReason(CancellationReason reason) { this.reason = reason; }

    public String getOptionalExplanation() { return optionalExplanation; }
    public void setOptionalExplanation(String optionalExplanation) { this.optionalExplanation = optionalExplanation; }
}
