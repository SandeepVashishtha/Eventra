package com.eventra.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;

@Service
public class WebhookDispatchService {

    private static final Logger logger = LoggerFactory.getLogger(WebhookDispatchService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void dispatchRegistrationWebhookAsync(String webhookUrl, Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "Eventra-Webhook-Dispatcher/1.0");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(webhookUrl, request, String.class);
            logger.info("Successfully dispatched webhook notification to: {}", webhookUrl);
        } catch (Exception e) {
            logger.error("Failed to dispatch webhook to {}: {}", webhookUrl, e.getMessage(), e);
        }
    }
}
