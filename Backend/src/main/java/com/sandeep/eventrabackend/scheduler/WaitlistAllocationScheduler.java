package com.sandeep.eventrabackend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WaitlistAllocationScheduler {

    @Scheduled(cron = "0 0/15 * * * *") // Runs every 15 minutes
    public void checkAndAllocateCanceledTickets() {
        // Query database for recent ticket cancellations and auto-promote waitlist entries
        System.out.println("WaitlistAllocationScheduler: scanning for canceled spots to promote waitlist...");
    }
}
