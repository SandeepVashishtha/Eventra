package com.sandeep.eventrabackend.zkp;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

/**
 * REST controller endpoints mapping ZKP RSVP verification requests (#17663).
 */
@RestController
@RequestMapping("/api/zkp")
public class ZkpVerificationController {

    private final ZkpVerificationService verificationService;

    public ZkpVerificationController(ZkpVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/verify-rsvp")
    public ResponseEntity<String> verifyRsvp(@RequestParam String commitment, @RequestParam String proof) {
        boolean isValid = verificationService.verifyRsvpProof(commitment, proof);
        if (isValid) {
            return ResponseEntity.ok("ZKP Proof verified successfully! Registration valid.");
        }
        return ResponseEntity.badRequest().body("Invalid ZKP verification parameters.");
    }
}
