package com.cts.mfrp.petzbackend.rescue.model;

import com.cts.mfrp.petzbackend.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "case_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rescue_mission_id", nullable = false, unique = true)
    private RescueMission rescueMission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by", nullable = false)
    private User verifiedBy;

    @Column(nullable = false)
    private boolean flagged;

    @Column(name = "flag_notes", length = 1000)
    private String flagNotes;

    @Column(name = "audit_notes", length = 2000)
    private String auditNotes;

    @Column(name = "closed_at", nullable = false, updatable = false)
    private LocalDateTime closedAt;

    @PrePersist
    protected void onCreate() {
        this.closedAt = LocalDateTime.now();
    }
}
