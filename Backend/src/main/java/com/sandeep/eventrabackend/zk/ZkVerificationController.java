package com.sandeep.eventrabackend.zk;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Zero-Knowledge Proof Verification.
 * 
 * This controller provides endpoints for verifying zero-knowledge proofs
 * of skill certificates for hackathon participants. It allows clients to
 * verify their certificate ownership without exposing personal information.
 * 
 * Endpoints:
 * - POST /api/zk/verify-range - Verify a range proof
 * - POST /api/zk/verify-certificate - Verify a certificate proof
 * - POST /api/zk/generate-salt - Generate a new random salt
 * - GET /api/zk/health - Health check endpoint
 * 
 * @author Eventra Contributors
 * @version 1.0
 * @since 2026-08-14
 */
@RestController
@RequestMapping("/api/zk")
@CrossOrigin(origins = "*")
public class ZkVerificationController {

    private final ZkRangeVerifierService verifierService;

    /**
     * Constructor with dependency injection.
     * 
     * @param verifierService The ZK range verifier service
     */
    public ZkVerificationController(ZkRangeVerifierService verifierService) {
        this.verifierService = verifierService;
    }

    /**
     * Request DTO for range proof verification.
     */
    public static class ZkProofRequest {
        private String commitment;
        private String proofValue;
        private String salt;

        public String getCommitment() {
            return commitment;
        }

        public void setCommitment(String commitment) {
            this.commitment = commitment;
        }

        public String getProofValue() {
            return proofValue;
        }

        public void setProofValue(String proofValue) {
            this.proofValue = proofValue;
        }

        public String getSalt() {
            return salt;
        }

        public void setSalt(String salt) {
            this.salt = salt;
        }
    }

    /**
     * Request DTO for certificate proof verification.
     */
    public static class CertificateProofRequest {
        private String commitment;
        private String proofData;
        private String salt;
        private Integer minScore;

        public String getCommitment() {
            return commitment;
        }

        public void setCommitment(String commitment) {
            this.commitment = commitment;
        }

        public String getProofData() {
            return proofData;
        }

        public void setProofData(String proofData) {
            this.proofData = proofData;
        }

        public String getSalt() {
            return salt;
        }

        public void setSalt(String salt) {
            this.salt = salt;
        }

        public Integer getMinScore() {
            return minScore;
        }

        public void setMinScore(Integer minScore) {
            this.minScore = minScore;
        }
    }

    /**
     * Verify a zero-knowledge range proof.
     * 
     * This endpoint verifies that a participant's proof corresponds to a
     * valid commitment without exposing the underlying data.
     * 
     * @param request The proof verification request
     * @return Response with verification result
     */
    @PostMapping("/verify-range")
    public ResponseEntity<Map<String, Object>> verifyRangeProof(@RequestBody ZkProofRequest request) {
        boolean isValid = verifierService.verifyRangeProof(
                request.getCommitment(),
                request.getProofValue(),
                request.getSalt()
        );

        Map<String, Object> response = createVerificationResponse(isValid);
        return ResponseEntity.ok(response);
    }

    /**
     * Verify a certificate-specific zero-knowledge proof.
     * 
     * This endpoint is specifically designed for skill certificate verification.
     * It validates that the proof corresponds to a valid certificate and meets
     * the minimum score requirement.
     * 
     * @param request The certificate proof verification request
     * @return Response with verification result and certificate details
     */
    @PostMapping("/verify-certificate")
    public ResponseEntity<Map<String, Object>> verifyCertificateProof(@RequestBody CertificateProofRequest request) {
        int minScore = request.getMinScore() != null ? request.getMinScore() : 70;
        
        boolean isValid = verifierService.verifyCertificateProof(
                request.getCommitment(),
                request.getProofData(),
                request.getSalt(),
                minScore
        );

        Map<String, Object> response = createVerificationResponse(isValid);
        response.put("minScore", minScore);
        response.put("requirementMet", isValid);
        
        // Add attestation status
        if (isValid) {
            response.put("attestationStatus", "VERIFIED_CERTIFICATE");
        } else {
            response.put("attestationStatus", "VERIFICATION_FAILED");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Generate a new random salt for commitment generation.
     * 
     * This endpoint provides a secure random salt that clients can use
     * when generating their zero-knowledge proofs.
     * 
     * @return Response with the generated salt
     */
    @GetMapping("/generate-salt")
    public ResponseEntity<Map<String, String>> generateSalt() {
        String salt = verifierService.generateSalt();
        
        Map<String, String> response = new HashMap<>();
        response.put("salt", salt);
        response.put("algorithm", "SHA-256");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Validate a commitment format.
     * 
     * This endpoint checks if a commitment string is well-formed.
     * 
     * @param commitment The commitment to validate
     * @return Response with validation result
     */
    @GetMapping("/validate-commitment")
    public ResponseEntity<Map<String, Object>> validateCommitment(@RequestParam String commitment) {
        boolean isValid = verifierService.isValidCommitmentFormat(commitment);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("commitment", commitment);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint for ZK verification service.
     * 
     * @return Response with service status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "ZkVerificationService");
        response.put("version", "1.0");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Creates a standard verification response map.
     * 
     * @param isValid Whether the verification was successful
     * @return Map containing verification response
     */
    private Map<String, Object> createVerificationResponse(boolean isValid) {
        Map<String, Object> response = new HashMap<>();
        response.put("verified", isValid);
        response.put("piiExposed", false);
        response.put("timestamp", System.currentTimeMillis());
        
        if (isValid) {
            response.put("message", "Proof verified successfully");
        } else {
            response.put("message", "Proof verification failed");
        }
        
        return response;
    }
}
