package com.sandeep.eventrabackend.config;

import com.sandeep.eventrabackend.security.JwtAuthenticationFilter;
import com.sandeep.eventrabackend.security.RateLimitingFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:3000,https://eventra.vercel.app,https://eventra.sandeepvashishtha.tech}")
    private String allowedOrigins;

    @Value("${eventra.api-docs.enabled:false}")
    private boolean apiDocsEnabled;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
            UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        String[] origins = allowedOrigins.split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
        }
        configuration.setAllowedOrigins(List.of(origins));

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With",
                        "X-CSRF-Token",
                        "Idempotency-Key",
                        "X-Request-Integrity",
                        "X-Timestamp",
                        "X-Nonce",
                        "X-Signature"
                )
        );

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight requests for 1 hour (#16589)

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilterRegistration(
            RateLimitingFilter filter) {
        FilterRegistrationBean<RateLimitingFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(true);
        registration.addUrlPatterns("/api/*");
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF — JWT auth (Bearer or SameSite=None HttpOnly cookie).
                // Cookie is not readable by JS; SPA uses withCredentials for cookie sessions.
                .csrf(AbstractHttpConfigurer::disable)
                // Disable CORS — open for testing; re-enable before production
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Stateless sessions — JWT handles auth
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                        auth.requestMatchers("/api/auth/**").permitAll()
                        // ── Public: pre-submit availability checks ──────────
                        // Email/username validation runs before the user has a JWT.
                        .requestMatchers("/api/validate/**").permitAll()
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/health/**"
                        ).permitAll()
                        .requestMatchers("/api/contact", "/api/contact/**", "/api/contacts", "/api/contacts/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/github-proxy").permitAll()
                        .requestMatchers("/api/events/*/roles", "/api/events/*/roles/**").authenticated()
                        // ── Public: Event read-only endpoints ────────────────
                        // Anyone can view an event or check its availability;
                        // only authenticated users can register (POST).
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/events",
                                "/api/events/search",
                                "/api/events/alternatives",
                                "/api/events/{id}",
                                "/api/events/{id}/availability",
                                "/api/events/{id}/seats",
                                "/api/events/{id}/schedule",
                                "/api/events/{id}/feed.ics",
                                "/api/events/stream",
                                "/api/events/{id}/stream"
                        ).permitAll()
                        .requestMatchers("/stream/events", "/stream/leaderboard").permitAll()
                        .requestMatchers("/stream/live-audience", "/stream/notifications", "/stream/analytics").authenticated()
                        // ── Public: Projects endpoint ────────────────────────
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/projects").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/projects/{id}").permitAll()
                        // ── Public: Hackathons endpoint ──────────────────────
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/hackathons").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/hackathons/{id}").permitAll()
                        // ── Public: Project categories endpoint ──────────────
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/projects/categories").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/feedback").permitAll()
                        // ── Admin Panel — ADMIN / SUPER_ADMIN only ────────
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "SUPER_ADMIN");
                        // ── Swagger / OpenAPI — only when explicitly enabled (dev)
                        if (apiDocsEnabled) {
                                auth.requestMatchers(
                                                "/swagger-ui.html",
                                                "/swagger-ui/**",
                                                "/api-docs",
                                                "/api-docs/**",
                                                "/api-docs.yaml",
                                                "/v3/api-docs",
                                                "/v3/api-docs/**")
                                        .permitAll();
                        }
                        // ── Everything else requires a valid JWT ─────────
                        auth.anyRequest().authenticated();
                })
                // Return 401 (not Spring Security's default 403) for missing/invalid JWT
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(unauthorizedEntryPoint()))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Returns HTTP 401 Unauthorized (instead of Spring Security's default 403)
     * whenever a request hits a protected endpoint without a valid JWT.
     */
    @Bean
    public AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (request, response, authException) ->
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: valid JWT required");
    }
}
