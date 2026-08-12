package com.eventra.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.net.http.HttpClient;

/**
 * Provides the HTTP client used by the webhook dispatch services.
 *
 * The default {@code RestTemplate} follows HTTP redirects, which turns a
 * webhook POST into a potential SSRF vector (a redirect target can point at
 * internal/private endpoints). This bean disables redirect following entirely.
 */
@Configuration
public class WebhookConfig {

    @Bean
    public RestTemplate webhookRestTemplate() {
        HttpClient httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
        return new RestTemplate(new JdkClientHttpRequestFactory(httpClient));
    }
}
