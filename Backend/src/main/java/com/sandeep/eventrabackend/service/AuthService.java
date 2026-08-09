package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.request.SignupRequest;
import com.sandeep.eventrabackend.dto.response.AuthResponse;
import com.sandeep.eventrabackend.exception.PasswordMismatchException;
import com.sandeep.eventrabackend.exception.UserAlreadyExistsException;
import com.sandeep.eventrabackend.exception.InvalidGoogleTokenException;
import com.sandeep.eventrabackend.model.PasswordResetToken;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.PasswordResetTokenRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.security.JwtTokenProvider;
import com.sandeep.eventrabackend.security.TokenBlacklistService;
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
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;

@Service
public class AuthService {

    private static final long RESET_TOKEN_EXPIRATION_MINUTES = 30;
    private static final int RESET_TOKEN_BYTE_LENGTH = 32;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleAuthService googleAuthService;
    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthService(UserRepository userRepository,
                   PasswordEncoder passwordEncoder,
                   AuthenticationManager authenticationManager,
                   JwtTokenProvider jwtTokenProvider,
                   GoogleAuthService googleAuthService,
                   TokenBlacklistService tokenBlacklistService,
                   PasswordResetTokenRepository passwordResetTokenRepository) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtTokenProvider = jwtTokenProvider;
    this.googleAuthService = googleAuthService;
    this.tokenBlacklistService = tokenBlacklistService;
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

        // 4. Persist the user
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ATTENDEE)
                .build();

        user = userRepository.save(user);

        // 5. Issue JWT
        String token = jwtTokenProvider.generateToken(user.getEmail());

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
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);

        // Reload user for profile info
        User user = userRepository
                .findByEmailOrUsername(identifier, identifier)
                .orElseThrow();

        return buildAuthResponse(user, token);
    }

public AuthResponse googleLogin(GoogleAuthRequest request) {

    try {

        GoogleIdToken.Payload payload =
                googleAuthService.verifyToken(request.getToken());

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

       String firstName =
        (String) payload.get("given_name");

String lastName =
        (String) payload.get("family_name");

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

            String baseUsername =
                    email.split("@")[0].toLowerCase();

            String username =
                    generateUniqueUsername(baseUsername);

            SecureRandom secureRandom = new SecureRandom();
            byte[] randomBytes = new byte[32];
            secureRandom.nextBytes(randomBytes);
            String securePassword = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

            user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email.toLowerCase())
                    .username(username)
                    .password(passwordEncoder.encode(securePassword))
                    .role(Role.ATTENDEE)
                    .build();

            user = userRepository.save(user);
        }

        String token =
                jwtTokenProvider.generateToken(user.getEmail());

        return buildAuthResponse(user, token);

    } catch (InvalidGoogleTokenException e) {
        throw e;
    } catch (Exception e) {
        throw new RuntimeException("Google authentication failed", e);
    }
}

    public void logout(String token) {
        java.util.Date expiration = jwtTokenProvider.getExpirationDateFromToken(token);
        tokenBlacklistService.addToBlacklist(token, expiration);
    }

    // ─── password reset ────────────────────────────────────────────────────────

    /**
     * Initiates a password reset for the given email.
     *
     * <p>A cryptographically random, short-lived token is generated and its
     * SHA-256 hash is persisted so the raw token can be exchanged for a new
     * password exactly once. The raw token is returned in the response because
     * the backend has no email transport configured; deployments with a mailer
     * should send it as a reset link instead and drop it from the response.</p>
     *
     * <p>For privacy, unknown emails still return HTTP 200 with the same generic
     * message (no account enumeration).</p>
     *
     * @return a map with {@code message} and, when the account exists,
     *         {@code resetToken} (raw token for the next step)
     */
    @Transactional
    public Map<String, String> forgotPassword(String rawEmail) {
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

        return Map.of(
                "message", "If an account exists for that email, a password reset link has been sent.",
                "resetToken", rawToken);
    }

    /**
     * Validates the reset token and sets a new password.
     *
     * <p>Invalidates the token (single-use) and marks the password as changed so
     * any previously issued access/refresh tokens are rejected by the refresh
     * flow's password-changed check.</p>
     */
    @Transactional
    public void resetPassword(String rawToken, String newPassword, String confirmPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new PasswordMismatchException("Password and confirm password do not match");
        }
        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHashAndUsedFalse(hashToken(rawToken))
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        // Token is single-use and all outstanding reset requests are invalidated.
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        passwordResetTokenRepository.deleteByUser_Id(user.getId());
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
            throw new org.springframework.security.authentication.BadCredentialsException(
                    "Refresh token has been revoked");
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

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        return buildAuthResponse(user, accessToken);
    }
}

