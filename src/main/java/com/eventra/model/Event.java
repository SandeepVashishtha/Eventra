package com.eventra.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "registration_paused", nullable = false)
    private boolean registrationPaused = false;

    @Column(name = "pause_reason")
    private String pauseReason;

    @Column(name = "resume_date")
    private LocalDateTime resumeDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Event() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isRegistrationPaused() { return registrationPaused; }
    public void setRegistrationPaused(boolean registrationPaused) { this.registrationPaused = registrationPaused; }
    public String getPauseReason() { return pauseReason; }
    public void setPauseReason(String pauseReason) { this.pauseReason = pauseReason; }
    public LocalDateTime getResumeDate() { return resumeDate; }
    public void setResumeDate(LocalDateTime resumeDate) { this.resumeDate = resumeDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
