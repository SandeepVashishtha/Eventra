package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class WebPushNotificationService {

    private final HttpClient httpClient;

    public WebPushNotificationService() {
        this.httpClient = HttpClient.newHttpClient();
    }

    public boolean sendPushNotification(PushSubscriptionDto subscription, String payload) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(subscription.getEndpoint()))
                .header("Content-Type", "application/octet-stream")
                // Custom encryption wrapper headers
                .header("Encryption", "salt=mock_salt_value")
                .header("Crypto-Key", "dh=mock_crypto_key")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 201 || response.statusCode() == 200;
        } catch (Exception e) {
            System.err.println("WebPush dispatch notification failed: " + e.getMessage());
            return false;
        }
    }
}
