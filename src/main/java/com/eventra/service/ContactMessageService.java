package com.eventra.service;

import com.eventra.dto.ContactMessageDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@Service
public class ContactMessageService {

    private static final Logger logger = Logger.getLogger(ContactMessageService.class.getName());
    private static final int MAX_REQUESTS_PER_MINUTE = 3;
    private static final long ONE_MINUTE_IN_MS = 60 * 1000L;

    private final Map<String, List<Long>> ipRequestTimestamps = new ConcurrentHashMap<>();

    public void processContactMessage(ContactMessageDTO dto, String clientIp) {
        // 1. Honeypot check: reject if the hidden field is populated
        if (dto.getHoneypot() != null && !dto.getHoneypot().trim().isEmpty()) {
            logger.warning("Spam submission blocked via honeypot trap from IP: " + clientIp);
            throw new IllegalArgumentException("Invalid submission payload.");
        }

        // 2. IP Rate Limiting check: max 3 submissions per minute
        long now = System.currentTimeMillis();
        List<Long> timestamps = ipRequestTimestamps.computeIfAbsent(clientIp, k -> new ArrayList<>());

        synchronized (timestamps) {
            timestamps.removeIf(timestamp -> (now - timestamp) > ONE_MINUTE_IN_MS);

            if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
                logger.warning("Rate limit exceeded for contact form from IP: " + clientIp);
                throw new IllegalStateException("Rate limit exceeded. Maximum 3 submissions per minute allowed.");
            }

            timestamps.add(now);
        }

        logger.info("Contact message processed successfully from IP: " + clientIp + ", Email: " + dto.getEmail());
    }
}
