package com.cts.mfrp.petzbackend.enums;


public enum ReportStatus {
    REPORTED,
    DISPATCHED,
    ON_SITE,
    TRANSPORTING,
    PENDING_CLOSURE,   // ← add this (US-1.4.3 RELEASE/CANNOT_LOCATE)
    HANDED_OVER,       // ← add this (US-1.5.4 hospital handover)
    COMPLETE,
    MISSION_COMPLETE,
    FLAGGED,
    CLOSED
}