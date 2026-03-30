package com.cts.mfrp.petzbackend.common.filter;

import com.cts.mfrp.petzbackend.common.dto.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Rate-limits SOS submissions per mobile number.
 * US-1.1.5: Max 3 SOS per mobile per hour.
 * FRD Ref: FR-3.9, NFR Abuse Prevention
 *
 * Implementation: Redis sliding window counter.
 *   Key pattern: "sos:rate:{phone}" → increment with 1hr TTL
 *
 * CHAIN ORDER: Must execute BEFORE JwtAuthFilter.
 *
 * Dependencies: spring-boot-starter-data-redis
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final String RATE_KEY_PREFIX = "sos:rate:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final int maxSosPerHour;

    public RateLimitFilter(
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            @Value("${petz.sos.rate-limit.max-per-hour:3}") int maxSosPerHour
    ) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.maxSosPerHour = maxSosPerHour;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String phone = extractPhone(request);

        if (phone == null || phone.isBlank()) {
            // Cannot identify caller — let request through, controller will validate
            filterChain.doFilter(request, response);
            return;
        }

        String key = RATE_KEY_PREFIX + phone.replaceAll("[^\\d+]", "");

        try {
            Long count = redisTemplate.opsForValue().increment(key);

            if (count != null && count == 1) {
                redisTemplate.expire(key, Duration.ofHours(1));
            }

            if (count != null && count > maxSosPerHour) {
                Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
                long retryAfter = (ttl != null && ttl > 0) ? ttl : 3600;

                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", String.valueOf(retryAfter));
                response.setHeader("X-RateLimit-Limit", String.valueOf(maxSosPerHour));
                response.setHeader("X-RateLimit-Remaining", "0");

                ApiErrorResponse error = ApiErrorResponse.of(
                        429, "Too Many Requests",
                        "SOS rate limit exceeded. Maximum " + maxSosPerHour
                                + " reports per hour. Try again in " + retryAfter + " seconds.",
                        request.getRequestURI()
                );
                objectMapper.writeValue(response.getOutputStream(), error);
                return;
            }

            long remaining = maxSosPerHour - (count != null ? count : 0);
            response.setHeader("X-RateLimit-Limit", String.valueOf(maxSosPerHour));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, remaining)));

        } catch (Exception e) {
            // Redis down — log and allow request through (fail-open for emergencies)
            log.warn("Redis unavailable for rate limiting. Allowing SOS request through. Error: {}",
                    e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Only rate-limit POST to SOS report creation endpoint.
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return !("POST".equalsIgnoreCase(request.getMethod())
                && request.getRequestURI().startsWith("/api/v1/sos/reports"));
    }

    private String extractPhone(HttpServletRequest request) {
        // Header set by auth flow after OTP verification
        String phone = request.getHeader("X-Authenticated-Phone");
        if (phone != null && !phone.isBlank()) return phone;
        // Fallback for testing
        return request.getParameter("phone");
    }
}