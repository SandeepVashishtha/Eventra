package com.sandeep.eventrabackend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class GdprAnonymizationJob {

    @Scheduled(cron = "0 0 2 * * *") // Runs every day at 2:00 AM
    public void runAnonymization() {
        // Find users requested for deletions and anonymize their profile details
        System.out.println("Executing daily GDPR-compliant user profile anonymization task...");
    }

    public String anonymizeString(String input) {
        if (input == null) return null;
        return "anon_" + UUID.randomUUID().toString().substring(0, 8);
    }
}
