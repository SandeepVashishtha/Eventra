package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class StripePaymentService {

    public Map<String, Object> createPaymentIntent(double amount, String currency) {
        Map<String, Object> response = new HashMap<>();
        String clientSecret = "pi_" + UUID.randomUUID().toString() + "_secret_" + UUID.randomUUID().toString().substring(0, 8);
        
        response.put("id", "pi_" + UUID.randomUUID().toString());
        response.put("clientSecret", clientSecret);
        response.put("amount", amount);
        response.put("currency", currency);
        response.put("status", "requires_payment_method");

        return response;
    }
}
