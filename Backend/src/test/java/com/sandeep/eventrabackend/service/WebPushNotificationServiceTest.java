package com.sandeep.eventrabackend.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.InetAddress;
import java.net.URISyntaxException;
import java.net.UnknownHostException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Dispatch-time SSRF guard tests (#18841). Subscription-time validation checks
 * the endpoint string only; the sender re-resolves the stored hostname later, so
 * a DNS-rebinding change after subscription must be rejected at dispatch time.
 */
class WebPushNotificationServiceTest {

    private final WebPushNotificationService service = new WebPushNotificationService();

    @Test
    @DisplayName("dispatch rejects an endpoint that resolved to the cloud metadata address (DNS rebinding)")
    void metadataIpIsRejectedAtDispatch() {
        assertThrows(IllegalArgumentException.class,
                () -> service.validateEndpointForDispatch("https://169.254.169.254/latest/meta-data/"));
    }

    @Test
    @DisplayName("dispatch rejects a loopback endpoint")
    void loopbackIsRejectedAtDispatch() {
        assertThrows(IllegalArgumentException.class,
                () -> service.validateEndpointForDispatch("https://127.0.0.1/admin"));
    }

    @Test
    @DisplayName("dispatch rejects a localhost hostname even though subscribe accepted the string")
    void localhostHostnameIsRejectedAtDispatch() throws Exception {
        assertThrows(IllegalArgumentException.class,
                () -> service.validateEndpointForDispatch("https://localhost/push"));
    }

    @Test
    @DisplayName("dispatch rejects a non-https endpoint")
    void httpEndpointIsRejectedAtDispatch() {
        assertThrows(IllegalArgumentException.class,
                () -> service.validateEndpointForDispatch("http://push.example.com/endpoint"));
    }

    @Test
    @DisplayName("a host rebound to a link-local address is rejected at dispatch (#18841)")
    void resolvedLinkLocalAddressIsRejected() throws UnknownHostException {
        InetAddress[] rebound = {InetAddress.getByName("169.254.169.254")};
        assertThrows(IllegalArgumentException.class,
                () -> WebPushNotificationService.rejectNonPublicResolvedAddresses(rebound));
    }

    @Test
    @DisplayName("a host rebound to CGNAT space is rejected at dispatch (#18841)")
    void resolvedCgnatAddressIsRejected() throws UnknownHostException {
        InetAddress[] rebound = {InetAddress.getByName("100.64.0.1")};
        assertThrows(IllegalArgumentException.class,
                () -> WebPushNotificationService.rejectNonPublicResolvedAddresses(rebound));
    }

    @Test
    @DisplayName("a host rebounding to one private address among public ones is rejected (#18841)")
    void anyPrivateAddressRejectsTheWholeHost() throws UnknownHostException {
        InetAddress[] rebound = {InetAddress.getByName("8.8.8.8"), InetAddress.getByName("192.168.1.5")};
        assertThrows(IllegalArgumentException.class,
                () -> WebPushNotificationService.rejectNonPublicResolvedAddresses(rebound));
    }

    @Test
    @DisplayName("a host resolving only to public addresses passes the dispatch check")
    void publicResolvedAddressIsAccepted() throws UnknownHostException {
        InetAddress[] addresses = {InetAddress.getByName("8.8.8.8")};
        assertDoesNotThrow(() -> WebPushNotificationService.rejectNonPublicResolvedAddresses(addresses));
    }

    @Test
    @DisplayName("sendPushNotification returns false for a private endpoint without touching the network")
    void sendRejectsPrivateEndpoint() throws URISyntaxException, UnknownHostException {
        PushSubscriptionDto subscription = new PushSubscriptionDto();
        subscription.setEndpoint("https://192.168.1.5/admin");

        assertFalse(service.sendPushNotification(subscription, "payload"));
    }
}
