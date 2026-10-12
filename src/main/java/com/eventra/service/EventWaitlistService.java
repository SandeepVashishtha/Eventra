package com.eventra.service;

import com.eventra.model.EventWaitlist;
import com.eventra.repository.EventWaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Service
public class EventWaitlistService {

    private static final Logger logger = Logger.getLogger(EventWaitlistService.class.getName());

    @Autowired
    private EventWaitlistRepository waitlistRepository;

    /**
     * Scheduled job running every 5 minutes to scan for expired waitlist promotion tokens
     * and automatically promote the next pending user in line.
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void processExpiredWaitlistTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<EventWaitlist> expiredPromotions = waitlistRepository.findByStatusAndExpirationTimeBefore("PROMOTED", now);

        if (expiredPromotions.isEmpty()) {
            return;
        }

        logger.info("Found " + expiredPromotions.size() + " expired waitlist promotion tokens to process.");

        for (EventWaitlist expiredEntry : expiredPromotions) {
            // Mark current unclaimed offer as expired
            expiredEntry.setStatus("EXPIRED");
            waitlistRepository.save(expiredEntry);

            logger.info("Marked token expired for waitlist entry ID: " + expiredEntry.getId() + " on event ID: " + expiredEntry.getEventId());

            # Promote next user in line for this event
            promoteNextWaitlistUser(expiredEntry.getEventId());
        }
    }

    @Transactional
    public void promoteNextWaitlistUser(Long eventId) {
        waitlistRepository.findNextPendingWithPessimisticWriteLock(eventId).ifPresent(nextUser -> {
            nextUser.setStatus("PROMOTED");
            // Set 24-hour expiration window for the newly promoted user
            nextUser.setExpirationTime(LocalDateTime.now().plusHours(24));
            waitlistRepository.save(nextUser);
            logger.info("Promoted next user ID: " + nextUser.getUserId() + " for event ID: " + eventId);
        });
    }
}
