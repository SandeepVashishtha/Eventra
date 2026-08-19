package com.eventra.scheduler;

import com.eventra.repository.BlacklistedTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.logging.Logger;

@Component
public class TokenCleanupScheduler {

    private static final Logger logger = Logger.getLogger(TokenCleanupScheduler.class.getName());

    @Autowired
    private BlacklistedTokenRepository tokenRepository;

    /**
     * Daily scheduled task running at 3:00 AM to purge expired blacklisted JWT tokens,
     * preventing database table bloat and maintaining lookup efficiency.
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void purgeExpiredBlacklistedTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCount = tokenRepository.deleteByExpiryDateBefore(now);
        logger.info("Executed scheduled BlacklistedToken TTL cleanup. Purged " + deletedCount + " expired tokens at " + now);
    }
}
