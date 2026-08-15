package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.ChangePasswordRequest;
import com.sandeep.eventrabackend.dto.request.PreferencesUpdateRequest;
import com.sandeep.eventrabackend.dto.request.UserProfileUpdateRequest;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.dto.response.MyRegisteredEventResponse;
import com.sandeep.eventrabackend.dto.response.UserProfileResponse;
import com.sandeep.eventrabackend.dto.response.UserAchievementsResponse;
import com.sandeep.eventrabackend.exception.UserAlreadyExistsException;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.sandeep.eventrabackend.dto.response.UserProfileResponse;
import com.sandeep.eventrabackend.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for authenticated user data")
public class UserController {

    private static final Set<String> ALLOWED_PREFERENCE_KEYS = Set.of("theme", "notifications");
    private static final int MAX_PREFERENCES_BYTES = 4096;
    private static final ObjectMapper PREFERENCES_MAPPER = new ObjectMapper();

    /** Canonical username format enforced by ValidationController (#18842). */
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{3,50}$");

    private final EventService eventService;
    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(
            EventService eventService,
            UserService userService,
            UserRepository userRepository
    ) {
        this.eventService = eventService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    @Operation(
            summary = "Get authenticated user profile",
            description = "Returns the basic profile details for the currently authenticated JWT user.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User profile fetched successfully",
                    content = @Content(schema = @Schema(implementation = UserProfileResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<UserProfileResponse> getUserProfile(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + email));

        return ResponseEntity.ok(mapToUserProfileResponse(user));
    }

    @PutMapping("/profile")
    @Operation(
            summary = "Update authenticated user profile",
            description = "Updates the first name, last name, and username for the currently authenticated JWT user.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User profile updated successfully",
                    content = @Content(schema = @Schema(implementation = UserProfileResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Username already exists",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @Valid @RequestBody UserProfileUpdateRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Normalize the username exactly like signup (trim + lowercase) so
        // uniqueness, lookups and login normalization stay consistent (#18842).
        String normalizedUsername = request.getUsername().trim().toLowerCase();

        // Case-insensitive uniqueness on change, plus the same format validation
        // ValidationController applies, so near-duplicate and malformed usernames
        // can never be stored. Skipped when the username is unchanged so existing
        // signup-derived usernames can still be kept while editing other fields.
        if (!normalizedUsername.equals(user.getUsername())) {
            if (!USERNAME_PATTERN.matcher(normalizedUsername).matches()) {
                throw new IllegalArgumentException(
                        "Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens");
            }
            if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
                throw new UserAlreadyExistsException("Username already exists: " + normalizedUsername);
            }
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(normalizedUsername);
        user.setProfileHeadline(request.getProfileHeadline());
        user.setLinkedinUrl(normalizeBlankToNull(request.getLinkedinUrl()));
        user.setGithubUrl(normalizeBlankToNull(request.getGithubUrl()));

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(mapToUserProfileResponse(updatedUser));
    }

    private static String normalizeBlankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    @GetMapping("/my-events")
    @Operation(
            summary = "Get the authenticated user's registered events",
            description = "Returns event registrations for the currently authenticated JWT user.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Registered events fetched successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = MyRegisteredEventResponse.class)))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<List<MyRegisteredEventResponse>> getMyRegisteredEvents(
            Authentication authentication) {

        return ResponseEntity.ok(eventService.getRegisteredEventsForUser(authentication.getName()));
    }

    @GetMapping("/achievements")
    @Operation(
            summary = "Get authenticated user achievements",
            description = "Returns achievement progress for the currently authenticated JWT user.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<UserAchievementsResponse> getUserAchievements(Authentication authentication) {
        return ResponseEntity.ok(eventService.getAchievementsForUser(authentication.getName()));
    }

    @PutMapping("/change-password")
    @Operation(
            summary = "Change authenticated user password",
            description = "Changes the password for the currently authenticated user. All existing tokens will be invalidated.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password changed successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error or passwords don't match",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Password changed successfully. Please login again.");
    }

    @GetMapping("/preferences")
    @Operation(
            summary = "Get authenticated user preferences",
            description = "Returns the stored preferences (e.g. theme) for the currently authenticated JWT user.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User preferences fetched successfully",
                    content = @Content(schema = @Schema(example = "{ \"theme\": \"dark\" }"))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<Map<String, Object>> getUserPreferences(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + authentication.getName()));
        return ResponseEntity.ok(user.getPreferences() != null ? user.getPreferences() : Map.of());
    }

    @PutMapping("/preferences")
    @Operation(
            summary = "Update authenticated user preferences",
            description = "Merges the provided preferences (e.g. { \"theme\": \"dark\" }) into the authenticated user's stored preferences.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User preferences updated successfully",
                    content = @Content(schema = @Schema(example = "{ \"theme\": \"dark\" }"))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Validation error (e.g. invalid theme value)",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<Map<String, Object>> updateUserPreferences(
            @Valid @RequestBody PreferencesUpdateRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + authentication.getName()));

        Map<String, Object> incoming = request.getPreferences();
        if (incoming == null || incoming.isEmpty()) {
            return ResponseEntity.ok(user.getPreferences() != null ? user.getPreferences() : Map.of());
        }

        for (String key : incoming.keySet()) {
            if (!ALLOWED_PREFERENCE_KEYS.contains(key)) {
                throw new IllegalArgumentException(
                        "Unknown preference key: " + key + ". Allowed keys: theme, notifications");
            }
        }

        String theme = (String) incoming.get("theme");
        if (theme != null && !Set.of("light", "dark", "system").contains(theme)) {
            throw new IllegalArgumentException("Invalid theme value: " + theme + ". Allowed values are light, dark, system.");
        }

        Object notifications = incoming.get("notifications");
        if (notifications != null && !(notifications instanceof Map)) {
            throw new IllegalArgumentException("notifications preference must be an object");
        }

        Map<String, Object> merged = new HashMap<>(user.getPreferences() != null ? user.getPreferences() : Map.of());
        merged.putAll(incoming);
        enforcePreferencesSizeLimit(merged);

        user.setPreferences(merged);

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser.getPreferences());
    }

    private static void enforcePreferencesSizeLimit(Map<String, Object> preferences) {
        try {
            int size = PREFERENCES_MAPPER.writeValueAsBytes(preferences).length;
            if (size > MAX_PREFERENCES_BYTES) {
                throw new IllegalArgumentException(
                        "Preferences payload exceeds maximum size of " + MAX_PREFERENCES_BYTES + " bytes");
            }
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Invalid preferences payload");
        }
    }

    private UserProfileResponse mapToUserProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .profileHeadline(user.getProfileHeadline())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .preferences(user.getPreferences())
                .build();
    }
}
