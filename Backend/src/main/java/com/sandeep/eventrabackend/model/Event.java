package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private boolean isPublic = true;

    /**
     * Optional URL pointing to the event's banner/thumbnail image.
     * Only external links are supported (no file uploads).
     */
    @Column(length = 2048)
    private String imageUrl;

    /**
     * Maximum number of attendees allowed. Null means unlimited.
     */
    private Integer capacity;

    /**
     * Current number of confirmed registrations — kept in sync with attendees.size().
     */
    private int registeredCount = 0;

    /**
     * Optimistic-lock version field.
     * Acts as a safety net alongside the pessimistic write-lock used in the
     * registration flow: if two transactions somehow both pass the capacity
     * check and attempt to commit, the second one will be rejected by JPA with
     * an ObjectOptimisticLockingFailureException, which the GlobalExceptionHandler
     * converts to HTTP 409.
     */
    @Version
    private Long version;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "event_attendees",
        joinColumns = @JoinColumn(name = "event_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id"),
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"})
    )
    private Set<User> attendees = new HashSet<>();

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Returns true if the event date is in the past.
     * Used by the availability response so the frontend can display
     * a "This event has already passed" notice.
     */
    public boolean isEventPast() {
        return eventDate != null && eventDate.isBefore(LocalDateTime.now());
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public int getRegisteredCount() { return registeredCount; }
    public void setRegisteredCount(int registeredCount) { this.registeredCount = registeredCount; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public Set<User> getAttendees() { return attendees; }
    public void setAttendees(Set<User> attendees) { this.attendees = attendees; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
