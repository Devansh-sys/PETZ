package com.cts.mfrp.petzbackend.hospital.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pet_id", nullable = false)
    private UUID petId;

    @Column(name = "appointment_id", nullable = false, unique = true)
    private UUID appointmentId;

    @Column
    private String diagnosis;

    @Column
    private String treatment;

    @Column(name = "next_visit_date")
    private LocalDate nextVisitDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
