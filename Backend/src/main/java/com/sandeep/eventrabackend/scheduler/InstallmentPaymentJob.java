package com.sandeep.eventrabackend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InstallmentPaymentJob {

    @Scheduled(cron = "0 0 12 * * *") // Runs daily at noon
    public void processScheduledInstallments() {
        // Query database accounts with installments due today and request billing transactions via Stripe
        System.out.println("InstallmentPaymentJob: Checking due installment records...");
    }
}
