package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Locale;

@Service
public class WebPushNotificationService {

    private static final int MAX_ENDPOINT_LENGTH = 2048;

    private final HttpClient httpClient;

    public WebPushNotificationService() {
        // Never follow redirects: a 3xx pointing at an internal address must not
        // be followed by the sender (#18841).
        this(HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build());
    }

    WebPushNotificationService(HttpClient httpClient) {
        this.httpClient = httpClient;
    }

    public boolean sendPushNotification(PushSubscriptionDto subscription, String payload) {
        try {
            validateEndpointForDispatch(subscription.getEndpoint());

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(subscription.getEndpoint()))
                .header("Content-Type", "application/octet-stream")
                // Custom encryption wrapper headers
                .header("Encryption", "salt=mock_salt_value")
                .header("Crypto-Key", "dh=mock_crypto_key")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 201 || response.statusCode() == 200;
        } catch (Exception e) {
            System.err.println("WebPush dispatch notification failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Dispatch-time SSRF guard (#18841). Subscription-time validation only checks
     * the endpoint string, but the sender re-resolves the stored hostname when it
     * actually sends the push. A DNS-rebinding change after subscription could
     * therefore point a previously public host at a loopback/private/link-local
     * (cloud metadata) address. Re-validate the endpoint at dispatch time and
     * reject it unless every resolved address is public.
     */
    void validateEndpointForDispatch(String endpoint) throws URISyntaxException, UnknownHostException {
        String host = parseEndpoint(endpoint);
        rejectNonPublicHost(host);
        rejectNonPublicResolvedAddresses(InetAddress.getAllByName(host));
    }

    private String parseEndpoint(String endpoint) {
        if (endpoint == null || endpoint.isBlank()) {
            throw new IllegalArgumentException("Push subscription endpoint is required");
        }
        if (endpoint.length() > MAX_ENDPOINT_LENGTH) {
            throw new IllegalArgumentException(
                    "Push subscription endpoint exceeds " + MAX_ENDPOINT_LENGTH + " characters");
        }

        URI uri;
        try {
            uri = new URI(endpoint);
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("Push subscription endpoint is not a valid URL");
        }
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new IllegalArgumentException("Push subscription endpoint must use the https scheme");
        }
        if (uri.getUserInfo() != null) {
            throw new IllegalArgumentException("Push subscription endpoint must not contain user information");
        }
        int port = uri.getPort();
        if (port != -1 && port != 443) {
            throw new IllegalArgumentException("Push subscription endpoint must use the default https port (443)");
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Push subscription endpoint must include a host");
        }
        return host;
    }

    /**
     * Mirrors the subscription-time string checks so a hostname that is obviously
     * internal (localhost, bare hostnames, reserved suffixes, private IP literals)
     * is rejected even before DNS is consulted.
     */
    private void rejectNonPublicHost(String host) {
        String h = host.toLowerCase(Locale.ROOT);
        if ("localhost".equals(h) || h.endsWith(".localhost")) {
            throw new IllegalArgumentException("Push subscription endpoint must not point at localhost");
        }
        if (h.endsWith(".local") || h.endsWith(".internal")
                || h.endsWith(".home") || h.endsWith(".lan") || h.endsWith(".localdomain")) {
            throw new IllegalArgumentException("Push subscription endpoint must use a public hostname");
        }
        if (!h.contains(".")) {
            throw new IllegalArgumentException("Push subscription endpoint must use a public hostname");
        }
        if (isIpv4Literal(h) && isNonPublicIpv4(h)) {
            throw new IllegalArgumentException("Push subscription endpoint must not point at a private IP address");
        }
    }

    /**
     * Rejects a resolved endpoint host that lands on loopback, link-local (which
     * covers 169.254.x.x cloud metadata), site-local, multicast, any-local or
     * CGNAT space — the actual DNS-rebinding defence at the moment of sending.
     */
    static void rejectNonPublicResolvedAddresses(InetAddress[] addresses) {
        for (InetAddress address : addresses) {
            if (!isPublicAddress(address)) {
                throw new IllegalArgumentException(
                        "Push subscription endpoint resolves to a non-public address: " + address.getHostAddress());
            }
        }
    }

    private static boolean isPublicAddress(InetAddress address) {
        if (address.isAnyLocalAddress() || address.isLoopbackAddress()
                || address.isLinkLocalAddress() || address.isSiteLocalAddress()
                || address.isMulticastAddress()) {
            return false;
        }
        byte[] bytes = address.getAddress();
        int a;
        int b;
        if (address instanceof Inet6Address && isIpv4Mapped(bytes)) {
            a = bytes[12] & 0xff;
            b = bytes[13] & 0xff;
        } else if (address instanceof Inet4Address) {
            a = bytes[0] & 0xff;
            b = bytes[1] & 0xff;
        } else {
            return true;
        }
        // 100.64.0.0/10 CGNAT space is not flagged by InetAddress's built-ins.
        return !(a == 100 && b >= 64 && b <= 127);
    }

    private static boolean isIpv4Mapped(byte[] bytes) {
        for (int i = 0; i < 10; i++) {
            if (bytes[i] != 0) {
                return false;
            }
        }
        return bytes[10] == (byte) 0xff && bytes[11] == (byte) 0xff;
    }

    private boolean isIpv4Literal(String host) {
        if (host.startsWith(".") || host.endsWith(".")) {
            return false;
        }
        String[] parts = host.split("\\.");
        if (parts.length != 4) {
            return false;
        }
        for (String part : parts) {
            if (part.isEmpty() || part.length() > 3) {
                return false;
            }
            for (int i = 0; i < part.length(); i++) {
                if (!Character.isDigit(part.charAt(i))) {
                    return false;
                }
            }
            int value = Integer.parseInt(part);
            if (value > 255) {
                return false;
            }
        }
        return true;
    }

    private boolean isNonPublicIpv4(String host) {
        int[] octets = new int[4];
        String[] parts = host.split("\\.");
        for (int i = 0; i < 4; i++) {
            octets[i] = Integer.parseInt(parts[i]);
        }
        int a = octets[0], b = octets[1], c = octets[2], d = octets[3];
        if (a == 100 && b >= 64 && b <= 127) return true;           // 100.64.0.0/10 CGNAT
        if (a == 192 && b == 0 && c == 2) return true;               // 192.0.2.0/24 TEST-NET-1
        if (a == 198 && b == 51 && c == 100) return true;            // 198.51.100.0/24 TEST-NET-2
        if (a == 203 && b == 0 && c == 113) return true;             // 203.0.113.0/24 TEST-NET-3
        if (a == 0 || a == 10) return true;                       // 0.0.0.0/8, 10.0.0.0/8
        if (a == 127) return true;                                 // 127.0.0.0/8 loopback
        if (a == 169 && b == 254) return true;                     // 169.254.0.0/16 incl. metadata
        if (a == 172 && b >= 16 && b <= 31) return true;           // 172.16.0.0/12
        if (a == 192 && b == 168) return true;                     // 192.168.0.0/16
        if (a == 192 && b == 0 && c == 0) return true;             // 192.0.0.0/24 incl. 192.0.0.9/10
        if (a == 198 && (b == 18 || b == 19)) return true;         // 198.18.0.0/15 benchmark
        if (a >= 224) return true;                                 // multicast + reserved
        if (a == 255) return true;                                 // broadcast
        return d == 0 && c == 0 && b == 0;                         // x.x.x.0 reserved only if a was public
    }
}
