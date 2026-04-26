package com.cts.mfrp.petzbackend.adoption.enums;

/**
 * US-2.6.3 — admin-driven resolution of adoption disputes.
 *
 *   OPEN     — awaiting admin triage.
 *   RESOLVED — admin recorded an action (OVERRIDE / WARN / SUSPEND)
 *              and a resolution note.
 */
public enum DisputeStatus {
    OPEN,
    RESOLVED
}
