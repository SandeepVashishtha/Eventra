package com.eventra.dto;

public class DocumentVerificationDTO {

    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED
    }

    private Long documentId;
    private Long participantId;
    private String participantName;
    private String documentName;
    private VerificationStatus status;
    private String rejectionReason;

    public DocumentVerificationDTO() {}

    public DocumentVerificationDTO(Long documentId, Long participantId, String participantName, String documentName, VerificationStatus status, String rejectionReason) {
        this.documentId = documentId;
        this.participantId = participantId;
        this.participantName = participantName;
        this.documentName = documentName;
        this.status = status;
        this.rejectionReason = rejectionReason;
    }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Long getParticipantId() { return participantId; }
    public void setParticipantId(Long participantId) { this.participantId = participantId; }

    public String getParticipantName() { return participantName; }
    public void setParticipantName(String participantName) { this.participantName = participantName; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public VerificationStatus getStatus() { return status; }
    public void setStatus(VerificationStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
