package com.sandeep.eventrabackend.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class LostItemResponse {

    private Long id;
    private Long eventId;
    private String eventTitle;
    private Long foundById;
    private String foundByName;
    private String foundByEmail;
    private String title;
    private String description;
    private String imageUrl;
    private String thumbnailUrl;
    private List<String> tags;
    private String aiGeneratedTags;
    private String category;
    private String locationFound;
    private String contactEmail;
    private String contactPhone;
    private String status;
    private boolean isClaimed;
    private Long claimedById;
    private String claimedByName;
    private LocalDateTime claimedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public Long getFoundById() { return foundById; }
    public void setFoundById(Long foundById) { this.foundById = foundById; }

    public String getFoundByName() { return foundByName; }
    public void setFoundByName(String foundByName) { this.foundByName = foundByName; }

    public String getFoundByEmail() { return foundByEmail; }
    public void setFoundByEmail(String foundByEmail) { this.foundByEmail = foundByEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getAiGeneratedTags() { return aiGeneratedTags; }
    public void setAiGeneratedTags(String aiGeneratedTags) { this.aiGeneratedTags = aiGeneratedTags; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocationFound() { return locationFound; }
    public void setLocationFound(String locationFound) { this.locationFound = locationFound; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isClaimed() { return isClaimed; }
    public void setClaimed(boolean claimed) { isClaimed = claimed; }

    public Long getClaimedById() { return claimedById; }
    public void setClaimedById(Long claimedById) { this.claimedById = claimedById; }

    public String getClaimedByName() { return claimedByName; }
    public void setClaimedByName(String claimedByName) { this.claimedByName = claimedByName; }

    public LocalDateTime getClaimedAt() { return claimedAt; }
    public void setClaimedAt(LocalDateTime claimedAt) { this.claimedAt = claimedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}