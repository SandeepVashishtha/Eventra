package com.sandeep.eventrabackend.dto.request;

import jakarta.validation.constraints.Size;
import java.util.List;

public class UpdateLostItemRequest {

    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String imageUrl;

    @Size(max = 500, message = "Thumbnail URL cannot exceed 500 characters")
    private String thumbnailUrl;

    private List<@Size(max = 50, message = "Tag cannot exceed 50 characters") String> tags;

    @Size(max = 1000, message = "AI generated tags cannot exceed 1000 characters")
    private String aiGeneratedTags;

    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String locationFound;

    @Size(max = 200, message = "Email cannot exceed 200 characters")
    private String contactEmail;

    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String contactPhone;

    private String status;

    // Getters and Setters

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
}