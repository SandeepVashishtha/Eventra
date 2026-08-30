package com.eventra.dto;

import java.time.LocalDateTime;

public class RegistrationConfirmationResendDTO {

    private Long registrationId;
    private Long participantId;
    private String participantEmail;
    private String eventName;
    private LocalDateTime eventDateTime;
    private String venueOrMeetingLink;
    private String registrationStatus;

    public RegistrationConfirmationResendDTO() {}

    public RegistrationConfirmationResendDTO(Long registrationId, Long participantId, String participantEmail, String eventName, LocalDateTime eventDateTime, String venueOrMeetingLink, String registrationStatus) {
        this.registrationId = registrationId;
        this.participantId = participantId;
        this.participantEmail = participantEmail;
        this.eventName = eventName;
        this.eventDateTime = eventDateTime;
        this.venueOrMeetingLink = venueOrMeetingLink;
        this.registrationStatus = registrationStatus;
    }

    public Long getRegistrationId() { return registrationId; }
    public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public String getParticipantEmail() { return participantEmail; }
    public void setParticipantEmail(String participantEmail) { this.participantEmail = participantEmail; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public LocalDateTime getEventDateTime() { return eventDateTime; }
    public void setEventDateTime(LocalDateTime eventDateTime) { this.eventDateTime = eventDateTime; }

    public String getVenueOrMeetingLink() { return venueOrMeetingLink; }
    public void setVenueOrMeetingLink(String venueOrMeetingLink) { this.venueOrMeetingLink = venueOrMeetingLink; }

    public String getRegistrationStatus() { return registrationStatus; }
    public void setRegistrationStatus(String registrationStatus) { this.registrationStatus = registrationStatus; }
}
