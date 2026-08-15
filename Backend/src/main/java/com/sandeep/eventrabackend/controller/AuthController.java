package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.request.SignupRequest;
import com.sandeep.eventrabackend.dto.request.GoogleAuthRequest;
import com.sandeep.eventrabackend.dto.request.LogoutRequest;
import com.sandeep.eventrabackend.dto.request.ReauthRequest;
import com.sandeep.eventrabackend.dto.request.ResetPasswordRequest;
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
                    Also sets HttpOnly `token` and `refreshToken` cookies for browser sessions.
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
    public static class PasswordResetRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    @PostMapping("/reset-password")
    @SecurityRequirements
    @Operation(summary = "Request password reset link")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request) {
        String email = request.getEmail();
        if (email == null || !org.springframework.util.StringUtils.hasText(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        return ResponseEntity.ok(Map.of("message", "Password reset link sent! Check your email."));
    }

    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return withAuthCookies(ResponseEntity.status(HttpStatus.CREATED), response);
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
                    or rely on the HttpOnly `token` / `refreshToken` cookies set on this response for browser sessions.
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
        return withAuthCookies(ResponseEntity.ok(), response);
    }

    @PostMapping("/refresh")
    @SecurityRequirements
    @Operation(summary = "Refresh access token",
            description = """
                    Exchanges a valid refresh token for a new access + refresh pair.
                    Prefers the HttpOnly `refreshToken` cookie; falls back to JSON body or Bearer
                    header for non-browser clients. The old refresh token is blacklisted.
                    """)
    public ResponseEntity<?> refresh(
            @RequestBody(required = false) com.sandeep.eventrabackend.dto.request.RefreshTokenRequest body,
            HttpServletRequest request) {
        try {
            // Cookie-first for browser clients; body/Bearer kept for mobile compatibility
            String refreshToken = authCookieHelper.extractRefreshToken(request);
            if (refreshToken == null || refreshToken.isBlank()) {
                refreshToken = body != null ? body.getRefreshToken() : null;
            }
            if (refreshToken == null || refreshToken.isBlank()) {
                String auth = request.getHeader("Authorization");
                if (auth != null && auth.startsWith("Bearer ")) {
                    refreshToken = auth.substring(7).trim();
                }
            }
            AuthResponse response = authService.refresh(refreshToken);
            return withAuthCookies(ResponseEntity.ok(), response);
        } catch (Exception ex) {
            ErrorResponse error = ErrorResponse.builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .error("Unauthorized")
                    .message("No valid session. Please log in.")
                    .path(request.getRequestURI())
                    .timestamp(LocalDateTime.now())
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .headers(clearAuthCookies())
                    .body(error);
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

    @PostMapping("/google")
    @SecurityRequirements
    @Operation(
        summary = "Login/Register using Google",
        description = """
                Authenticates user using Google OAuth token.
                
                If the user does not exist,
                a new account is automatically created.
                
                Returns JWT token on success.
                Also sets HttpOnly `token` and `refreshToken` cookies for browser sessions.
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

    return withAuthCookies(ResponseEntity.ok(), response);
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
                    optional refresh token (HttpOnly cookie or request body), then clears the
                    access + refresh auth cookies.
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
        String refreshToken = authCookieHelper.extractRefreshToken(request);
        if (!StringUtils.hasText(refreshToken) && body != null) {
            refreshToken = body.getRefreshToken();
        }

        ResponseEntity.BodyBuilder responseBuilder = ResponseEntity.ok();
        try {
            if (StringUtils.hasText(token) || StringUtils.hasText(refreshToken)) {
                authService.logout(token, refreshToken);
            }
        } catch (RuntimeException ignored) {
            // Best-effort blacklist; cookie clear must still proceed.
        } finally {
            responseBuilder.headers(clearAuthCookies());
        }
        return responseBuilder.body("Logged out successfully");
    }

    private ResponseEntity<AuthResponse> withAuthCookies(
            ResponseEntity.BodyBuilder builder, AuthResponse response) {
        HttpHeaders headers = new HttpHeaders();
        authCookieHelper.apply(headers, authCookieHelper.createAuthCookie(response.getToken()));
        if (StringUtils.hasText(response.getRefreshToken())) {
            authCookieHelper.apply(headers,
                    authCookieHelper.createRefreshCookie(response.getRefreshToken()));
        }
        return builder.headers(headers).body(response);
    }

    private HttpHeaders clearAuthCookies() {
        HttpHeaders headers = new HttpHeaders();
        authCookieHelper.apply(headers, authCookieHelper.clearAuthCookie());
        authCookieHelper.apply(headers, authCookieHelper.clearRefreshCookie());
        return headers;
    }

    private static String extractBearerToken(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7).trim();
            return token.isEmpty() ? null : token;
        }
        return null;
    }
}
