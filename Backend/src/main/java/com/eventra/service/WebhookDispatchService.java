package com.eventra.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.util.Locale;
import java.util.Map;

@Service
public class WebhookDispatchService {

    private static final Logger logger = LoggerFactory.getLogger(WebhookDispatchService.class);
    private final RestTemplate restTemplate = createRestTemplate();

    private static RestTemplate createRestTemplate() {
        HttpClient httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
        return new RestTemplate(new JdkClientHttpRequestFactory(httpClient));
    }

    boolean isAllowedWebhookUrl(String webhookUrl) {
        try {
            URI uri = URI.create(webhookUrl);
            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                return false;
            }
            String host = uri.getHost();
            if (host == null) {
                return false;
            }
            String lower = host.toLowerCase(Locale.ROOT);
            return lower.equals("slack.com") || lower.endsWith(".slack.com")
                    || lower.equals("discord.com") || lower.endsWith(".discord.com");
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    @Async
    public void dispatchRegistrationWebhookAsync(String webhookUrl, Map<String, Object> payload) {
        if (!isAllowedWebhookUrl(webhookUrl)) {
            logger.warn("Refusing non-allowlisted webhook url: {}", webhookUrl);
            return;
        }
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
