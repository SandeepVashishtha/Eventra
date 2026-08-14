package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class WaitlistManager {

    private final ConcurrentLinkedQueue<String> waitlistQueue = new ConcurrentLinkedQueue<>();
    private final AtomicInteger currentCapacity = new AtomicInteger(100); // Max 100 spots

    public WaitlistPositionDto addToWaitlist(String userId) {
        waitlistQueue.add(userId);
        int position = waitlistQueue.size();
        return new WaitlistPositionDto(userId, position, "WAITING");
    }

    public String promoteNext() {
        if (currentCapacity.get() > 0 && !waitlistQueue.isEmpty()) {
            currentCapacity.decrementAndGet();
            return waitlistQueue.poll();
        }
        return null;
    }
}
