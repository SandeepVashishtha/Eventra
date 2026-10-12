package com.eventra.dto;

import java.time.LocalDate;

public class RegistrationHistoryExportDTO {

    public enum ExportFormat {
        CSV,
        PDF
    }

    private Long participantId;
    private String participantName;
    private ExportFormat exportFormat;
    private LocalDate startDateFilter;
    private LocalDate endDateFilter;

    public RegistrationHistoryExportDTO() {}

    public RegistrationHistoryExportDTO(Long participantId, String participantName, ExportFormat exportFormat, LocalDate startDateFilter, LocalDate endDateFilter) {
        this.participantId = participantId;
        this.participantName = participantName;
        this.exportFormat = exportFormat;
        this.startDateFilter = startDateFilter;
        this.endDateFilter = endDateFilter;
    }

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }

    public ExportFormat getExportFormat() { return exportFormat; }
    public void setExportFormat(ExportFormat exportFormat) { this.exportFormat = exportFormat; }

    public LocalDate getStartDateFilter() { return startDateFilter; }
    public void setStartDateFilter(LocalDate startDateFilter) { this.startDateFilter = startDateFilter; }

    public LocalDate getEndDateFilter() { return endDateFilter; }
    public void setEndDateFilter(LocalDate endDateFilter) { this.endDateFilter = endDateFilter; }
}
