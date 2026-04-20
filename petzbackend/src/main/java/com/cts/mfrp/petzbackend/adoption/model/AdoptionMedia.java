package com.cts.mfrp.petzbackend.adoption.model;

import com.cts.mfrp.petzbackend.adoption.enums.MediaType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-2.2.3 — "Manage Pet Media Gallery".
 *
 * One row per uploaded photo/video attached to an {@link AdoptablePet}.
 * The NGO can drag-and-drop reorder (patch {@code displayOrder}) and pick
 * a primary image (exactly one {@code isPrimary=true} per pet, enforced
 * by {@code AdoptionMediaService}).
 */
@Entity
@Table(
        name = "adoption_media",
        indexes = {
                @Index(name = "idx_adoption_media_pet", columnList = "adoptable_pet_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "adoptable_pet_id", nullable = false)
    private UUID adoptablePetId;

    /** Public URL returned by {@code FileStorageService.storeFile}. */
    @Column(name = "file_url", nullable = false, length = 512)
    private String fileUrl;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 10)
    private MediaType mediaType;

    /** Sort key — lower number = earlier in the gallery. */
    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    /** Exactly one primary per pet; the service keeps this invariant. */
    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (this.uploadedAt == null) this.uploadedAt = LocalDateTime.now();
    }
}
