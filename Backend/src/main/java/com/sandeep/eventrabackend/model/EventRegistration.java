package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "event_registrations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_event_registration_event_user",
                        columnNames = {"event_id", "user_id"}
                ),
                @UniqueConstraint(
                        name = "uk_event_registration_event_seat",
                        columnNames = {"event_id", "seat_id"}
                )
        }
)
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    @Column(nullable = false, length = 30)
    private String status = "CONFIRMED";

    /**
     * Selected seat identifier (format {@code elementId:seatIndex}) when the
     * event offers seat selection. Null when no seat was chosen.
     */
    @Column(name = "seat_id", length = 100)
    private String seatId;

    @Column(name = "show_profile_in_attendee_directory", nullable = false)
    private boolean showProfileInAttendeeDirectory = false;

    /**
     * Group ID for group/bulk registrations (e.g., "Table of 10" tickets).
     * All registrations with the same groupId belong to the same group.
     */
    @Column(name = "group_id", length = 100)
    private String groupId;

    /**
     * Flag indicating if this registration is the primary buyer for a group.
     * Used to identify the main contact person for group tickets.
     */
    @Column(name = "is_group_primary", nullable = false)
    private boolean isGroupPrimary = false;

    /**
     * Name of the group (e.g., "Acme Corp - Table 5").
     * Used for display purposes when managing group check-ins.
     */
    @Column(name = "group_name", length = 200)
    private String groupName;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSeatId() {
        return seatId;
    }

    public void setSeatId(String seatId) {
        this.seatId = seatId;
    }

    public boolean isShowProfileInAttendeeDirectory() {
        return showProfileInAttendeeDirectory;
    }

    public void setShowProfileInAttendeeDirectory(boolean showProfileInAttendeeDirectory) {
        this.showProfileInAttendeeDirectory = showProfileInAttendeeDirectory;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public boolean isGroupPrimary() {
        return isGroupPrimary;
    }

    public void setGroupPrimary(boolean groupPrimary) {
        isGroupPrimary = groupPrimary;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }
}
