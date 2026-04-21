package com.cts.mfrp.petzbackend.adoption.enums;

/**
 * US-2.3.1 — "Multi-step: personal, lifestyle, experience, consent, review".
 *
 * The multi-step form PATCHes one section per step. The server stores
 * whichever step the client last wrote to on {@link
 * com.cts.mfrp.petzbackend.adoption.model.AdoptionApplication#currentStep}
 * so the adopter's UI can resume from the correct page
 * (US-2.3.2 "Resume from same step").
 */
public enum ApplicationStep {
    PERSONAL,
    LIFESTYLE,
    EXPERIENCE,
    CONSENT,
    REVIEW
}
