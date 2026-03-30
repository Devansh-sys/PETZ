package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.rescue.dto.ConvertSessionRequest;
import com.cts.mfrp.petzbackend.rescue.dto.ConvertSessionResponse;
import com.cts.mfrp.petzbackend.rescue.service.SessionConversionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * POST /auth/convert-session
 *
 * Converts a temporary SOS reporter account into a full PETZ account.
 * Caller must be authenticated (JWT from OTP flow carries the temp user UUID).
 *
 * Request body: { "password": "...", "fullName": "...", "email": "..." }
 * Response:     ConvertSessionResponse (userId, phone, fullName, email, message)
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class SessionConversionController {

    private final SessionConversionService conversionService;

    @PostMapping("/convert-session")
    public ResponseEntity<ConvertSessionResponse> convertSession(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody ConvertSessionRequest req) {

        return ResponseEntity.ok(conversionService.convertSession(userId, req));
    }
}

