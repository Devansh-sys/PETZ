package com.petz.entity;

import com.petz.enums.AdoptionStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_applications")
@Data
@NoArgsConstructor
public class AdoptionApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "animal_id", nullable = false)
    private Long animalId;

    @Column(name = "applicant_id", nullable = false)
    private Long applicantId;

    @Column(name = "ngo_id", nullable = false)
    private Long ngoId;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(name = "housing_type", length = 50)
    private String housingType;

    @Column(name = "has_other_pets")
    private Boolean hasOtherPets = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AdoptionStatus status = AdoptionStatus.PENDING;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
