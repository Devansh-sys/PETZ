package com.cts.mfrp.petzbackend.common.config;

import com.cts.mfrp.petzbackend.common.filter.JwtAuthFilter;
import com.cts.mfrp.petzbackend.common.filter.RateLimitFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 * MERGED Security Configuration — combines:
 *   1. Auth filter chain (Epic 1.1 — JWT + Rate Limiting)
 *   2. Teammate's basic permitAll config (NGO branch)
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  TEAMMATES: This is the ONLY SecurityConfig in the project.         │
 * │  Delete any other SecurityConfig files in other packages.           │
 * │  To add new public endpoints → add to permitAll() list below.      │
 * │  To add role restrictions → use @PreAuthorize on your controllers.  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * Filter chain order: RateLimitFilter → JwtAuthFilter → Controllers
 */
@Configuration
//@EnableWebSecurity
@EnableMethodSecurity  // US-4.1.3 — turn on @PreAuthorize / @PostAuthorize
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
                        // ── Public endpoints (no auth needed) ──
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/webhook/**").permitAll()
                        .requestMatchers("/health", "/actuator/health").permitAll()

                        // ── NGO endpoints (from teammate's branch) ──
                        .requestMatchers("/api/v1/ngo/**").permitAll()       // permitAll for now, tighten later
                        .requestMatchers("/api/v1/hospitals/**").permitAll() // permitAll for now, tighten later

                        // ── SOS creation — any authenticated user (even temporary) ──
                        .requestMatchers(HttpMethod.POST, "/api/v1/sos/reports").authenticated()

                        // ── Admin endpoints ──
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // ── Everything else — permitAll during development ──
                        // Change to .authenticated() before production
                        .anyRequest().permitAll()
                )

                // Filter ordering: RateLimitFilter → JwtAuthFilter → Controllers
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtAuthFilter, RateLimitFilter.class);

        return http.build();
    }

    /**
     * BCrypt encoder — used by:
     * - OTP hashing (US-1.1.2)
     * - Password hashing (US-4.1.1, US-4.1.2)
     * - SessionConversionService (teammate's NGO branch)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}