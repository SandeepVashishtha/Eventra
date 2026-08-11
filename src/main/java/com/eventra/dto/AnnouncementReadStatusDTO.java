package com.eventra.dto;

public class AnnouncementReadStatusDTO {

    private Long announcementId;
    private String announcementTitle;
    private int totalRecipients;
    private int viewedCount;
    private int unviewedCount;
    private double viewPercentage;

    public AnnouncementReadStatusDTO() {}

    public AnnouncementReadStatusDTO(Long announcementId, String announcementTitle, int totalRecipients, int viewedCount) {
        this.announcementId = announcementId;
        this.announcementTitle = announcementTitle;
        this.totalRecipients = totalRecipients;
        this.viewedCount = viewedCount;
        this.unviewedCount = Math.max(0, totalRecipients - viewedCount);
        this.viewPercentage = totalRecipients > 0 ? ((double) viewedCount / totalRecipients) * 100.0 : 0.0;
    }

    public Long getAnnouncementId() { return announcementId; }
    public void setAnnouncementId(Long announcementId) { this.announcementId = announcementId; }

    public String getAnnouncementTitle() { return announcementTitle; }
    public void setAnnouncementTitle(String announcementTitle) { this.announcementTitle = announcementTitle; }

    public int getTotalRecipients() { return totalRecipients; }
    public void setTotalRecipients(int totalRecipients) {
        this.totalRecipients = totalRecipients;
        recalculate();
    }

    public int getViewedCount() { return viewedCount; }
    public void setViewedCount(int viewedCount) {
        this.viewedCount = viewedCount;
        recalculate();
    }

    public int getUnviewedCount() { return unviewedCount; }

    public double getViewPercentage() { return viewPercentage; }

    private void recalculate() {
        this.unviewedCount = Math.max(0, this.totalRecipients - this.viewedCount);
        this.viewPercentage = this.totalRecipients > 0 ? ((double) this.viewedCount / this.totalRecipients) * 100.0 : 0.0;
    }
}
