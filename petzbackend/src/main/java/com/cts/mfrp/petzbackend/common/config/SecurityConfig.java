package com.cts.mfrp.petzbackend.common.config;

import com.cts.mfrp.petzbackend.common.filter.JwtAuthFilter;
import com.cts.mfrp.petzbackend.common.filter.RateLimitFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Central Spring Security configuration for the entire PETZ platform.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  TEAMMATES: Do NOT create a second SecurityFilterChain bean.        │
 * │  To add new public endpoints → add to permitAll() list below.      │
 * │  To add role restrictions → use @PreAuthorize on your controllers.  │
 * │  EnableMethodSecurity is already ON.                                │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Filter chain order (US-1.1.5 requirement):
 *   RateLimitFilter → JwtAuthFilter → Controllers
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final RateLimitFilter rateLimitFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, RateLimitFilter rateLimitFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public — no authentication needed
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/webhook/**").permitAll()
                        .requestMatchers("/health", "/actuator/health").permitAll()

                        // SOS creation — any authenticated user (even temporary)
                        .requestMatchers(HttpMethod.POST, "/api/v1/sos/reports").authenticated()

                        // Admin endpoints
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // NGO endpoints (teammates Epic 1.3)
                        .requestMatchers("/api/v1/ngo/**").hasAnyRole("NGO_REP", "ADMIN")

                        // Hospital management (teammates Sprint 3)
                        .requestMatchers("/api/v1/hospitals/manage/**").hasAnyRole("VET", "ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                // Filter ordering: RateLimitFilter → JwtAuthFilter → Controllers
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtAuthFilter, RateLimitFilter.class);

        return http.build();
    }

    /**
     * BCrypt encoder — used for:
     * - OTP hashing (US-1.1.2)
     * - Password hashing (US-4.1.1, US-4.1.2 — teammate scope)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}