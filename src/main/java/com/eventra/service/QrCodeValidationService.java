package com.eventra.service;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;

@Service
public class QrCodeValidationService {

    public enum QrValidationStatus {
        VALID,
        EXPIRED,
        CANCELLED_REGISTRATION,
        INVALID_EVENT,
        INELIGIBLE
    }

    public QrValidationResult validateQrCode(String ticketId, String eventId, String registrationStatus, String eventStatus, Instant qrExpirationTime) {
        if (qrExpirationTime != null && Instant.now().isAfter(qrExpirationTime)) {
            return new QrValidationResult(false, QrValidationStatus.EXPIRED, "❌ Registration QR code has expired.");
        }

        if (!"CONFIRMED".equalsIgnoreCase(registrationStatus) && !"ACTIVE".equalsIgnoreCase(registrationStatus)) {
            return new QrValidationResult(false, QrValidationStatus.CANCELLED_REGISTRATION, "❌ Registration is no longer valid.");
        }

        if ("CANCELLED".equalsIgnoreCase(eventStatus) || "COMPLETED".equalsIgnoreCase(eventStatus)) {
            return new QrValidationResult(false, QrValidationStatus.INVALID_EVENT, "❌ Event status does not allow check-in.");
        }

        return new QrValidationResult(true, QrValidationStatus.VALID, "✅ QR Code verified successfully.");
    }

    public record QrValidationResult(boolean isValid, QrValidationStatus status, String message) {}
}
