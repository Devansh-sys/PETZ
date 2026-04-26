package com.cts.mfrp.petzbackend.adoption.enums;

/**
 * Kind of thing an AdoptionAuditLog row refers to. Lets one audit table
 * service all waves of Epic 2 without separate tables per domain.
 *
 *   PET_LISTING — AdoptablePet create/update/archive (Wave 1).
 *   APPLICATION — AdoptionApplication status changes (Wave 2).
 *   ADOPTION    — Finalization + follow-ups (Wave 3).
 *   NGO         — Admin verify/reject/suspend NGO (Wave 3).
 *   DISPUTE     — Admin dispute resolution (Wave 3).
 */
public enum AuditTargetType {
    PET_LISTING,
    APPLICATION,
    ADOPTION,
    NGO,
    DISPUTE
}
