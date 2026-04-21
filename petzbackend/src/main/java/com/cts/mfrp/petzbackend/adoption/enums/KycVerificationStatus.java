package com.cts.mfrp.petzbackend.adoption.enums;

/**
 * US-2.4.6 — "Mark: Verified or Rejected".
 *
 *   PENDING  — just uploaded, awaiting NGO review.
 *   VERIFIED — reviewer accepted the document.
 *   REJECTED — reviewer rejected; rejectionReason mandatory.
 */
public enum KycVerificationStatus {
    PENDING,
    VERIFIED,
    REJECTED
}
