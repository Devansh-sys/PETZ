package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionMediaDtos.MediaResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.enums.MediaType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptablePet;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionMedia;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptablePetRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionMediaRepository;
import com.cts.mfrp.petzbackend.common.exception.FileValidationException;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.sosmedia.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * US-2.2.3 — "Manage Pet Media Gallery".
 *
 *   upload  — accepts JPEG/PNG/MP4; first uploaded image becomes primary.
 *   reorder — full-replacement of displayOrder for the pet's media set.
 *   setPrimary — flips one media to primary, unsets the rest in the same tx.
 *   delete  — removes a media row (DB only; the stored file is left on disk
 *             for now — safe cleanup is out of scope for Wave 1).
 *   list    — gallery read for the NGO view.
 */
@Service
@RequiredArgsConstructor
public class AdoptionMediaService {

    private static final Logger log = LoggerFactory.getLogger(AdoptionMediaService.class);

    public static final int MAX_MEDIA_PER_PET = 10;       // US-2.2.3 AC#4 "Max file count"

    private final AdoptablePetRepository  petRepo;
    private final AdoptionMediaRepository mediaRepo;
    private final FileStorageService      fileStorage;
    private final AdoptionAuditService    auditService;

    @Transactional(readOnly = true)
    public List<MediaResponse> listMedia(UUID petId) {
        ensurePetExists(petId);
        return mediaRepo.findByAdoptablePetIdOrderByDisplayOrderAsc(petId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public MediaResponse upload(UUID actingUserId, UUID callerNgoId,
                                UUID petId, MultipartFile file) {
        AdoptablePet pet = loadForMutation(petId, callerNgoId);

        long existing = mediaRepo.countByAdoptablePetId(petId);
        if (existing >= MAX_MEDIA_PER_PET) {
            throw new IllegalStateException(
                    "Max media count (" + MAX_MEDIA_PER_PET + ") reached for this pet.");
        }

        MediaType kind = classify(file);      // throws FileValidationException if unsupported
        String url = fileStorage.storeFile(file);

        boolean makePrimary = mediaRepo
                .findByAdoptablePetIdAndIsPrimaryTrue(petId).isEmpty() && kind == MediaType.IMAGE;

        AdoptionMedia media = AdoptionMedia.builder()
                .adoptablePetId(pet.getId())
                .fileUrl(url)
                .fileName(file.getOriginalFilename())
                .mediaType(kind)
                .displayOrder((int) existing)
                .isPrimary(makePrimary)
                .build();
        AdoptionMedia saved = mediaRepo.save(media);

        auditService.log(AuditTargetType.PET_LISTING, petId, actingUserId,
                "MEDIA_UPLOADED", null,
                "{\"mediaId\":\"" + saved.getId() + "\",\"type\":\"" + kind + "\"}");

        log.info("Media {} uploaded to pet {} by user {}",
                saved.getId(), petId, actingUserId);
        return toResponse(saved);
    }

    /**
     * Full-replacement reorder. The submitted list must contain exactly the
     * media IDs currently attached to the pet — no additions, no removals.
     * This keeps the client-server handshake simple for drag-and-drop UIs.
     */
    @Transactional
    public List<MediaResponse> reorder(UUID actingUserId, UUID callerNgoId,
                                       UUID petId, List<UUID> newOrder) {
        loadForMutation(petId, callerNgoId);

        List<AdoptionMedia> existing = mediaRepo
                .findByAdoptablePetIdOrderByDisplayOrderAsc(petId);
        Set<UUID> existingIds = existing.stream()
                .map(AdoptionMedia::getId).collect(java.util.stream.Collectors.toSet());
        Set<UUID> submittedIds = new HashSet<>(newOrder);

        if (!existingIds.equals(submittedIds)) {
            throw new IllegalArgumentException(
                    "Reorder list must contain exactly the current media IDs (no additions/removals).");
        }

        for (int i = 0; i < newOrder.size(); i++) {
            UUID id = newOrder.get(i);
            AdoptionMedia m = existing.stream()
                    .filter(e -> e.getId().equals(id)).findFirst().orElseThrow();
            m.setDisplayOrder(i);
        }
        mediaRepo.saveAll(existing);

        auditService.log(AuditTargetType.PET_LISTING, petId, actingUserId,
                "MEDIA_REORDERED", null, null);

        return mediaRepo.findByAdoptablePetIdOrderByDisplayOrderAsc(petId).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public MediaResponse setPrimary(UUID actingUserId, UUID callerNgoId,
                                    UUID petId, UUID mediaId) {
        loadForMutation(petId, callerNgoId);

        AdoptionMedia target = mediaRepo.findByIdAndAdoptablePetId(mediaId, petId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Media " + mediaId + " not found on pet " + petId));

        // Unset the previous primary (if any) and set the new one — same tx.
        mediaRepo.findByAdoptablePetIdAndIsPrimaryTrue(petId).ifPresent(prev -> {
            if (!prev.getId().equals(mediaId)) {
                prev.setPrimary(false);
                mediaRepo.save(prev);
            }
        });
        target.setPrimary(true);
        AdoptionMedia saved = mediaRepo.save(target);

        auditService.log(AuditTargetType.PET_LISTING, petId, actingUserId,
                "MEDIA_PRIMARY_SET", null,
                "{\"mediaId\":\"" + mediaId + "\"}");
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID actingUserId, UUID callerNgoId,
                       UUID petId, UUID mediaId) {
        loadForMutation(petId, callerNgoId);

        AdoptionMedia media = mediaRepo.findByIdAndAdoptablePetId(mediaId, petId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Media " + mediaId + " not found on pet " + petId));
        boolean wasPrimary = media.isPrimary();
        mediaRepo.delete(media);

        // If the deleted one was primary, promote the next image by displayOrder.
        if (wasPrimary) {
            mediaRepo.findByAdoptablePetIdOrderByDisplayOrderAsc(petId).stream()
                    .filter(m -> m.getMediaType() == MediaType.IMAGE)
                    .findFirst()
                    .ifPresent(next -> {
                        next.setPrimary(true);
                        mediaRepo.save(next);
                    });
        }

        auditService.log(AuditTargetType.PET_LISTING, petId, actingUserId,
                "MEDIA_DELETED", null,
                "{\"mediaId\":\"" + mediaId + "\"}");
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private AdoptablePet loadForMutation(UUID petId, UUID callerNgoId) {
        if (callerNgoId != null) {
            return petRepo.findByIdAndNgoId(petId, callerNgoId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "AdoptablePet " + petId + " not found for this NGO"));
        }
        return petRepo.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("AdoptablePet", petId));
    }

    private void ensurePetExists(UUID petId) {
        if (!petRepo.existsById(petId)) {
            throw new ResourceNotFoundException("AdoptablePet", petId);
        }
    }

    private MediaType classify(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("Uploaded file is empty.");
        }
        if (fileStorage.isImage(file)) return MediaType.IMAGE;
        if (fileStorage.isVideo(file)) return MediaType.VIDEO;
        throw new FileValidationException(
                "Invalid file type: " + file.getContentType() + ". Allowed: JPEG, PNG, MP4.");
    }

    private MediaResponse toResponse(AdoptionMedia m) {
        return MediaResponse.builder()
                .id(m.getId())
                .adoptablePetId(m.getAdoptablePetId())
                .fileUrl(m.getFileUrl())
                .fileName(m.getFileName())
                .mediaType(m.getMediaType() != null ? m.getMediaType().name() : null)
                .displayOrder(m.getDisplayOrder())
                .isPrimary(m.isPrimary())
                .uploadedAt(m.getUploadedAt())
                .build();
    }
}
