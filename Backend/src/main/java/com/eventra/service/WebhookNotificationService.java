package com.eventra.service;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class WebhookNotificationService {

    private static final Logger logger = Logger.getLogger(WebhookNotificationService.class.getName());
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

    public record HackathonSubmissionEvent(
            Long hackathonId,
            String hackathonTitle,
            String teamName,
            String projectTitle,
            String submissionUrl,
            String slackWebhookUrl,
            String discordWebhookUrl
    ) {}

    @Async
    @EventListener
    public void handleHackathonSubmissionEvent(HackathonSubmissionEvent event) {
        logger.info("Processing submission webhook notifications for team: " + event.teamName());

        if (event.slackWebhookUrl() != null && !event.slackWebhookUrl().isBlank()) {
            sendSlackNotification(event.slackWebhookUrl(), event);
        }

        if (event.discordWebhookUrl() != null && !event.discordWebhookUrl().isBlank()) {
            sendDiscordNotification(event.discordWebhookUrl(), event);
        }
    }

    private void sendSlackNotification(String webhookUrl, HackathonSubmissionEvent event) {
        if (!isAllowedWebhookUrl(webhookUrl)) {
            logger.warning("Refusing non-allowlisted webhook url: " + webhookUrl);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String text = String.format("🚀 *New Hackathon Submission!*\n*Hackathon:* %s\n*Team:* %s\n*Project:* %s\n*Link:* %s",
                    event.hackathonTitle(), event.teamName(), event.projectTitle(), event.submissionUrl());

            Map<String, String> payload = new HashMap<>();
            payload.put("text", text);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(webhookUrl, request, String.class);
            logger.info("Successfully dispatched Slack notification to webhook.");
        } catch (Exception e) {
            logger.severe("Failed to send Slack webhook notification: " + e.getMessage());
        }
    }

    private void sendDiscordNotification(String webhookUrl, HackathonSubmissionEvent event) {
        if (!isAllowedWebhookUrl(webhookUrl)) {
            logger.warning("Refusing non-allowlisted webhook url: " + webhookUrl);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String content = String.format("🚀 **New Hackathon Submission!**\n**Hackathon:** %s\n**Team:** %s\n**Project:** %s\n**Link:** %s",
                    event.hackathonTitle(), event.teamName(), event.projectTitle(), event.submissionUrl());

            Map<String, String> payload = new HashMap<>();
            payload.put("content", content);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(webhookUrl, request, String.class);
            logger.info("Successfully dispatched Discord notification to webhook.");
        } catch (Exception e) {
            logger.severe("Failed to send Discord webhook notification: " + e.getMessage());
        }
    }
}
