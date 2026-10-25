package com.eventra.dto;

import java.time.LocalDateTime;

public class EventRegistrationStatusDTO {

    private Long eventId;
    private boolean registrationPaused;
    private String pauseReason;
    private LocalDateTime resumeDate;
    private String buttonMessage;

    public EventRegistrationStatusDTO() {}

    public EventRegistrationStatusDTO(Long eventId, boolean registrationPaused, String pauseReason, LocalDateTime resumeDate) {
        this.eventId = eventId;
        this.registrationPaused = registrationPaused;
        this.pauseReason = pauseReason;
        this.resumeDate = resumeDate;
        this.buttonMessage = registrationPaused ? "Registration Temporarily Paused" : "Register Now";
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public boolean isRegistrationPaused() { return registrationPaused; }
    public void setRegistrationPaused(boolean registrationPaused) { this.registrationPaused = registrationPaused; }
    public String getPauseReason() { return pauseReason; }
    public void setPauseReason(String pauseReason) { this.pauseReason = pauseReason; }
    public LocalDateTime getResumeDate() { return resumeDate; }
    public void setResumeDate(LocalDateTime resumeDate) { this.resumeDate = resumeDate; }
    public String getButtonMessage() { return buttonMessage; }
    public void setButtonMessage(String buttonMessage) { this.buttonMessage = buttonMessage; }
}
