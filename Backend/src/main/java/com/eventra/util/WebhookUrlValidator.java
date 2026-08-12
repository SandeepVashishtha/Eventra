package com.eventra.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Validates outbound webhook targets before they are dispatched.
 *
 * Rejects non-HTTPS schemes, hosts outside the configured allowlist, and hosts
 * that resolve to private/reserved/link-local addresses (SSRF protection,
 * including basic DNS-rebinding mitigation by checking every resolved address).
 */
@Component
public class WebhookUrlValidator {

    private final Set<String> allowedHosts;

    public WebhookUrlValidator(
            @Value("${eventra.webhook.allowed-hosts:hooks.slack.com,discord.com,discordapp.com}")
            String allowedHostsCsv) {
        this.allowedHosts = Arrays.stream(allowedHostsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> s.toLowerCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
    }

    /**
     * Throws {@link IllegalArgumentException} if the URL is not a safe webhook target.
     */
    public void validate(String webhookUrl) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            throw new IllegalArgumentException("Webhook URL is blank");
        }

        URI uri;
        try {
            uri = URI.create(webhookUrl.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Webhook URL is malformed: " + webhookUrl, e);
        }

        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new IllegalArgumentException("Webhook URL must use https: " + webhookUrl);
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Webhook URL has no host: " + webhookUrl);
        }

        if (!isAllowedHost(host)) {
            throw new IllegalArgumentException("Webhook host is not allowed: " + host);
        }

        if (!allResolvedAddressesPublic(host)) {
            throw new IllegalArgumentException("Webhook host resolves to a non-public address: " + host);
        }
    }

    private boolean isAllowedHost(String host) {
        String h = host.toLowerCase(Locale.ROOT);
        return allowedHosts.stream()
                .anyMatch(allowed -> h.equals(allowed) || h.endsWith("." + allowed));
    }

    private boolean allResolvedAddressesPublic(String host) {
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            if (addresses.length == 0) {
                return false;
            }
            return Arrays.stream(addresses).allMatch(WebhookUrlValidator::isPublicAddress);
        } catch (UnknownHostException e) {
            return false;
        }
    }

    private static boolean isPublicAddress(InetAddress address) {
        if (address == null
                || address.isLoopbackAddress()
                || address.isAnyLocalAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()) {
            return false;
        }

        if (address instanceof Inet4Address) {
            return isPublicIpv4(address.getAddress());
        }
        if (address instanceof Inet6Address) {
            return isPublicIpv6(address.getAddress());
        }
        return true;
    }

    private static boolean isPublicIpv4(byte[] b) {
        int first = b[0] & 0xFF;
        if (first == 0) return false;                     // 0.0.0.0/8 "this" network
        if (first == 10) return false;                    // 10.0.0.0/8 private
        if (first == 100 && (b[1] & 0xFF) >= 64 && (b[1] & 0xFF) <= 127) return false; // 100.64.0.0/10 CGNAT
        if (first == 127) return false;                   // loopback
        if (first == 169 && (b[1] & 0xFF) == 254) return false; // 169.254.0.0/16 link-local
        if (first == 172 && (b[1] & 0xFF) >= 16 && (b[1] & 0xFF) <= 31) return false; // 172.16.0.0/12 private
        if (first == 192 && (b[1] & 0xFF) == 168) return false; // 192.168.0.0/16 private
        if (first == 198 && (b[1] & 0xFF) == 18) return false;  // 198.18.0.0/15 benchmarking
        if (first >= 224) return false;                   // multicast + reserved
        return true;
    }

    private static boolean isPublicIpv6(byte[] b) {
        if ((b[0] & 0xFF) == 0xFF) return false;          // multicast ff00::/8
        if ((b[0] & 0xFF) == 0xFC || (b[0] & 0xFF) == 0xFD) return false; // ULA fc00::/7
        if ((b[0] & 0xFF) == 0xFE && (b[1] & 0xFF) == 0x80) return false; // link-local fe80::/10
        return true;
    }
}
