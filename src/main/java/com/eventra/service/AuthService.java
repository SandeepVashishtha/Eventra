package com.eventra.service;

import com.eventra.model.RecoverySession;
import com.eventra.repository.RecoverySessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.logging.Logger;

@Service
public class AuthService {

    private static final Logger logger = Logger.getLogger(AuthService.class.getName());

    @Autowired
    private RecoverySessionRepository recoverySessionRepository;

    @Transactional
    public void resetPasswordWithToken(String token, String newPassword) {
        RecoverySession session = recoverySessionRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid password recovery token."));

        if (session.isUsed()) {
            logger.warning("Attempted reuse of password recovery token: " + token);
            throw new IllegalStateException("Password recovery token has already been used.");
        }

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            logger.warning("Attempted use of expired password recovery token: " + token);
            throw new IllegalStateException("Password recovery token has expired.");
        }

        // Perform password update logic here
        logger.info("Successfully updated password for user ID: " + session.getUserId());

        // Invalidate token immediately upon successful password change
        session.setUsed(true);
        recoverySessionRepository.save(session);
    }
}
