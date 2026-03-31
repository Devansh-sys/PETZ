
// ============================================================
// FILE 4: rescue/model/OnSiteAssessment.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "on_site_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnSiteAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sos_report_id", nullable = false, unique = true)
    private UUID sosReportId;

    @Column(name = "volunteer_id", nullable = false)
    private UUID volunteerId;

    @Column(name = "animal_condition", nullable = false)
    private String animalCondition;

    @Column(name = "injury_description", columnDefinition = "TEXT")
    private String injuryDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision", nullable = false)
    private AssessmentDecision decision;

    @Column(name = "decision_justification", columnDefinition = "TEXT")
    private String decisionJustification;

    @Column(name = "assessed_at", nullable = false)
    private LocalDateTime assessedAt;

    public enum AssessmentDecision {
        TRANSPORT_TO_HOSPITAL, RELEASE, CANNOT_LOCATE
    }
}
