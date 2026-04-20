package com.cts.mfrp.petzbackend.adoption.enums;

/**
 * Lifecycle states for a pet listing in the adoption module.
 *
 * US-2.1.1 / US-2.2.1 / US-2.2.4 / US-2.5.2 reference these states.
 *
 *   LISTED    — default on creation; publicly discoverable (US-2.1.1).
 *   ON_HOLD   — an application is mid-review; kept visible but flagged
 *               (transition reserved for Wave 2 — not set in Wave 1).
 *   ADOPTED   — adoption finalized; no further applications accepted
 *               (set by Wave 3 AdoptionCompletionService).
 *   ARCHIVED  — NGO took the listing down (US-2.2.4); removed from public
 *               discovery but kept in the NGO's archive view.
 */
public enum AdoptablePetStatus {
    LISTED,
    ON_HOLD,
    ADOPTED,
    ARCHIVED
}
