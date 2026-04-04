// ─────────────────────────────────────────────
// FILE 5: hospital/model/BlackoutDate.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.model;

import jakarta.persistence.*;
        import lombok.*;

        import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "blackout_dates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlackoutDate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "blackout_date", nullable = false)
    private LocalDate blackoutDate;

    @Column(name = "reason")
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

