package com.cts.mfrp.petzbackend.hospital.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Patient pet registered by a user during appointment booking.
 * Stored in patient_pets — separate from the adoption pets table.
 * Visible to hospital/vet staff via appointment records.
 */
@Entity
@Table(name = "patient_pets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientPet {

    @Id
    @Column(updatable = false, nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column
    private String species;

    @Column
    private String gender;

    @Column
    private String breed;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null)       this.id = UUID.randomUUID();
        if (this.gender == null)   this.gender = "UNKNOWN";
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }
}
