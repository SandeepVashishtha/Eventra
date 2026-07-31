package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.request.SignupRequest;
import com.sandeep.eventrabackend.dto.response.AuthResponse;
import com.sandeep.eventrabackend.exception.PasswordMismatchException;
import com.sandeep.eventrabackend.exception.UserAlreadyExistsException;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
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
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleAuthService googleAuthService;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthService(UserRepository userRepository,
                   PasswordEncoder passwordEncoder,
                   AuthenticationManager authenticationManager,
                   JwtTokenProvider jwtTokenProvider,
                   GoogleAuthService googleAuthService,
                   TokenBlacklistService tokenBlacklistService) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtTokenProvider = jwtTokenProvider;
    this.googleAuthService = googleAuthService;
    this.tokenBlacklistService = tokenBlacklistService;
}

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // 1. Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("Password and confirm password do not match");
        }

        // 2. Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
                    "An account with email '" + request.getEmail() + "' already exists");
        }

        // 3. Derive username from email (local part) and ensure uniqueness
        String baseUsername = request.getEmail().split("@")[0].toLowerCase();
        String username = generateUniqueUsername(baseUsername);

        // 4. Persist the user
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase())
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CLIENT)
                .build();

        user = userRepository.save(user);

        // 5. Issue JWT
        String token = jwtTokenProvider.generateToken(user.getEmail());

        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);

        // Reload user for profile info
        User user = userRepository
                .findByEmailOrUsername(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow();

        return buildAuthResponse(user, token);
    }

public AuthResponse googleLogin(GoogleAuthRequest request) {

    try {

        GoogleIdToken.Payload payload =
                googleAuthService.verifyToken(request.getToken());

        String email = payload.getEmail();

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

            user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email.toLowerCase())
                    .username(username)
                    .password(
                            passwordEncoder.encode(
                                    UUID.randomUUID().toString()
                            )
                    )
                    .role(Role.CLIENT)
                    .build();

            user = userRepository.save(user);
        }

        String token =
                jwtTokenProvider.generateToken(user.getEmail());

        return buildAuthResponse(user, token);

    } catch (Exception e) {

        throw new RuntimeException(
                "Google authentication failed"
        );
    }
}

    public void logout(String token) {
        java.util.Date expiration = jwtTokenProvider.getExpirationDateFromToken(token);
        tokenBlacklistService.addToBlacklist(token, expiration);
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
                .tokenType("Bearer")
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}

