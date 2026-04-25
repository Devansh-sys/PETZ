package com.cts.mfrp.petzbackend.adoption.enums;

/**
 * US-2.5.3 AC#3 + US-2.5.4 — state of each post-adoption follow-up.
 *
 *   SCHEDULED — auto-created, not yet acted on.
 *   COMPLETED — NGO recorded the visit / check-in.
 *   FLAGGED   — NGO flagged a concern; surfaces in admin dashboard
 *               (US-2.5.4 AC#4).
 */
public enum FollowUpStatus {
    SCHEDULED,
    COMPLETED,
    FLAGGED
}
