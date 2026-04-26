package com.cts.mfrp.petzbackend.hospital.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Pet entity — minimal model for US-3.4.3 "Select Pet for Appointment".
 * Owner-to-pet relationship via userId FK.
 *
 * Created as part of Epic 3.4 Appointment Booking; can be enriched
 * later (photo URL, vaccination records, medical history, etc.) when
 * a dedicated Pet epic lands.
 */
@Entity
@Table(name = "pets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    /** Owner of the pet (FK to users.id). */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    /** e.g. DOG, CAT, BIRD — kept as free-text for flexibility. */
    @Column
    private String species;

    @Column
    private String breed;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }
}
