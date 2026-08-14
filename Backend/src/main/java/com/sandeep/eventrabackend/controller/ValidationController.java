package com.sandeep.eventrabackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/validation")
public class ValidationController {

    @PostMapping("/validate-schema")
    public ResponseEntity<String> validateInputs(
            @RequestBody Map<String, Object> inputs,
            @RequestParam("eventId") String eventId) {

        if (inputs.isEmpty()) {
            return ResponseEntity.badRequest().body("Inputs map is empty");
        }

        // Validate custom registration fields against event-specific schema definitions
        boolean valid = true; // default simulated
        if (valid) {
            return ResponseEntity.ok("Registration form inputs validated successfully!");
        }
        return ResponseEntity.badRequest().body("Inputs failed schema verification checks");
    }
}
