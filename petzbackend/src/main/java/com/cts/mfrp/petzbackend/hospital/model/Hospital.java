// ─────────────────────────────────────────────
// FILE 1: hospital/model/Hospital.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "hospitals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "operating_hours")
    private String operatingHours;

    /**
     * US-3.2.4 AC#1 — structured per-day operating hours (JSON).
     * Shape: {"MON":{"open":"09:00","close":"17:00","closed":false}, ...}.
     * The plain-text {@code operatingHours} column above is kept as a
     * human-readable summary derived from this JSON, so existing read
     * endpoints keep working unchanged.
     */
    @Lob
    @Column(name = "operating_hours_json", columnDefinition = "TEXT")
    private String operatingHoursJson;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified;

    @Column(name = "active", nullable = false, columnDefinition = "bit(1) default 1")
    @Builder.Default
    private boolean active = true;

    @Column(name = "emergency_ready", nullable = false)
    private boolean emergencyReady;

    @Column(name = "is_open_now")
    private boolean isOpenNow;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<HospitalService> services = new ArrayList<>();

    @OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Doctor> doctors = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
