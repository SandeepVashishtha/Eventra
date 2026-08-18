package com.eventra.service;

import com.sandeep.eventrabackend.repository.PaymentPlanRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
public class QrCodeValidationService {

    private final PaymentPlanRepository paymentPlanRepository;

    public QrCodeValidationService(PaymentPlanRepository paymentPlanRepository) {
        this.paymentPlanRepository = paymentPlanRepository;
    }

    public enum QrValidationStatus {
        VALID,
        EXPIRED,
        CANCELLED_REGISTRATION,
        INVALID_EVENT,
        INELIGIBLE,
        PAYMENT_PENDING,
        PAYMENT_INCOMPLETE,
        INVALID_REQUEST
    }

    public QrValidationResult validateQrCode(String ticketId, String eventId, String registrationStatus, String eventStatus, Instant qrExpirationTime) {
        return validateQrCode(ticketId, eventId, registrationStatus, eventStatus, qrExpirationTime, null);
    }

    public QrValidationResult validateQrCode(String ticketId, String eventId, String registrationStatus, String eventStatus, Instant qrExpirationTime, Long registrationId) {
        if (qrExpirationTime != null && Instant.now().isAfter(qrExpirationTime)) {
            return new QrValidationResult(false, QrValidationStatus.EXPIRED, "❌ Registration QR code has expired.");
        }

        if (!"CONFIRMED".equalsIgnoreCase(registrationStatus) && !"ACTIVE".equalsIgnoreCase(registrationStatus)) {
            return new QrValidationResult(false, QrValidationStatus.CANCELLED_REGISTRATION, "❌ Registration is no longer valid.");
        }

        if ("CANCELLED".equalsIgnoreCase(eventStatus) || "COMPLETED".equalsIgnoreCase(eventStatus)) {
            return new QrValidationResult(false, QrValidationStatus.INVALID_EVENT, "❌ Event status does not allow check-in.");
        }

        // Check payment completion for installment payments
        if (registrationId != null) {
            Optional<com.sandeep.eventrabackend.model.PaymentPlan> paymentPlanOptional = 
                    paymentPlanRepository.findByRegistration_Id(registrationId);
            
            if (paymentPlanOptional.isPresent()) {
                QrValidationResult paymentResult = paymentGate(paymentPlanOptional.get());
                if (paymentResult != null) {
                    return paymentResult;
                }
            }
        }

        return new QrValidationResult(true, QrValidationStatus.VALID, "✅ QR Code verified successfully.");
    }

    public QrValidationResult validateQrCodeWithRegistrationId(Long registrationId, String registrationStatus, String eventStatus, Instant qrExpirationTime) {
        if (registrationId == null || registrationId <= 0) {
            return new QrValidationResult(false, QrValidationStatus.INVALID_REQUEST, "❌ Invalid registration ID.");
        }

        if (qrExpirationTime != null && Instant.now().isAfter(qrExpirationTime)) {
            return new QrValidationResult(false, QrValidationStatus.EXPIRED, "❌ Registration QR code has expired.");
        }

        if (!"CONFIRMED".equalsIgnoreCase(registrationStatus) && !"ACTIVE".equalsIgnoreCase(registrationStatus)) {
            return new QrValidationResult(false, QrValidationStatus.CANCELLED_REGISTRATION, "❌ Registration is no longer valid.");
        }

        if ("CANCELLED".equalsIgnoreCase(eventStatus) || "COMPLETED".equalsIgnoreCase(eventStatus)) {
            return new QrValidationResult(false, QrValidationStatus.INVALID_EVENT, "❌ Event status does not allow check-in.");
        }

        // Check payment completion
        Optional<com.sandeep.eventrabackend.model.PaymentPlan> paymentPlanOptional = 
                paymentPlanRepository.findByRegistration_Id(registrationId);
        
        if (paymentPlanOptional.isPresent()) {
            QrValidationResult paymentResult = paymentGate(paymentPlanOptional.get());
            if (paymentResult != null) {
                return paymentResult;
            }
        }

        return new QrValidationResult(true, QrValidationStatus.VALID, "✅ QR Code verified successfully.");
    }

    private QrValidationResult paymentGate(com.sandeep.eventrabackend.model.PaymentPlan paymentPlan) {
        if (paymentPlan.isCancelled() || paymentPlan.isFailed()) {
            return new QrValidationResult(false, QrValidationStatus.CANCELLED_REGISTRATION,
                    "❌ Payment plan was cancelled. Registration is no longer valid.");
        }

        if (!paymentPlan.isQRCodeActivated() && paymentPlan.isActive()) {
            return new QrValidationResult(false, QrValidationStatus.PAYMENT_PENDING,
                    "❌ QR code not activated. Payment installments must be completed before QR code activation.");
        }

        if (paymentPlan.isActive() && !paymentPlan.isCompleted()) {
            return new QrValidationResult(false, QrValidationStatus.PAYMENT_INCOMPLETE,
                    "❌ Payment is incomplete. QR code activates after final installment is paid.");
        }

        return null;
    }

    public boolean isQRCodeActivatedForRegistration(Long registrationId) {
        Optional<com.sandeep.eventrabackend.model.PaymentPlan> paymentPlanOptional = 
                paymentPlanRepository.findByRegistration_Id(registrationId);
        
        if (paymentPlanOptional.isPresent()) {
            com.sandeep.eventrabackend.model.PaymentPlan paymentPlan = paymentPlanOptional.get();
            return paymentPlan.isQRCodeActivated();
        }
        
        // If no payment plan, QR code is activated by default
        return true;
    }

    public record QrValidationResult(boolean isValid, QrValidationStatus status, String message) {}
}
