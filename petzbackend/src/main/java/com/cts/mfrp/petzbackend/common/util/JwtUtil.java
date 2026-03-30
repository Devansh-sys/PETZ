package com.cts.mfrp.petzbackend.common.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * JWT utility — SINGLE source of truth for all token operations.
 * US-1.1.4: Temporary Emergency Session
 * US-4.1.2: Full User Login (teammates use this too)
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │  TEAMMATES: Import and use this class. Do NOT create your   │
 * │  own JWT utility. If you need additional claims, use the    │
 * │  generateToken() overload with extraClaims map.             │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Dependencies required in pom.xml:
 *   io.jsonwebtoken:jjwt-api:0.12.3
 *   io.jsonwebtoken:jjwt-impl:0.12.3
 *   io.jsonwebtoken:jjwt-jackson:0.12.3
 */
@Component
public class JwtUtil {

    private final SecretKey signingKey;
    private final long defaultExpirationMs;
    private final long tempSessionExpirationMs;
    private final String issuer;

    public JwtUtil(
            @Value("${petz.jwt.secret}") String secret,
            @Value("${petz.jwt.expiration-ms:86400000}") long defaultExpirationMs,
            @Value("${petz.jwt.temp-session-expiration-ms:43200000}") long tempSessionExpirationMs,
            @Value("${petz.jwt.issuer:petz-platform}") String issuer
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.defaultExpirationMs = defaultExpirationMs;
        this.tempSessionExpirationMs = tempSessionExpirationMs;
        this.issuer = issuer;
    }

    // ─── Token Generation ────────────────────────────────────────────────

    /** Generate token for a fully registered user (US-4.1.2). */
    public String generateToken(UUID userId, String role) {
        return buildToken(userId, role, Map.of(), defaultExpirationMs);
    }

    /**
     * Generate temporary emergency session token (US-1.1.4).
     * Contains isTemporary=true so filters/endpoints can distinguish.
     * Max lifetime: 12 hours (configurable).
     */
    public String generateTemporarySessionToken(UUID userId, String phone) {
        return buildToken(userId, "REPORTER", Map.of(
                "isTemporary", true,
                "phone", phone
        ), tempSessionExpirationMs);
    }

    /** Extensible token builder — teammates can pass extra claims. */
    public String buildToken(UUID userId, String role, Map<String, Object> extraClaims,
                             long expirationMs) {
        Date now = new Date();
        JwtBuilder builder = Jwts.builder()
                .subject(userId.toString())
                .issuer(issuer)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .claim("role", role);

        extraClaims.forEach(builder::claim);
        return builder.signWith(signingKey).compact();
    }

    // ─── Token Parsing ───────────────────────────────────────────────────

    /** Parse and validate token. Throws JwtException on failure. */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseToken(token).getSubject());
    }

    public String extractRole(String token) {
        return parseToken(token).get("role", String.class);
    }

    public boolean isTemporarySession(String token) {
        Boolean temp = parseToken(token).get("isTemporary", Boolean.class);
        return Boolean.TRUE.equals(temp);
    }

    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ─── Expiration helpers (for AuthResponse DTO) ───────────────────────

    public long getDefaultExpirationSeconds() {
        return defaultExpirationMs / 1000;
    }

    public long getTempSessionExpirationSeconds() {
        return tempSessionExpirationMs / 1000;
    }
}