package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.atomic.AtomicLong;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe SSE message sequence stream tracking service (#16609).
 */
@Service
public class EventStreamService {

    // Atomic counter avoids race conditions during async sequence increments
    private final AtomicLong sequenceCounter = new AtomicLong(0);
    private final Map<Long, String> messageHistory = new ConcurrentHashMap<>();

    public long publishMessage(String message) {
        long seq = sequenceCounter.incrementAndGet();
        messageHistory.put(seq, message);
        return seq;
    }

    public List<String> getMissedMessages(long lastReceivedSeq) {
        List<String> missed = new ArrayList<>();
        long current = sequenceCounter.get();
        for (long i = lastReceivedSeq + 1; i <= current; i++) {
            String msg = messageHistory.get(i);
            if (msg != null) {
                missed.add(msg);
            }
        }
        return missed;
    }

    public void clearHistory() {
        messageHistory.clear();
        sequenceCounter.set(0);
    }
}
