// ─────────────────────────────────────────────
// FILE 2: hospital/model/HospitalService.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "hospital_services")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HospitalService {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    public enum ServiceType {
        CONSULTATION, SURGERY, VACCINATION, EMERGENCY, GROOMING, DIAGNOSTICS
    }
}
