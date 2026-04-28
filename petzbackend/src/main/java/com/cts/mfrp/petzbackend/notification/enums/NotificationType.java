package com.cts.mfrp.petzbackend.notification.enums;

/**
 * US-4.2.1 — categories of in-app notifications.
 * Each value maps to one logical group of platform events.
 */
public enum NotificationType {

    // Rescue / SOS
    SOS_ALERT,
    MISSION_CLAIMED,
    RESCUE_UPDATE,

    // Appointments (Epic 3.4)
    APPOINTMENT_CONFIRMED,
    APPOINTMENT_EMERGENCY,

    // Adoption — adopter-facing (Epic 2.3 / 2.4)
    ADOPTION_APPLICATION,       // new application created
    ADOPTION_DECISION,          // approved / rejected
    ADOPTION_CLARIFICATION,     // NGO asked for more info
    ADOPTION_KYC,               // KYC document decision
    ADOPTION_HANDOVER,          // handover scheduled / confirmed
    ADOPTION_FOLLOW_UP,         // follow-up reminder
    HOSPITAL_MODULE_LINKED,     // pet bridged to hospital module

    // Dispute (Epic 2.6)
    DISPUTE_RESOLVED,

    // Generic
    SYSTEM
}
