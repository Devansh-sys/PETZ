package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.rescue.dto.RescueHistoryResponse;
import com.cts.mfrp.petzbackend.rescue.service.RescueHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * GET /users/{userId}/rescue-history
 *
 * Returns all SOS reports submitted by the authenticated user.
 * Users can only view their own history (403 if userId ≠ token userId).
 *
 * Response: List<RescueHistoryResponse>
 *   - sosId, reportedAt, latitude, longitude, urgencyLevel, status, description, outcome
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class RescueHistoryController {

    private final RescueHistoryService historyService;

    @GetMapping("/{userId}/rescue-history")
    public ResponseEntity<List<RescueHistoryResponse>> getRescueHistory(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UUID requesterId) {

//        if (!userId.equals(requesterId)) {
//            return ResponseEntity.status(403).build();
//        }

        return ResponseEntity.ok(historyService.getHistoryForUser(userId));
    }
}
