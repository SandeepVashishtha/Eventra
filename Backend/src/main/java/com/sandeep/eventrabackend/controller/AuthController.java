package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.request.SignupRequest;
import com.sandeep.eventrabackend.dto.request.GoogleAuthRequest;
import com.sandeep.eventrabackend.dto.response.AuthResponse;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Register and login endpoints for Eventra users")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
                    
                    Use the returned `token` as `Authorization: Bearer <token>` for protected endpoints.
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
        return ResponseEntity.ok(response);
    }

        @PostMapping("/refresh")
        @GetMapping("/refresh")
        @SecurityRequirements
        @Operation(summary = "Refresh access token",
                        description = "Currently returns 401 — refresh-token flow not yet implemented.")
        public ResponseEntity<ErrorResponse> refresh(HttpServletRequest request) {
                ErrorResponse error = ErrorResponse.builder()
                                .status(HttpStatus.UNAUTHORIZED.value())
                                .error("Unauthorized")
                                .message("No valid session. Please log in.")
                                .path(request.getRequestURI())
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
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

    return ResponseEntity.ok(response);
}

    @PostMapping("/logout")
    @Operation(
            summary = "Logout user and invalidate token",
            description = """
                    Blacklists the provided JWT token so it cannot be used again until it expires.
                    
                    Requires `Authorization: Bearer <token>` header.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Logged out successfully"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid token",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            authService.logout(token);
            return ResponseEntity.ok("Logged out successfully");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token format");
    }
}
