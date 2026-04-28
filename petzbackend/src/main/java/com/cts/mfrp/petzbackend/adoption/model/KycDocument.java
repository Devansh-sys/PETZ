package com.cts.mfrp.petzbackend.adoption.model;

import com.cts.mfrp.petzbackend.adoption.enums.KycDocumentType;
import com.cts.mfrp.petzbackend.adoption.enums.KycVerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-2.3.4 — "Upload KYC Documents".
 * US-2.4.6 — "Verify KYC Documents".
 *
 * One row per uploaded document, linked to a parent {@link
 * AdoptionApplication}. Uploaded PDF/JPEG/PNG files are stored via
 * {@code FileStorageService.storeKycDocument(...)} under
 * {@code /uploads/adoption-kyc/}.
 */
@Entity
@Table(
        name = "kyc_documents",
        indexes = {
                @Index(name = "idx_kyc_application", columnList = "application_id"),
                @Index(name = "idx_kyc_status",      columnList = "verification_status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "application_id", nullable = false)
    private UUID applicationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 20)
    private KycDocumentType docType;

    @Column(name = "file_url", nullable = false, length = 512)
    private String fileUrl;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 16)
    private KycVerificationStatus verificationStatus;

    /** NGO user who verified/rejected the document. */
    @Column(name = "verifier_id")
    private UUID verifierId;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    /** Mandatory when verificationStatus=REJECTED (US-2.4.6 AC#2). */
    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (this.uploadedAt == null) this.uploadedAt = LocalDateTime.now();
        if (this.verificationStatus == null) this.verificationStatus = KycVerificationStatus.PENDING;
    }
}
