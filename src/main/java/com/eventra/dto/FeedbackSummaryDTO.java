package com.eventra.dto;

public class FeedbackSummaryDTO {

    private Long eventId;
    private Double averageRating;
    private long totalFeedbacks;
    private long positiveCount;
    private long neutralCount;
    private long negativeCount;

    public FeedbackSummaryDTO() {}

    public FeedbackSummaryDTO(Long eventId, Double averageRating, long totalFeedbacks, long positiveCount, long neutralCount, long negativeCount) {
        this.eventId = eventId;
        this.averageRating = averageRating;
        this.totalFeedbacks = totalFeedbacks;
        this.positiveCount = positiveCount;
        this.neutralCount = neutralCount;
        this.negativeCount = negativeCount;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public long getTotalFeedbacks() { return totalFeedbacks; }
    public void setTotalFeedbacks(long totalFeedbacks) { this.totalFeedbacks = totalFeedbacks; }
    public long getPositiveCount() { return positiveCount; }
    public void setPositiveCount(long positiveCount) { this.positiveCount = positiveCount; }
    public long getNeutralCount() { return neutralCount; }
    public void setNeutralCount(long neutralCount) { this.neutralCount = neutralCount; }
    public long getNegativeCount() { return negativeCount; }
    public void setNegativeCount(long negativeCount) { this.negativeCount = negativeCount; }
}
