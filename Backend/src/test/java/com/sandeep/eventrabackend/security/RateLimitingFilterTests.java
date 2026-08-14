package com.sandeep.eventrabackend.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.rate-limit.login.capacity=1",
        "app.rate-limit.login.window=1m",
        "app.rate-limit.google.capacity=1",
        "app.rate-limit.google.window=1m",
        "app.rate-limit.forgot-password.capacity=1",
        "app.rate-limit.forgot-password.window=1m",
        "app.rate-limit.trusted-proxy-hops=1",
        "app.rate-limit.enabled=true"
})
class RateLimitingFilterTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsTooManyRequestsWhenLoginLimitIsExceeded() throws Exception {
        String clientIp = "203.0.113.10";

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(header().string("X-RateLimit-Limit", "1"))
                .andExpect(header().string("X-RateLimit-Remaining", "0"))
                .andExpect(jsonPath("$.status", is(429)))
                .andExpect(jsonPath("$.error", is("Too Many Requests")))
                .andExpect(jsonPath("$.path", is("/api/auth/login")));
    }

    @Test
    void ignoresClientSpoofedLeftmostXffWithTrustedProxyHops() throws Exception {
        // Attacker varies the left-hand spoof; LB appends the real client on the right.
        // With trustedProxyHops=1 both requests must share the same rate-limit bucket.
        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "198.51.100.1, 203.0.113.50")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "198.51.100.99, 203.0.113.50")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status", is(429)))
                .andExpect(jsonPath("$.path", is("/api/auth/login")));
    }

    @Test
    void returnsTooManyRequestsWhenGoogleLimitIsExceeded() throws Exception {
        String clientIp = "203.0.113.20";

        mockMvc.perform(post("/api/auth/google")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/google")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.path", is("/api/auth/google")));
    }

    @Test
    void returnsTooManyRequestsWhenResetPasswordLimitIsExceeded() throws Exception {
        // The real password-reset request endpoint is POST /api/auth/reset-password;
        // the rate-limit rule must cover it so the flow cannot be brute-forced.
        String clientIp = "203.0.113.30";
        String validBody = "{\"email\":\"reset@example.com\"}";

        mockMvc.perform(post("/api/auth/reset-password")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/reset-password")
                        .header("X-Forwarded-For", clientIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status", is(429)))
                .andExpect(jsonPath("$.path", is("/api/auth/reset-password")));
    }
}
