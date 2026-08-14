package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.dto.response.ValidationResponse;
import com.sandeep.eventrabackend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.regex.Pattern;
import java.util.Map;

/**
 * Public availability-validation endpoints used by pre-submit form checks
 * (registration / profile screens) via {@code src/utils/validationApi.js}.
 *
 * <p>Both endpoints are anonymous-safe (permitted in {@link SecurityConfig})
 * so the checks can run before a user has a JWT. They report whether a value
 * is still available, returning {@code 400 Bad Request} for malformed input.
 */
@RestController
@RequestMapping("/api/validate")
@Tag(name = "Validation", description = "Public availability checks for email and username")
public class ValidationController {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Pattern USERNAME_PATTERN =
            Pattern.compile("^[a-zA-Z0-9_-]{3,50}$");

    private final UserRepository userRepository;

    public ValidationController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/email/{email}")
    @Operation(
            summary = "Check email availability",
            description = "Returns whether the given email is not already registered. " +
                          "Rejects malformed email addresses with 400 Bad Request."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Availability check succeeded",
                    content = @Content(schema = @Schema(implementation = ValidationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid email format",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> validateEmail(@PathVariable String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(buildError("Invalid email format", "/api/validate/email/" + email));
        }
        boolean available = !userRepository.existsByEmailIgnoreCase(email);
        return ResponseEntity.ok(ValidationResponse.builder()
                .available(available)
                .build());
    }

    @GetMapping("/username/{username}")
    @Operation(
            summary = "Check username availability",
            description = "Returns whether the given username is not already taken. " +
                          "Rejects malformed usernames with 400 Bad Request."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Availability check succeeded",
                    content = @Content(schema = @Schema(implementation = ValidationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid username format",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> validateUsername(@PathVariable String username) {
        if (username == null || !USERNAME_PATTERN.matcher(username).matches()) {
            return ResponseEntity.badRequest().body(buildError("Invalid username format", "/api/validate/username/" + username));
        }
        boolean available = !userRepository.existsByUsernameIgnoreCase(username);
        return ResponseEntity.ok(ValidationResponse.builder()
                .available(available)
                .build());
    }

    private ErrorResponse buildError(String message, String path) {
        return ErrorResponse.builder()
                .status(400)
                .error("Bad Request")
                .message(message)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[+]?[0-9\\s\\-()]{7,20}$");

    public static class PhoneRequest {
        private String phone;
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    @PostMapping("/phone")
    @Operation(summary = "Validate phone number format")
    public ResponseEntity<?> validatePhone(@RequestBody(required = false) PhoneRequest request) {
        if (request == null || request.getPhone() == null) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Phone number is required"));
        }
        String phone = request.getPhone();
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Phone number is invalid"));
        }
        return ResponseEntity.ok(Map.of("valid", true));
    }
}
