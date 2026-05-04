package com.cts.mfrp.petzbackend.enums;

public enum ReportStatus {
    REPORTED,
    ASSIGNED,   // Admin has created a PENDING assignment — awaiting NGO response
    REJECTED,
    DISPATCHED,
    ON_SITE,
    TRANSPORTING,
    COMPLETE,
    MISSION_COMPLETE,
    FLAGGED,
    CLOSED
}
