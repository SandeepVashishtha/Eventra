package com.sandeep.eventrabackend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.util.StringUtils;

/**
 * Fail fast in production when required secrets / datasource settings are missing.
 */
@Configuration
@Profile("prod")
public class ProdEnvironmentValidator {

    @Value("${app.jwt.secret:}")
    private String jwtSecret;

    @Value("${google.client.id:}")
    private String googleClientId;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:}")
    private String datasourcePassword;

    @Value("${google.client.secret:}")
    private String googleClientSecret;

    @PostConstruct
    public void validate() {
        require("JWT_SECRET / app.jwt.secret", jwtSecret);
        require("GOOGLE_CLIENT_ID / google.client.id", googleClientId);
        require("GOOGLE_CLIENT_SECRET / google.client.secret", googleClientSecret);
        require("DATABASE_URL / spring.datasource.url", datasourceUrl);
        require("DATABASE_USERNAME / spring.datasource.username", datasourceUsername);
        require("DATABASE_PASSWORD / spring.datasource.password", datasourcePassword);

        if (datasourceUrl.toLowerCase().contains(":h2:")) {
            throw new IllegalStateException(
                    "Production profile must not use an H2 datasource. Set DATABASE_URL to Postgres.");
        }

        if (googleClientId.contains("<") || "dev-google-client-id".equals(googleClientId)) {
            throw new IllegalStateException(
                    "Production Google client id is unset or still a placeholder.");
        }

        if (googleClientSecret.contains("<") || "dev-google-secret".equals(googleClientSecret)) {
            throw new IllegalStateException(
                    "Production Google client secret is unset or still a placeholder.");
        }

        if (datasourcePassword.contains("<") || "dev-db-password".equals(datasourcePassword)) {
            throw new IllegalStateException(
                    "Production database password is unset or still a placeholder.");
        }

        if (jwtSecret.length() < 32 || jwtSecret.startsWith("dev-only-secret")) {
            throw new IllegalStateException(
                    "Production JWT_SECRET must be set to a strong secret (32+ chars).");
        }
    }

    private static void require(String name, String value) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(
                    "Missing required production configuration: " + name);
        }
    }
}
