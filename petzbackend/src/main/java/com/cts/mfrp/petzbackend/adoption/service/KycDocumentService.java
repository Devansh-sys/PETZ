package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.KycDocumentDtos.DocumentResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.enums.KycDocumentType;
import com.cts.mfrp.petzbackend.adoption.enums.KycVerificationStatus;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionApplication;
import com.cts.mfrp.petzbackend.adoption.model.KycDocument;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionApplicationRepository;
import com.cts.mfrp.petzbackend.adoption.repository.KycDocumentRepository;
import com.cts.mfrp.petzbackend.common.exception.FileValidationException;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import com.cts.mfrp.petzbackend.sosmedia.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * US-2.3.4 (Upload) + US-2.4.6 (Verify) — KYC document handling.
 *
 *   upload  — adopter uploads an ID_PROOF / ADDRESS_PROOF document
 *             (PDF, JPEG, PNG). File goes through {@link FileStorageService
 *             #storeKycDocument(MultipartFile)} to a dedicated directory.
 *   list    — adopter and NGO reviewer both list docs on an application.
 *   verify  — NGO reviewer marks a doc VERIFIED or REJECTED (reason
 *             mandatory on REJECTED per US-2.4.6 AC#2).
 */
@Service
@RequiredArgsConstructor
public class KycDocumentService {

    private static final Logger log = LoggerFactory.getLogger(KycDocumentService.class);

    private final AdoptionApplicationRepository appRepo;
    private final KycDocumentRepository         docRepo;
    private final FileStorageService            fileStorage;
    private final AdoptionAuditService          auditService;
    private final NotificationService           notifications;

    /** Max KYC file size (bytes). Configurable via property. */
    @Value("${petz.adoption.kyc.max-bytes:5242880}")
    private long maxBytes;

    // ═════════════════════════════════════════════════════════════════
    //  US-2.3.4 — Upload
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public DocumentResponse upload(UUID actingUserId, UUID applicationId,
                                   String docTypeRaw, MultipartFile file) {
        AdoptionApplication app = appRepo.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AdoptionApplication", applicationId));

        // Only the owning adopter can upload — cross-user upload blocked.
        if (!app.getAdopterId().equals(actingUserId)) {
            throw new ResourceNotFoundException(
                    "AdoptionApplication " + applicationId + " not found for this user");
        }

        // Once decided, no more KYC uploads. Adopter would need a new
        // application to submit fresh documents.
        if (app.getStatus() != null && app.getStatus().isFinalized()) {
            throw new IllegalStateException(
                    "Cannot upload documents to a " + app.getStatus() + " application.");
        }

        if (file == null || file.isEmpty()) {
            throw new FileValidationException("Uploaded file is empty.");
        }
        if (file.getSize() > maxBytes) {
            throw new FileValidationException(
                    "File too large. Max allowed " + (maxBytes / (1024 * 1024)) + " MB.");
        }
        if (!fileStorage.isDocument(file)) {
            throw new FileValidationException(
                    "Invalid KYC document type: " + file.getContentType()
                            + ". Allowed: PDF, JPEG, PNG.");
        }

        KycDocumentType docType = parseDocType(docTypeRaw);
        String url = fileStorage.storeKycDocument(file);

        KycDocument doc = KycDocument.builder()
                .applicationId(app.getId())
                .docType(docType)
                .fileUrl(url)
                .fileName(file.getOriginalFilename())
                .verificationStatus(KycVerificationStatus.PENDING)
                .build();
        KycDocument saved = docRepo.save(doc);

        auditService.log(AuditTargetType.APPLICATION, app.getId(), actingUserId,
                "KYC_UPLOADED", null,
                "{\"docId\":\"" + saved.getId() + "\",\"type\":\"" + docType + "\"}");

        log.info("KYC doc {} uploaded on application {} by adopter {}",
                saved.getId(), app.getId(), actingUserId);
        return toResponse(saved);
    }

    // ═════════════════════════════════════════════════════════════════
    //  List documents (adopter and NGO views both use this)
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<DocumentResponse> list(UUID applicationId) {
        return docRepo.findByApplicationIdOrderByUploadedAtDesc(applicationId).stream()
                .map(this::toResponse).toList();
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.4.6 — Verify
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public DocumentResponse verify(UUID reviewerId, AdoptionApplication app,
                                   UUID docId, String statusRaw, String reason) {
        KycDocument doc = docRepo.findByIdAndApplicationId(docId, app.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "KYC document " + docId + " not found on application " + app.getId()));

        KycVerificationStatus next = parseStatus(statusRaw);
        if (next == KycVerificationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Cannot transition verification status back to PENDING.");
        }
        if (next == KycVerificationStatus.REJECTED
                && (reason == null || reason.isBlank())) {
            throw new IllegalArgumentException(
                    "reason is required when rejecting a KYC document.");
        }

        doc.setVerificationStatus(next);
        doc.setVerifierId(reviewerId);
        doc.setVerifiedAt(LocalDateTime.now());
        doc.setRejectionReason(next == KycVerificationStatus.REJECTED ? reason : null);
        KycDocument saved = docRepo.save(doc);

        auditService.log(AuditTargetType.APPLICATION, app.getId(), reviewerId,
                next == KycVerificationStatus.VERIFIED ? "KYC_VERIFIED" : "KYC_REJECTED",
                reason,
                "{\"docId\":\"" + docId + "\"}");

        notifications.notifyAdopterKycDecision(
                app.getAdopterId(), app.getId(), docId, next.name(), reason);

        return toResponse(saved);
    }

    // ─── helpers ─────────────────────────────────────────────────────

    public DocumentResponse toResponse(KycDocument d) {
        return DocumentResponse.builder()
                .id(d.getId())
                .applicationId(d.getApplicationId())
                .docType(d.getDocType() != null ? d.getDocType().name() : null)
                .fileUrl(d.getFileUrl())
                .fileName(d.getFileName())
                .verificationStatus(d.getVerificationStatus() != null
                        ? d.getVerificationStatus().name() : null)
                .verifierId(d.getVerifierId())
                .verifiedAt(d.getVerifiedAt())
                .rejectionReason(d.getRejectionReason())
                .uploadedAt(d.getUploadedAt())
                .build();
    }

    private KycDocumentType parseDocType(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException(
                    "docType is required. Allowed: ID_PROOF, ADDRESS_PROOF");
        }
        try {
            return KycDocumentType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            String allowed = Stream.of(KycDocumentType.values())
                    .map(Enum::name).reduce((a, b) -> a + ", " + b).orElse("");
            throw new IllegalArgumentException(
                    "Invalid docType '" + raw + "'. Allowed: " + allowed);
        }
    }

    private KycVerificationStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException(
                    "status is required. Allowed: VERIFIED, REJECTED");
        }
        try {
            return KycVerificationStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid status '" + raw + "'. Allowed: VERIFIED, REJECTED");
        }
    }
}
