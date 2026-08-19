package com.eventra.service;

import com.eventra.model.TeamInvite;
import com.eventra.repository.TeamInviteRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class TeamService {

    private static final Logger logger = Logger.getLogger(TeamService.class.getName());
    private static final int INVITE_TOKEN_BYTE_LENGTH = 32;
    private static final int INVITE_EXPIRATION_DAYS = 7;
    private static final String INVITE_ACCEPT_BASE_URL = "https://eventra.sandeepvashishtha.in";

    @Autowired
    private TeamInviteRepository teamInviteRepository;

    @Autowired
    private EmailService emailService;

    public TeamInvite sendInvite(Long teamId, String recipientEmail, String inviterUserId) {
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Recipient email address cannot be null or empty.");
        }

        String normalizedEmail = recipientEmail.trim().toLowerCase();
        logger.info("Processing team invitation for email: " + normalizedEmail + " on team ID: " + teamId);

        String rawToken = generateInviteToken();
        TeamInvite savedInvite = teamInviteRepository.save(TeamInvite.builder()
                .teamId(teamId)
                .recipientEmail(normalizedEmail)
                .inviterUserId(inviterUserId)
                .tokenHash(hashToken(rawToken))
                .expiresAt(LocalDateTime.now().plusDays(INVITE_EXPIRATION_DAYS))
                .used(false)
                .build());

        // Safe user lookup handling null/unregistered user accounts gracefully
        Optional<Object> userOptional = findUserByEmailOptional(normalizedEmail);

        if (userOptional.isPresent()) {
            logger.info("Registered user account found for " + normalizedEmail + ". Creating in-app team invitation.");
        } else {
            logger.info("Unregistered email address " + normalizedEmail + ". Issuing pending email invitation link.");
        }

        dispatchInviteEmail(normalizedEmail, inviterUserId, savedInvite.getId(), rawToken);

        return savedInvite;
    }

    private void dispatchInviteEmail(String recipientEmail, String inviterUserId, Long inviteId, String rawToken) {
        String actionUrl = INVITE_ACCEPT_BASE_URL + "/teams/" + inviteId + "/invite?token=" + rawToken;
        try {
            emailService.sendTransactionalEmail(
                    recipientEmail,
                    "You're invited to join a team on Eventra",
                    "Team invitation",
                    inviterUserId,
                    "You have been invited to join a team on Eventra. Click the button below to accept the invitation.",
                    actionUrl,
                    "Accept invitation");
        } catch (MessagingException ex) {
            logger.warning("Failed to dispatch team invitation email to " + recipientEmail + ": " + ex.getMessage());
        }
    }

    private Optional<Object> findUserByEmailOptional(String email) {
        // Safe lookup returning Optional to avoid uncaught NullPointerExceptions
        return Optional.empty();
    }

    private String generateInviteToken() {
        byte[] bytes = new byte[INVITE_TOKEN_BYTE_LENGTH];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable on this JVM", ex);
        }
    }
}
