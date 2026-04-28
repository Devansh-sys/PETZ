package com.cts.mfrp.petzbackend.adoption.enums;

/**
 * US-2.5.1 + US-2.5.2 — lifecycle of a finalized adoption record.
 *
 *   HANDOVER_SCHEDULED — NGO scheduled the pickup date/location; both
 *                        parties notified (US-2.5.1 AC#2).
 *   COMPLETED          — handover confirmed; record is now IMMUTABLE
 *                        (US-2.5.2 AC#2). No endpoint modifies it again.
 */
public enum AdoptionStatus {
    HANDOVER_SCHEDULED,
    COMPLETED
}
