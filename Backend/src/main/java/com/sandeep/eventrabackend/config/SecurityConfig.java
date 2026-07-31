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
    private final RateLimitingFilter rateLimitingFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:3000,https://eventra.vercel.app,https://eventra.sandeepvashishtha.tech}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
            RateLimitingFilter rateLimitingFilter,
            UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
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
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

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
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF — stateless REST API, no session cookies
                .csrf(AbstractHttpConfigurer::disable)
                // Disable CORS — open for testing; re-enable before production
                .cors(cors -> {})
                // Stateless sessions — JWT handles auth
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(
                                "/actuator",
                                "/actuator/**",
                                "/actuator/health",
                                "/actuator/health/**"
                        ).permitAll()
                        .requestMatchers("/api/contact", "/api/contact/**", "/api/contacts", "/api/contacts/**").permitAll()
                        // ── Public: Event read-only endpoints ────────────────
                        // Anyone can view an event or check its availability;
                        // only authenticated users can register (POST).
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/events/**").permitAll()
                        // ── Public: Projects endpoint ────────────────────────
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/projects").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/projects/{id}").permitAll()
                        // ── Public: Hackathons endpoint ──────────────────────
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/hackathons").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/hackathons/{id}").permitAll()
                        // ── Public: Project categories endpoint ──────────────
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/projects/categories").permitAll()
                        // ── Admin Panel — ADMIN / SUPER_ADMIN only ────────
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN", "SUPER_ADMIN")
                        // ── Public: Swagger / OpenAPI ────────────────────
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/api-docs",
                                "/api-docs/**",
                                "/api-docs.yaml",
                                "/v3/api-docs",
                                "/v3/api-docs/**")
                        .permitAll()
                        // ── Everything else requires a valid JWT ─────────
                        .anyRequest().authenticated())
                // Return 401 (not Spring Security's default 403) for missing/invalid JWT
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(unauthorizedEntryPoint()))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(rateLimitingFilter,
                        UsernamePasswordAuthenticationFilter.class)
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
