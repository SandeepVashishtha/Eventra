package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.request.SignupRequest;
import com.sandeep.eventrabackend.dto.response.AuthResponse;
import com.sandeep.eventrabackend.exception.PasswordMismatchException;
import com.sandeep.eventrabackend.exception.UserAlreadyExistsException;
import com.sandeep.eventrabackend.exception.InvalidGoogleTokenException;
import com.sandeep.eventrabackend.exception.AccountNotVerifiedException;
import com.sandeep.eventrabackend.model.PasswordResetToken;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.PasswordResetTokenRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.security.JwtTokenProvider;
import com.sandeep.eventrabackend.security.TokenBlacklistService;
import com.sandeep.eventrabackend.security.TokenRefreshQueueHandler;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sandeep.eventrabackend.dto.request.GoogleAuthRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class AuthService {

    /** Bounded retries for unique-username collisions under concurrent first logins. */
    private static final int MAX_USERNAME_RETRIES = 5;

    private static final long RESET_TOKEN_EXPIRATION_MINUTES = 30;
    private static final int RESET_TOKEN_BYTE_LENGTH = 32;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleAuthService googleAuthService;
    private final TokenBlacklistService tokenBlacklistService;
    private final TokenRefreshQueueHandler tokenRefreshQueueHandler;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            GoogleAuthService googleAuthService,
            TokenBlacklistService tokenBlacklistService,
            TokenRefreshQueueHandler tokenRefreshQueueHandler,
            PasswordResetTokenRepository passwordResetTokenRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.googleAuthService = googleAuthService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.tokenRefreshQueueHandler = tokenRefreshQueueHandler;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // 1. Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("Password and confirm password do not match");
        }

        // 2. Check for duplicate email (case-insensitive)
        String normalizedEmail = request.getEmail().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new UserAlreadyExistsException(
                    "An account with email '" + normalizedEmail + "' already exists");
        }

        // 3. Derive username from email (local part) and ensure uniqueness
        String baseUsername = normalizedEmail.split("@")[0].toLowerCase();
        String username = generateUniqueUsername(baseUsername);

        // 4. Persist the user. The existsByEmail check above is non-atomic, so a
        // concurrent signup with the same email can still hit the unique-email
        // constraint here. Flush the INSERT inside the transaction so the
        // constraint violation surfaces as DataIntegrityViolationException right
        // here and maps to a clean 409, instead of failing at commit time as a
        // 500 (#18843).
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ATTENDEE)
                .emailVerified(false)
                .authProvider("LOCAL")
                .build();

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            throw new UserAlreadyExistsException(
                    "An account with email '" + normalizedEmail + "' already exists");
        }

        // 5. Issue JWT (embed the user's role claim for stateless RBAC checks)
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        // Signup normalizes the email to lowercase before persisting, so the
        // login/lookup path must normalize the identifier the same way.
        // Otherwise a user who registered with a mixed-case email can never log in.
        String identifier = request.getUsernameOrEmail().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        identifier,
                        request.getPassword()));

        // Reload user for profile info (and role claim for the JWT)
        User user = userRepository
                .findByEmailOrUsername(identifier, identifier)
                .orElseThrow();

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return buildAuthResponse(user, token);
    }

    public AuthResponse googleLogin(GoogleAuthRequest request) {

        try {

            GoogleIdToken.Payload payload = googleAuthService.verifyToken(request.getToken());

            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new InvalidGoogleTokenException(
                        "Google account email is not verified.");
            }

            String email = payload.getEmail();

            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException(
                        "Google account must provide a valid email address.");
            }

            email = email.toLowerCase();

            String firstName = (String) payload.get("given_name");

            String lastName = (String) payload.get("family_name");

            if (firstName == null || firstName.isBlank()) {
                firstName = "Google";
            }

            if (lastName == null || lastName.isBlank()) {
                lastName = "User";
            }

            User user = userRepository
                    .findByEmail(email)
                    .orElse(null);

            if (user == null) {

                String baseUsername = email.split("@")[0].toLowerCase();

                // Race-safe create: a concurrent first login for the same email
                // either wins the insert or adopts the winner; unique-username
                // collisions are retried with a fresh candidate (bounded).
                user = createOrGetGoogleUser(email, firstName, lastName, baseUsername);
            } else if (!user.isEmailVerified()
                    && (user.getAuthProvider() == null || "LOCAL".equalsIgnoreCase(user.getAuthProvider()))) {
                // Never auto-claim an unverified LOCAL account. The Google identity may
                // only be linked after the LOCAL account has proven email ownership; the
                // caller must route to a verify-email / explicit link flow instead.
                throw new AccountNotVerifiedException(
                        "An account already exists for this email but has not been verified. "
                        + "Please verify your email before linking your Google account.");
            } else if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                if (user.getAuthProvider() == null || user.getAuthProvider().isBlank()) {
                    user.setAuthProvider("GOOGLE");
                }
                user = userRepository.save(user);
            }

            String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());

            return buildAuthResponse(user, token);

        } catch (InvalidGoogleTokenException e) {
            throw e;
        } catch (AccountNotVerifiedException e) {
            throw e;
        } catch (DataIntegrityViolationException e) {
            // A unique-constraint race could not be resolved within the bounded
            // retries; surface it as a 409 (Conflict) instead of a wrapped 500.
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed", e);
        }
    }

    public void logout(String accessToken, String refreshToken) {
        if (accessToken != null && !accessToken.isBlank()) {
            try {
                java.util.Date expiration = jwtTokenProvider.getExpirationDateFromTokenAllowExpired(accessToken);
                tokenBlacklistService.addToBlacklist(accessToken, expiration);
            } catch (RuntimeException ex) {
                // Best-effort blacklist: expired or malformed tokens must not block logout.
            }
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                if (jwtTokenProvider.isRefreshToken(refreshToken)) {
                    java.util.Date refreshExpiration =
                            jwtTokenProvider.getExpirationDateFromTokenAllowExpired(refreshToken);
                    tokenBlacklistService.addToBlacklist(refreshToken, refreshExpiration);
                }
            } catch (RuntimeException ex) {
                // Best-effort blacklist for refresh token as well.
            }
        }
    }

    public void reauth(String userEmail, String password) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                        "User not found with email: " + userEmail));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new org.springframework.security.authentication.BadCredentialsException(
                    "Incorrect password");
        }
    }

    // ─── password reset ────────────────────────────────────────────────────────

    /**
     * Initiates a password reset for the given email.
     *
     * <p>A cryptographically random, short-lived token is generated and only
     * its SHA-256 hash is persisted. The raw token is <em>never</em> returned
     * in the API response (doing so would let an attacker take over any
     * account, since this endpoint is unauthenticated). Deployments must
     * deliver the raw token to the account owner out-of-band (e.g. email a
     * reset link); the reset step exchanges the token via a server-side
     * lookup of its hash.</p>
     *
     * <p>For privacy, unknown emails still return HTTP 200 with the same generic
     * message (no account enumeration).</p>
     *
     * @return a map with the generic {@code message} (no token is disclosed)
     */
    @Transactional
    public Map<String, String> requestPasswordReset(String rawEmail) {
        String normalizedEmail = rawEmail.toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            return Map.of(
                    "message", "If an account exists for that email, a password reset link has been sent.");
        }

        String rawToken = generateResetToken();
        String tokenHash = hashToken(rawToken);

        // A new request invalidates all previously issued tokens for this user.
        passwordResetTokenRepository.deleteByUser_Id(user.getId());

        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRATION_MINUTES))
                .used(false)
                .build());

        // The raw token is deliberately not included in the response; it must be
        // delivered out-of-band (email) so only the account owner can reset.
        return Map.of(
                "message", "If an account exists for that email, a password reset link has been sent.");
    }

    /**
     * Confirms a password reset using the raw single-use token and sets the new password.
     *
     * @param rawToken raw unhashed reset token provided by the user
     * @param newPassword the new password to set
     * @return a map with generic success message
     */
    @Transactional
    public Map<String, String> confirmPasswordReset(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Reset token is required");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        String tokenHash = hashToken(rawToken);
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHashAndUsedFalse(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return Map.of("message", "Password has been successfully reset.");
    }

    private String generateResetToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] bytes = new byte[RESET_TOKEN_BYTE_LENGTH];
        secureRandom.nextBytes(bytes);
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

    // ─── helpers ────────────────────────────────────────────────────────────────

    private String generateUniqueUsername(String base) {
        String candidate = base;
        int counter = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + counter++;
        }
        return candidate;
    }

    private String generateSecurePassword() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Atomically create a brand-new Google account, tolerating concurrent first
     * logins for the same email or username.
     *
     * <p>If {@code save()} hits the unique-email constraint, the winning request
     * already committed the user — fetch and adopt it. If it hits the
     * unique-username constraint, a concurrent login claimed the candidate;
     * regenerate the username (the winning row is now visible) and retry,
     * bounded by {@link #MAX_USERNAME_RETRIES}.
     */
    private User createOrGetGoogleUser(String email, String firstName, String lastName, String baseUsername) {
        for (int attempt = 0; attempt < MAX_USERNAME_RETRIES; attempt++) {
            User candidate = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .username(generateUniqueUsername(baseUsername))
                    .password(passwordEncoder.encode(generateSecurePassword()))
                    .role(Role.ATTENDEE)
                    .emailVerified(true)
                    .authProvider("GOOGLE")
                    .build();

            try {
                return userRepository.save(candidate);
            } catch (DataIntegrityViolationException e) {
                Optional<User> existing = userRepository.findByEmail(email);
                if (existing.isPresent()) {
                    return existing.get();
                }
                // Username collision — retry with a fresh candidate next loop.
            }
        }

        throw new DataIntegrityViolationException(
                "Could not create Google account for " + email + " after "
                        + MAX_USERNAME_RETRIES + " attempts");
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .refreshToken(jwtTokenProvider.generateRefreshToken(user.getEmail()))
                .tokenType("Bearer")
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()
                || !jwtTokenProvider.validateToken(refreshToken)
                || !jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw new org.springframework.security.authentication.BadCredentialsException(
                    "Invalid refresh token");
        }

        if (tokenBlacklistService.isBlacklisted(refreshToken)) {
            // Allow reuse within the short grace window after rotation so
            // parallel requests racing on a just-rotated token succeed.
            if (tokenRefreshQueueHandler != null
                    && tokenRefreshQueueHandler.isWithinGracePeriod(refreshToken)) {
                // fall through and rotate again
            } else {
                throw new org.springframework.security.authentication.BadCredentialsException(
                        "Refresh token has been revoked");
            }
        }

        String email = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                        "User not found with email: " + email));

        if (user.getPasswordChangedAt() != null) {
            Date tokenIssuedAt = jwtTokenProvider.getIssuedAtDateFromToken(refreshToken);
            long tokenIssuedSec = tokenIssuedAt.getTime() / 1000;
            long passwordChangedSec = user.getPasswordChangedAt()
                    .atZone(ZoneId.systemDefault())
                    .toEpochSecond();
            if (tokenIssuedSec < passwordChangedSec) {
                throw new org.springframework.security.authentication.BadCredentialsException(
                        "Refresh token invalidated by password change");
            }
        }

        // Rotate: blacklist the presented refresh token, then mint a new pair.
        tokenBlacklistService.addToBlacklist(
                refreshToken, jwtTokenProvider.getExpirationDateFromToken(refreshToken));
        tokenRefreshQueueHandler.registerTokenRotation(refreshToken);

        String accessToken = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        return buildAuthResponse(user, accessToken);
    }
}
