package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.request.SignupRequest;
import com.sandeep.eventrabackend.dto.request.GoogleAuthRequest;
import com.sandeep.eventrabackend.dto.request.LogoutRequest;
import com.sandeep.eventrabackend.dto.request.ReauthRequest;
import com.sandeep.eventrabackend.dto.request.ResetPasswordRequest;
import com.sandeep.eventrabackend.dto.request.ConfirmResetPasswordRequest;
import com.sandeep.eventrabackend.dto.response.AuthResponse;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.security.AuthCookieHelper;
import com.sandeep.eventrabackend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Register and login endpoints for Eventra users")
public class AuthController {

    private final AuthService authService;
    private final AuthCookieHelper authCookieHelper;

    public AuthController(AuthService authService, AuthCookieHelper authCookieHelper) {
        this.authService = authService;
        this.authCookieHelper = authCookieHelper;
    }

    // ─── SIGNUP ─────────────────────────────────────────────────────────────────

    @PostMapping("/signup")
    @SecurityRequirements   // no auth needed for this endpoint
    @Operation(
            summary = "Register a new user account",
            description = """
                    Creates a new Eventra user account.
                    
                    **Fields required:**
                    - `firstName`, `lastName` — 2–50 characters each
                    - `email` — valid email, must be unique
                    - `password` — minimum 8 characters
                    - `confirmPassword` — must exactly match `password`
                    
                    On success returns a **JWT token** that can be used immediately.
                    Also sets an HttpOnly `token` cookie for browser sessions.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Account created successfully",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error or passwords don't match",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Email already registered",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "429", description = "Signup rate limit exceeded",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return withAuthCookie(ResponseEntity.status(HttpStatus.CREATED), response);
    }

    // ─── LOGIN ──────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    @SecurityRequirements   // no auth needed for this endpoint
    @Operation(
            summary = "Login with username/email and password",
            description = """
                    Authenticates an existing user and returns a JWT token.
                    
                    **Accepts either:**
                    - Email address  (e.g. `john@example.com`)
                    - Username       (e.g. `john_doe`)
                    
                    Use the returned `token` as `Authorization: Bearer <token>` for protected endpoints,
                    or rely on the HttpOnly `token` cookie set on this response for browser sessions.
                    """
    )

   
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error — missing fields",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "429", description = "Login rate limit exceeded",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return withAuthCookie(ResponseEntity.ok(), response);
    }

    @PostMapping("/refresh")
    @SecurityRequirements
    @Operation(summary = "Refresh access token",
            description = "Exchanges a valid refresh token for a new access + refresh pair. The old refresh token is blacklisted.")
    public ResponseEntity<?> refresh(
            @RequestBody(required = false) com.sandeep.eventrabackend.dto.request.RefreshTokenRequest body,
            HttpServletRequest request) {
        try {
            String refreshToken = body != null ? body.getRefreshToken() : null;
            AuthResponse response = authService.refresh(refreshToken);
            return withAuthCookie(ResponseEntity.ok(), response);
        } catch (Exception ex) {
            ErrorResponse error = ErrorResponse.builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .error("Unauthorized")
                    .message("No valid session. Please log in.")
                    .path(request.getRequestURI())
                    .timestamp(LocalDateTime.now())
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/reset-password")
    @SecurityRequirements   // no auth needed for this endpoint
    @Operation(
            summary = "Request a password reset",
            description = """
                    Accepts an email address and issues a short-lived, single-use password
                    reset token for the matching account (if one exists).
                    
                    The raw token is never returned in the response; it must be delivered
                    out-of-band (e.g. emailed as a reset link) so only the account owner
                    can complete the reset.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reset link dispatched (or account not found — same response to avoid enumeration)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error — missing/invalid email",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.requestPasswordReset(request.getEmail()));
    }

    @PostMapping("/reset-password/confirm")
    @SecurityRequirements   // no auth needed for this endpoint
    @Operation(
            summary = "Confirm password reset and set new password",
            description = """
                    Accepts a raw, single-use password reset token and a new password.
                    If the token is valid, unexpired, and unused, updates the user's password
                    and marks the token as used.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid, expired, or used reset token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Map<String, String>> confirmResetPassword(
            @Valid @RequestBody ConfirmResetPasswordRequest request) {
        return ResponseEntity.ok(authService.confirmPasswordReset(request.getToken(), request.getNewPassword()));
    }

    @PostMapping("/google")
    @SecurityRequirements
    @Operation(
        summary = "Login/Register using Google",
        description = """
                Authenticates user using Google OAuth token.
                
                If the user does not exist,
                a new account is automatically created.
                
                Returns JWT token on success.
                Also sets an HttpOnly `token` cookie for browser sessions.
                """
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Google login successful",
                content = @Content(schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid Google token",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
})
public ResponseEntity<AuthResponse> googleLogin(
        @Valid @RequestBody GoogleAuthRequest request
) {

    AuthResponse response = authService.googleLogin(request);

    return withAuthCookie(ResponseEntity.ok(), response);
}

    @PostMapping("/reauth")
    @Operation(summary = "Re-authenticate the current user with their password")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password verified"),
            @ApiResponse(responseCode = "401", description = "Incorrect password or unauthenticated",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Map<String, Object>> reauth(
            @Valid @RequestBody ReauthRequest request,
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !StringUtils.hasText(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            authService.reauth(authentication.getName(), request.getPassword());
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Incorrect password"));
        }
    }

    @PostMapping("/logout")
    @Operation(
            summary = "Logout user and invalidate token",
            description = """
                    Blacklists the access JWT (Authorization header or HttpOnly cookie) and an
                    optional refresh token from the request body, then clears the auth cookie.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Logged out successfully"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<String> logout(
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            @RequestBody(required = false) LogoutRequest body,
            HttpServletRequest request) {
        String token = extractBearerToken(bearerToken);
        if (token == null) {
            token = authCookieHelper.extractToken(request);
        }

        String refreshToken = body != null ? body.getRefreshToken() : null;

        ResponseEntity.BodyBuilder responseBuilder = ResponseEntity.ok();
        try {
            if (StringUtils.hasText(token) || StringUtils.hasText(refreshToken)) {
                authService.logout(token, refreshToken);
            }
        } catch (RuntimeException ignored) {
            // Best-effort blacklist; cookie clear must still proceed.
        } finally {
            responseBuilder.header(HttpHeaders.SET_COOKIE, authCookieHelper.clearAuthCookie().toString());
        }
        return responseBuilder.body("Logged out successfully");
    }

    private ResponseEntity<AuthResponse> withAuthCookie(
            ResponseEntity.BodyBuilder builder, AuthResponse response) {
        return builder
                .header(HttpHeaders.SET_COOKIE,
                        authCookieHelper.createAuthCookie(response.getToken()).toString())
                .body(response);
    }

    private static String extractBearerToken(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7).trim();
            return token.isEmpty() ? null : token;
        }
        return null;
    }
}
