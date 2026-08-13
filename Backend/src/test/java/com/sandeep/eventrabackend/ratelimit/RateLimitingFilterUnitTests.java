package com.sandeep.eventrabackend.ratelimit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * Issue #16254 — the sse/rest {@link RateLimitingFilter} must not trust a
 * client-supplied leftmost {@code X-Forwarded-For} value as the rate-limit
 * bucket key, otherwise an attacker can rotate it to bypass per-IP limits.
 */
class RateLimitingFilterUnitTests {

    private RateLimitResult allowed() {
        return new RateLimitResult(true, 100, 99, 0);
    }

    @Test
    @DisplayName("Spoofed leftmost XFF is ignored; trusted rightmost hop keys the bucket")
    void usesRightmostTrustedHopNotSpoofedLeftmost() throws Exception {
        RateLimitService service = mock(RateLimitService.class);
        org.mockito.Mockito.when(service.consume(anyString(), anyString(), anyInt(), any(Duration.class)))
                .thenReturn(allowed());
        RateLimitingFilter filter = new RateLimitingFilter(service, 1);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/some-endpoint");
        request.addHeader("X-Forwarded-For", "198.51.100.1, 203.0.113.50");

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        verify(service).consume(eq("rest-api"), eq("203.0.113.50"), anyInt(), any(Duration.class));
    }

    @Test
    @DisplayName("Different spoofed leftmost values map to the same bucket (no bypass)")
    void rotatingSpoofedLeftmostKeepsSameBucket() throws Exception {
        RateLimitService service = mock(RateLimitService.class);
        org.mockito.Mockito.when(service.consume(anyString(), anyString(), anyInt(), any(Duration.class)))
                .thenReturn(allowed());
        RateLimitingFilter filter = new RateLimitingFilter(service, 1);

        for (String spoof : new String[]{"198.51.100.1, 203.0.113.50", "198.51.100.99, 203.0.113.50"}) {
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setRequestURI("/api/some-endpoint");
            request.addHeader("X-Forwarded-For", spoof);
            filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());
        }

        // Both requests keyed on the same trusted hop.
        verify(service, org.mockito.Mockito.times(2))
                .consume(eq("rest-api"), eq("203.0.113.50"), anyInt(), any(Duration.class));
    }

    @Test
    @DisplayName("Falls back to remoteAddr when no forwarding headers are present")
    void fallsBackToRemoteAddr() throws Exception {
        RateLimitService service = mock(RateLimitService.class);
        org.mockito.Mockito.when(service.consume(anyString(), anyString(), anyInt(), any(Duration.class)))
                .thenReturn(allowed());
        RateLimitingFilter filter = new RateLimitingFilter(service, 1);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/some-endpoint");
        request.setRemoteAddr("203.0.113.77");

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        verify(service).consume(eq("rest-api"), eq("203.0.113.77"), anyInt(), any(Duration.class));
    }

    @Test
    @DisplayName("Assert bucket key is a valid non-blank value")
    void bucketKeyIsNeverBlank() throws Exception {
        RateLimitService service = mock(RateLimitService.class);
        org.mockito.Mockito.when(service.consume(anyString(), anyString(), anyInt(), any(Duration.class)))
                .thenReturn(allowed());
        RateLimitingFilter filter = new RateLimitingFilter(service, 1);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/some-endpoint");
        request.setRemoteAddr("");

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        org.mockito.ArgumentCaptor<String> captor = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(service).consume(eq("rest-api"), captor.capture(), anyInt(), any(Duration.class));
        String ip = captor.getValue();
        assertEquals(false, ip == null || ip.isBlank());
    }
}
