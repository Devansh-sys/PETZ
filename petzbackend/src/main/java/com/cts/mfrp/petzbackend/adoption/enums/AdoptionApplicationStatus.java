package com.cts.mfrp.petzbackend.adoption.enums;

/**
 * Lifecycle of an AdoptionApplication.
 *
 *   DRAFT                   — adopter is still filling the multi-step form
 *                             (US-2.3.1 / US-2.3.2 auto-save).
 *   SUBMITTED               — adopter finalized and submitted (US-2.3.3).
 *                             NGO queue picks it up.
 *   UNDER_REVIEW            — NGO reviewer took it (US-2.4.2).
 *   CLARIFICATION_REQUESTED — reviewer asked adopter a follow-up (US-2.4.5).
 *                             Any adopter PATCH reopens to UNDER_REVIEW.
 *   APPROVED                — NGO approved (US-2.4.3).
 *   REJECTED                — NGO rejected with reason (US-2.4.4).
 *   WITHDRAWN               — adopter withdrew (US-2.3.6).
 *
 * "Active" = DRAFT / SUBMITTED / UNDER_REVIEW / CLARIFICATION_REQUESTED.
 * "Finalized" = APPROVED / REJECTED / WITHDRAWN.
 * Only one Active row may exist per (adopterId, adoptablePetId) pair.
 */
public enum AdoptionApplicationStatus {
    DRAFT,
    SUBMITTED,
    UNDER_REVIEW,
    CLARIFICATION_REQUESTED,
    APPROVED,
    REJECTED,
    WITHDRAWN;

    public boolean isActive() {
        return this == DRAFT
                || this == SUBMITTED
                || this == UNDER_REVIEW
                || this == CLARIFICATION_REQUESTED;
    }

    public boolean isFinalized() {
        return !isActive();
    }
}
