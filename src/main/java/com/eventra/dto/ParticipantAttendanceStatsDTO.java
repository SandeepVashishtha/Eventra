package com.eventra.dto;

public class ParticipantAttendanceStatsDTO {

    private Long participantId;
    private String participantName;
    private int totalSessions;
    private int sessionsAttended;
    private double attendancePercentage;
    private boolean certificateEligible;
    private double minimumRequiredPercentage;

    public ParticipantAttendanceStatsDTO() {}

    public ParticipantAttendanceStatsDTO(Long participantId, String participantName, int totalSessions, int sessionsAttended, double minimumRequiredPercentage) {
        this.participantId = participantId;
        this.participantName = participantName;
        this.totalSessions = totalSessions;
        this.sessionsAttended = sessionsAttended;
        this.minimumRequiredPercentage = minimumRequiredPercentage;
        this.attendancePercentage = totalSessions > 0 ? ((double) sessionsAttended / totalSessions) * 100.0 : 0.0;
        this.certificateEligible = this.attendancePercentage >= minimumRequiredPercentage;
    }

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }

    public int getTotalSessions() { return totalSessions; }
    public void setTotalSessions(int totalSessions) {
        this.totalSessions = totalSessions;
        recalculate();
    }

    public int getSessionsAttended() { return sessionsAttended; }
    public void setSessionsAttended(int sessionsAttended) {
        this.sessionsAttended = sessionsAttended;
        recalculate();
    }

    public double getAttendancePercentage() { return attendancePercentage; }

    public boolean isCertificateEligible() { return certificateEligible; }

    public double getMinimumRequiredPercentage() { return minimumRequiredPercentage; }
    public void setMinimumRequiredPercentage(double minimumRequiredPercentage) {
        this.minimumRequiredPercentage = minimumRequiredPercentage;
        recalculate();
    }

    private void recalculate() {
        this.attendancePercentage = this.totalSessions > 0 ? ((double) this.sessionsAttended / this.totalSessions) * 100.0 : 0.0;
        this.certificateEligible = this.attendancePercentage >= this.minimumRequiredPercentage;
    }
}
