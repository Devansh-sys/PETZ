package com.cts.mfrp.petzbackend.adoption.enums;

/**
 * US-2.5.3 AC#1 — three auto-scheduled follow-ups per adoption.
 *
 *   DAY_7  — one week after handover
 *   DAY_30 — one month after handover
 *   DAY_90 — three months after handover
 */
public enum FollowUpType {
    DAY_7(7),
    DAY_30(30),
    DAY_90(90);

    private final int offsetDays;

    FollowUpType(int offsetDays) { this.offsetDays = offsetDays; }

    public int getOffsetDays() { return offsetDays; }
}
