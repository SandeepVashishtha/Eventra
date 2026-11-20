package com.sandeep.eventrabackend.controller;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Externalized configuration for the dynamic form validation controller.
 * All properties are bound from application.properties under the prefix
 * {@code eventra.validation}.
 *
 * <pre>
 * eventra.validation.strict-mode=true
 * eventra.validation.sanitize-inputs=true
 * eventra.validation.schema-version=https://json-schema.org/draft/2020-12/schema
 * eventra.validation.max-payload-size-kb=512
 * </pre>
 */
@Component
@ConfigurationProperties(prefix = "eventra.validation")
public class ValidationProperties {

    /** If true, additional schema errors cause immediate rejection. */
    private boolean strictMode = true;

    /** If true, all string inputs are sanitized to strip XSS payloads. */
    private boolean sanitizeInputs = true;

    /** JSON Schema meta-schema URI used when the request schema omits $schema. */
    private String schemaVersion = "https://json-schema.org/draft/2020-12/schema";

    /** Maximum allowed formData payload size in kilobytes (guard against abuse). */
    private int maxPayloadSizeKb = 512;

    // ---- Getters & Setters ------------------------------------------------

    public boolean isStrictMode() {
        return strictMode;
    }

    public void setStrictMode(boolean strictMode) {
        this.strictMode = strictMode;
    }

    public boolean isSanitizeInputs() {
        return sanitizeInputs;
    }

    public void setSanitizeInputs(boolean sanitizeInputs) {
        this.sanitizeInputs = sanitizeInputs;
    }

    public String getSchemaVersion() {
        return schemaVersion;
    }

    public void setSchemaVersion(String schemaVersion) {
        this.schemaVersion = schemaVersion;
    }

    public int getMaxPayloadSizeKb() {
        return maxPayloadSizeKb;
    }

    public void setMaxPayloadSizeKb(int maxPayloadSizeKb) {
        this.maxPayloadSizeKb = maxPayloadSizeKb;
    }
}
