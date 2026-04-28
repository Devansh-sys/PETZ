package com.cts.mfrp.petzbackend.hospital.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", insertable = false, updatable = false)
    private Hospital hospital;

    @Column(name = "name")
    private String name;

    @Column(name = "specialization")
    private String specialization;

    @Column(name = "contact_phone")
    private String contactPhone;
    @Column
    private String availability;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    /**
     * US-3.2.3 AC#3 — "Linked to services".
     * A doctor can offer multiple services and a service can be offered
     * by multiple doctors. Backed by a join table {@code doctor_services}
     * with (doctor_id, service_id) pairs.
     */
    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "doctor_services",
            joinColumns = @JoinColumn(name = "doctor_id"),
            inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    @Builder.Default
    private Set<HospitalService> services = new HashSet<>();
}
