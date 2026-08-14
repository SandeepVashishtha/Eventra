package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.ZkpFeedback;
import com.sandeep.eventrabackend.repository.ZkpFeedbackRepository;
import com.sandeep.eventrabackend.service.ZkpVerifierService;
import com.sandeep.eventrabackend.service.ZkpVerifierService.ZkpProofPayload;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback/zkp")
public class ZkpFeedbackController {

    @Autowired
    private ZkpVerifierService zkpVerifierService;

    @Autowired
    private ZkpFeedbackRepository zkpFeedbackRepository;

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitAnonymousFeedback(@Valid @RequestBody ZkpProofPayload payload) {
        Map<String, Object> response = new HashMap<>();

        if (payload == null || payload.getEventId() == null || payload.getEventId().isBlank()) {
            response.put("success", false);
            response.put("message", "Event ID is required.");
            return ResponseEntity.badRequest().body(response);
        }

        boolean isValid = zkpVerifierService.verifyProof(payload);
        if (!isValid) {
            response.put("success", false);
            response.put("message", "Invalid Zero-Knowledge Proof. Attendee membership could not be verified.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Save feedback first, then mark nullifier as used to prevent nullifier
        // consumption on failed feedback persistence.
        Long eventIdLong;
        try {
            eventIdLong = Long.valueOf(payload.getEventId());
        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("message", "Invalid event ID format.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        ZkpFeedback savedFeedback = null;
        try {
            savedFeedback = zkpFeedbackRepository.save(new ZkpFeedback(
                    eventIdLong,
                    payload.getNullifierHash(),
                    payload.getFeedbackCategory(),
                    payload.getFeedbackContent(),
                    payload.getSeverity()));
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Failed to persist anonymous feedback. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        boolean nullifierRecorded = zkpVerifierService.markNullifierUsed(payload.getEventId(), payload.getNullifierHash());
        if (!nullifierRecorded) {
            // Nullifier was already consumed (race condition) - roll back the saved feedback
            if (savedFeedback != null) {
                zkpFeedbackRepository.delete(savedFeedback);
            }
            response.put("success", false);
            response.put("message", "This proof has already been used. Each nullifier can only be submitted once.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        response.put("success", true);
        response.put("message", "Anonymous feedback submitted successfully with verified ZKP membership.");
        response.put("proofVerified", true);
        response.put("nullifierHash", payload.getNullifierHash());

        return ResponseEntity.ok(response);
    }
}
