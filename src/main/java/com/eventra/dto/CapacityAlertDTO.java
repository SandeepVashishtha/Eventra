package com.eventra.dto;

public class CapacityAlertDTO {

    public enum CapacityThreshold {
        FIFTY_PERCENT(50),
        SEVENTY_FIVE_PERCENT(75),
        NINETY_PERCENT(90),
        ONE_HUNDRED_PERCENT(100);

        private final int percentage;
        CapacityThreshold(int percentage) { this.percentage = percentage; }
        public int getPercentage() { return percentage; }
    }

    private Long eventId;
    private String eventTitle;
    private int maxCapacity;
    private int currentRegistrations;
    private CapacityThreshold triggeredThreshold;
    private boolean alertActive;

    public CapacityAlertDTO() {}

    public CapacityAlertDTO(Long eventId, String eventTitle, int maxCapacity, int currentRegistrations, CapacityThreshold triggeredThreshold) {
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.maxCapacity = maxCapacity;
        this.currentRegistrations = currentRegistrations;
        this.triggeredThreshold = triggeredThreshold;
        double ratio = maxCapacity > 0 ? ((double) currentRegistrations / maxCapacity) * 100.0 : 0.0;
        this.alertActive = ratio >= triggeredThreshold.getPercentage();
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public int getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }

    public int getCurrentRegistrations() { return currentRegistrations; }
    public void setCurrentRegistrations(int currentRegistrations) { this.currentRegistrations = currentRegistrations; }

    public CapacityThreshold getTriggeredThreshold() { return triggeredThreshold; }
    public void setTriggeredThreshold(CapacityThreshold triggeredThreshold) { this.triggeredThreshold = triggeredThreshold; }

    public boolean isAlertActive() { return alertActive; }
    public void setAlertActive(boolean alertActive) { this.alertActive = alertActive; }
}
