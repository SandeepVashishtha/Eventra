package com.eventra.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class WebhookUrlGuardTests {

    private final WebhookDispatchService dispatchService = new WebhookDispatchService();
    private final WebhookNotificationService notificationService = new WebhookNotificationService();

    @Test
    void allowsHttpsSlackWebhook() {
        assertTrue(dispatchService.isAllowedWebhookUrl("https://hooks.slack.com/services/T000/B000/XXXX"));
        assertTrue(notificationService.isAllowedWebhookUrl("https://hooks.slack.com/services/T000/B000/XXXX"));
    }

    @Test
    void allowsHttpsDiscordWebhook() {
        assertTrue(dispatchService.isAllowedWebhookUrl("https://discord.com/api/webhooks/123/abc"));
        assertTrue(notificationService.isAllowedWebhookUrl("https://discord.com/api/webhooks/123/abc"));
    }

    @Test
    void rejectsHttpScheme() {
        assertFalse(dispatchService.isAllowedWebhookUrl("http://hooks.slack.com/services/T000/B000/XXXX"));
        assertFalse(notificationService.isAllowedWebhookUrl("http://discord.com/api/webhooks/123/abc"));
    }

    @Test
    void rejectsPrivateLinkLocalAndLoopbackHosts() {
        assertFalse(dispatchService.isAllowedWebhookUrl("https://169.254.169.254/latest/meta-data/"));
        assertFalse(dispatchService.isAllowedWebhookUrl("https://10.0.0.1/admin"));
        assertFalse(notificationService.isAllowedWebhookUrl("https://127.0.0.1/hook"));
        assertFalse(notificationService.isAllowedWebhookUrl("https://192.168.1.1/hook"));
    }

    @Test
    void rejectsNonAllowlistedHosts() {
        assertFalse(dispatchService.isAllowedWebhookUrl("https://evil.example.com/hook"));
        assertFalse(notificationService.isAllowedWebhookUrl("https://hooks.slack.com.evil.example.com/x"));
        assertFalse(notificationService.isAllowedWebhookUrl("https://evilslack.com/hook"));
    }

    @Test
    void rejectsMalformedUrls() {
        assertFalse(dispatchService.isAllowedWebhookUrl("not a url"));
        assertFalse(notificationService.isAllowedWebhookUrl(""));
        assertFalse(notificationService.isAllowedWebhookUrl("ftp://hooks.slack.com/x"));
    }
}
