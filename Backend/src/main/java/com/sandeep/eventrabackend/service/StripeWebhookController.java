package com.sandeep.eventrabackend.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/webhook")
public class StripeWebhookController {

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        if (sigHeader == null || sigHeader.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Signature verification failed");
        }

        // Process event webhook transaction types
        if (payload.contains("payment_intent.succeeded")) {
            System.out.println("PaymentIntent completed successfully!");
        }

        return ResponseEntity.ok("Received");
    }
}
