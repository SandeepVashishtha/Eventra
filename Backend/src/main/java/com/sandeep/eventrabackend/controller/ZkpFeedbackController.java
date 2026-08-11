package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.ZkpVerifierService;
import com.sandeep.eventrabackend.service.ZkpVerifierService.ZkpProofPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback/zkp")
@CrossOrigin(origins = "*")
public class ZkpFeedbackController {

    @Autowired
    private ZkpVerifierService zkpVerifierService;

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitAnonymousFeedback(@RequestBody ZkpProofPayload payload) {
        Map<String, Object> response = new HashMap<>();

        boolean isValid = zkpVerifierService.verifyProof(payload);
        if (!isValid) {
            response.put("success", false);
            response.put("message", "Invalid Zero-Knowledge Proof. Attendee membership could not be verified.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        response.put("success", true);
        response.put("message", "Anonymous feedback submitted successfully with verified ZKP membership.");
        response.put("proofVerified", true);
        response.put("nullifierHash", payload.getNullifierHash());

        return ResponseEntity.ok(response);
    }
}
