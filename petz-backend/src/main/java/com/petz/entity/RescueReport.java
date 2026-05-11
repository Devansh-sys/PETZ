package com.petz.entity;

import com.petz.enums.Criticality;
import com.petz.enums.RescueStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_reports")
@Data
@NoArgsConstructor
public class RescueReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(name = "assigned_ngo")
    private Long assignedNgo;

    @Column(name = "animal_type", length = 50)
    private String animalType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(length = 300)
    private String address;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RescueStatus status = RescueStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Criticality criticality = Criticality.MEDIUM;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    /** Comma-separated NGO IDs that have already declined or timed out — excluded from reassignment */
    @Column(name = "declined_ngo_ids", columnDefinition = "TEXT")
    private String declinedNgoIds;

    @CreationTimestamp
    @Column(name = "reported_at", updatable = false)
    private LocalDateTime reportedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
