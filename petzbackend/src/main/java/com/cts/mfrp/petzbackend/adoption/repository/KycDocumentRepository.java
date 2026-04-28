package com.cts.mfrp.petzbackend.adoption.repository;

import com.cts.mfrp.petzbackend.adoption.enums.KycVerificationStatus;
import com.cts.mfrp.petzbackend.adoption.model.KycDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * US-2.3.4 / US-2.4.6 repository for uploaded KYC documents.
 */
@Repository
public interface KycDocumentRepository extends JpaRepository<KycDocument, UUID> {

    /** Adopter / NGO views — all docs on an application, newest first. */
    List<KycDocument> findByApplicationIdOrderByUploadedAtDesc(UUID applicationId);

    /** Strict ownership lookup — doc must belong to the given application. */
    Optional<KycDocument> findByIdAndApplicationId(UUID id, UUID applicationId);

    /** Count of PENDING docs — used by the review service to show unreviewed badges. */
    long countByApplicationIdAndVerificationStatus(
            UUID applicationId, KycVerificationStatus verificationStatus);
}
