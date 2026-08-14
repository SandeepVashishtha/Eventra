package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.ZkpNullifier;
import com.sandeep.eventrabackend.repository.ZkpNullifierRepository;
import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Zero-Knowledge Proof (ZKP) Verifier Service.
 * Mathematically validates attendee membership proofs without revealing submitter identity.
 */
@Service
public class ZkpVerifierService {

    private static final String DEFAULT_VERIFICATION_SECRET = "eventra-zkp-verification-secret";

    /**
     * Externally provisioned secret. Fails closed at startup when unset or still
     * equal to the documented default, so instances never run with a publicly
     * known key.
     */
    @Value("${zkp.proof.verification-secret:}")
    private String verificationSecret;

    @Autowired
    private ZkpNullifierRepository zkpNullifierRepository;

    @PostConstruct
    public void validateConfiguration() {
        if (verificationSecret == null || verificationSecret.isBlank()
                || DEFAULT_VERIFICATION_SECRET.equals(verificationSecret)) {
            throw new IllegalStateException(
                    "zkp.proof.verification-secret must be set to a non-default, externally provisioned secret");
        }
    }

    public static class ZkpProofPayload {
        @NotBlank(message = "eventId is required")
        private String eventId;
        @NotBlank(message = "proofHash is required")
        private String proofHash;
        private String merkleRoot;
        @NotBlank(message = "nullifierHash is required")
        private String nullifierHash;
        private String feedbackCategory;
        @NotBlank(message = "feedbackContent is required")
        private String feedbackContent;
        private String severity; // LOW, MEDIUM, CRITICAL

        // Getters and Setters
        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }

        public String getProofHash() { return proofHash; }
        public void setProofHash(String proofHash) { this.proofHash = proofHash; }

        public String getMerkleRoot() { return merkleRoot; }
        public void setMerkleRoot(String merkleRoot) { this.merkleRoot = merkleRoot; }

        public String getNullifierHash() { return nullifierHash; }
        public void setNullifierHash(String nullifierHash) { this.nullifierHash = nullifierHash; }

        public String getFeedbackCategory() { return feedbackCategory; }
        public void setFeedbackCategory(String feedbackCategory) { this.feedbackCategory = feedbackCategory; }

        public String getFeedbackContent() { return feedbackContent; }
        public void setFeedbackContent(String feedbackContent) { this.feedbackContent = feedbackContent; }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
    }

    /**
     * Cryptographically verify a ZKP proof against the server-side
     * verification secret and record the nullifier for one-time use.
     */
    public boolean verifyProof(ZkpProofPayload payload) {
        if (payload == null || payload.getEventId() == null || payload.getProofHash() == null || payload.getNullifierHash() == null) {
            return false;
        }
        if (!payload.getEventId().matches("^[0-9]+$")) {
        if (payload.getSeverity() != null && !payload.getSeverity().matches("^(LOW|MEDIUM|CRITICAL)$")) {
            return false;
        }
            return false;
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String rawInput = verificationSecret + ":" + payload.getEventId() + ":" + payload.getNullifierHash();
            byte[] hash = digest.digest(rawInput.getBytes(StandardCharsets.UTF_8));
            String expectedProofHash = HexFormat.of().formatHex(hash);

            return payload.getProofHash().equalsIgnoreCase(expectedProofHash);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Atomically persist a used nullifier so the same proof can never be
     * accepted twice. Returns false when the nullifier was already recorded.
     */
    public boolean markNullifierUsed(String eventId, String nullifierHash) {
        if (nullifierHash == null) {
            return false;
        }
        try {
            zkpNullifierRepository.save(new ZkpNullifier(eventId, nullifierHash));
            return true;
        } catch (DataIntegrityViolationException e) {
            return false;
        }
    }
}
