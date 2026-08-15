package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.PushSubscriptionRequest;
import com.sandeep.eventrabackend.model.PushSubscription;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.PushSubscriptionRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PushSubscriptionService {

    private static final int MAX_ENDPOINT_LENGTH = 2048;

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UserRepository userRepository;

    @Transactional
    public void subscribe(String userEmail, PushSubscriptionRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Map<String, String> keys = request.getKeys();
        String p256dh = keys != null ? keys.get("p256dh") : null;
        String auth = keys != null ? keys.get("auth") : null;
        if (p256dh == null || p256dh.isBlank() || auth == null || auth.isBlank()) {
            throw new IllegalArgumentException("Push subscription keys.p256dh and keys.auth are required");
        }

        // Reject endpoints that could be used as an SSRF vector when the server
        // later dispatches pushes: only https to a public hostname on the default
        // port is accepted (#16257).
        validateEndpoint(request.getEndpoint());

        try {
            PushSubscription subscription = pushSubscriptionRepository
                    .findByUser_IdAndEndpoint(user.getId(), request.getEndpoint())
                    .orElseGet(() -> {
                        PushSubscription created = new PushSubscription();
                        created.setUser(user);
                        created.setEndpoint(request.getEndpoint());
                        created.setP256dh(p256dh);
                        created.setAuth(auth);
                        return pushSubscriptionRepository.save(created);
                    });
            // Row was either found or just created; keep its keys current.
            if (!p256dh.equals(subscription.getP256dh())
                    || !auth.equals(subscription.getAuth())) {
                subscription.setP256dh(p256dh);
                subscription.setAuth(auth);
                pushSubscriptionRepository.save(subscription);
            }
        } catch (DataIntegrityViolationException ex) {
            // A concurrent request inserted the (user_id, endpoint) row between
            // our lookup and our save. Load the surviving row and update it so
            // the double-subscribe is idempotent instead of failing with a 500.
            PushSubscription existing = pushSubscriptionRepository
                    .findByUser_IdAndEndpoint(user.getId(), request.getEndpoint())
                    .orElseThrow(() -> ex);
            existing.setP256dh(p256dh);
            existing.setAuth(auth);
            pushSubscriptionRepository.save(existing);
        }
    }

    @Transactional
    public void unsubscribe(String userEmail, String endpoint) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (endpoint != null && !endpoint.isBlank()) {
            pushSubscriptionRepository.deleteByUser_IdAndEndpoint(user.getId(), endpoint);
            return;
        }
        pushSubscriptionRepository.deleteByUser_Id(user.getId());
    }

    private void validateEndpoint(String endpoint) {
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
        rejectNonPublicHost(host);
    }

    /**
     * Rejects loopback/link-local/private/multicast IP literals and bare or
     * reserved hostnames, so a stored endpoint can never point at internal
     * infrastructure (metadata endpoints, admin ports, etc.).
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
        // IPv6 literals and bare hostnames never contain a dot and are never
        // valid WebPush endpoints.
        if (!h.contains(".")) {
            throw new IllegalArgumentException("Push subscription endpoint must use a public hostname");
        }
        if (isIpv4Literal(h) && isNonPublicIpv4(h)) {
            throw new IllegalArgumentException("Push subscription endpoint must not point at a private IP address");
        }
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
