package com.sandeep.eventrabackend.zkp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ZkVerificationControllerTest {

    @Mock
    private ZkRangeVerifierService verifierService;

    private ZkVerificationController controller;

    @BeforeEach
    void setUp() {
        controller = new ZkVerificationController(verifierService);
    }

    @Test
    @DisplayName("Should return HTTP 200 with VERIFIED_ELIGIBLE status when proof is valid")
    void testVerifyRangeProof_Success() {
        ZkVerificationController.ZkProofRequest request = new ZkVerificationController.ZkProofRequest();
        request.setCommitment("validCommitment");
        request.setProofValue("25");
        request.setSalt("salt123");
        request.setMinInclusive(18);
        request.setMaxInclusive(120);

        when(verifierService.verifyRangeProof(eq("validCommitment"), eq("25"), eq("salt123"), eq(18), eq(120)))
                .thenReturn(true);

        ResponseEntity<Map<String, Object>> response = controller.verifyRangeProof(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(true, response.getBody().get("verified"));
        assertEquals(false, response.getBody().get("piiExposed"));
        assertEquals("VERIFIED_ELIGIBLE", response.getBody().get("attestationStatus"));
    }

    @Test
    @DisplayName("Should return HTTP 200 with VERIFICATION_FAILED status when proof is invalid")
    void testVerifyRangeProof_Failure() {
        ZkVerificationController.ZkProofRequest request = new ZkVerificationController.ZkProofRequest();
        request.setCommitment("invalidCommitment");
        request.setProofValue("15");
        request.setSalt("salt123");
        request.setMinInclusive(18);
        request.setMaxInclusive(120);

        when(verifierService.verifyRangeProof(any(), any(), any(), any(), any()))
                .thenReturn(false);

        ResponseEntity<Map<String, Object>> response = controller.verifyRangeProof(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(false, response.getBody().get("verified"));
        assertEquals(false, response.getBody().get("piiExposed"));
        assertEquals("VERIFICATION_FAILED", response.getBody().get("attestationStatus"));
    }

    @Test
    @DisplayName("Should return HTTP 400 Bad Request when request body is null")
    void testVerifyRangeProof_NullRequest() {
        ResponseEntity<Map<String, Object>> response = controller.verifyRangeProof(null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(false, response.getBody().get("verified"));
        assertEquals("VERIFICATION_FAILED", response.getBody().get("attestationStatus"));
    }
}
