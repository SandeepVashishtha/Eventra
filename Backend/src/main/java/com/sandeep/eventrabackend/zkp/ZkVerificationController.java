package com.sandeep.eventrabackend.zkp;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/zkp")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,https://eventra-psi.vercel.app,https://eventra.sandeepvashishtha.in}")
public class ZkVerificationController {

    private final ZkRangeVerifierService verifierService;

    public ZkVerificationController(ZkRangeVerifierService verifierService) {
        this.verifierService = verifierService;
    }

    public static class ZkProofRequest {
        private String commitment;
        private String proofValue; // Representing verified status range value
        private String salt;
        private Integer minInclusive;
        private Integer maxInclusive;

        public String getCommitment() { return commitment; }
        public void setCommitment(String commitment) { this.commitment = commitment; }

        public String getProofValue() { return proofValue; }
        public void setProofValue(String proofValue) { this.proofValue = proofValue; }

        public String getSalt() { return salt; }
        public void setSalt(String salt) { this.salt = salt; }

        public Integer getMinInclusive() { return minInclusive; }
        public void setMinInclusive(Integer minInclusive) { this.minInclusive = minInclusive; }

        public Integer getMaxInclusive() { return maxInclusive; }
        public void setMaxInclusive(Integer maxInclusive) { this.maxInclusive = maxInclusive; }
    }

    @PostMapping("/verify-range")
    public ResponseEntity<Map<String, Object>> verifyRangeProof(@RequestBody ZkProofRequest request) {
        if (request == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("verified", false);
            errorResponse.put("piiExposed", false);
            errorResponse.put("attestationStatus", "VERIFICATION_FAILED");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        boolean isValid = verifierService.verifyRangeProof(
                request.getCommitment(),
                request.getProofValue(),
                request.getSalt(),
                request.getMinInclusive(),
                request.getMaxInclusive()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("verified", isValid);
        response.put("piiExposed", false);
        response.put("attestationStatus", isValid ? "VERIFIED_ELIGIBLE" : "VERIFICATION_FAILED");

        return ResponseEntity.ok(response);
    }
}
