package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.PushSubscriptionRequest;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.PushSubscriptionRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for PushSubscriptionService endpoint validation.
 * Stored endpoints are later dispatched to by the server, so they must never
 * be usable as an SSRF vector (#16257).
 */
@ExtendWith(MockitoExtension.class)
class PushSubscriptionServiceTest {

    @Mock
    private PushSubscriptionRepository pushSubscriptionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PushSubscriptionService pushSubscriptionService;

    private User user;
    private PushSubscriptionRequest request;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
        request = new PushSubscriptionRequest();
        request.setKeys(Map.of("p256dh", "base64p256", "auth", "base64auth"));
    }

    @Test
    @DisplayName("Valid public https WebPush endpoint is accepted")
    void validPublicHttpsEndpointIsAccepted() {
        request.setEndpoint("https://fcm.googleapis.com/fcm/send/abc123");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(pushSubscriptionRepository.findByUser_IdAndEndpoint(any(), any())).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("http endpoint is rejected")
    void httpEndpointIsRejected() {
        request.setEndpoint("http://push.example.com/endpoint");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("Non-443 https port is rejected")
    void nonStandardPortIsRejected() {
        request.setEndpoint("https://push.example.com:8080/endpoint");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("Loopback endpoint is rejected")
    void localhostEndpointIsRejected() {
        request.setEndpoint("https://localhost:443/endpoint");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("Cloud metadata IP literal is rejected")
    void metadataIpLiteralIsRejected() {
        request.setEndpoint("https://169.254.169.254/latest/meta-data/");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("Private IP literal is rejected")
    void privateIpLiteralIsRejected() {
        request.setEndpoint("https://192.168.1.5/admin");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("IPv6 loopback literal is rejected")
    void ipv6LoopbackIsRejected() {
        request.setEndpoint("https://[::1]/endpoint");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("Bare internal hostname without a dot is rejected")
    void bareHostnameIsRejected() {
        request.setEndpoint("https://internal-service/endpoint");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("Hostname pointing at an internal domain suffix is rejected")
    void internalDomainSuffixIsRejected() {
        request.setEndpoint("https://admin.internal/api");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("Endpoint with userinfo is rejected")
    void userInfoIsRejected() {
        request.setEndpoint("https://evil@push.example.com/endpoint");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }

    @Test
    @DisplayName("Missing push keys are rejected before endpoint validation")
    void missingKeysAreRejected() {
        request.setEndpoint("https://fcm.googleapis.com/fcm/send/abc123");
        request.setKeys(null);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> pushSubscriptionService.subscribe("user@example.com", request));
    }
}
