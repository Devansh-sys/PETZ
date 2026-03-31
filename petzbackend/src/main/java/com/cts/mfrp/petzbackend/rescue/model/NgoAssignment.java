// ============================================================
// FILE 3: rescue/model/NgoAssignment.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ngo_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NgoAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "sos_report_id", nullable = false)
    private UUID sosReportId;

    @Column(name = "ngo_id", nullable = false)
    private UUID ngoId;

    @Column(name = "volunteer_id", nullable = false)
    private UUID volunteerId;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "arrival_at")
    private LocalDateTime arrivalAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_status", nullable = false)
    private AssignmentStatus assignmentStatus;

    public enum AssignmentStatus {
        PENDING, ACCEPTED, DECLINED, ARRIVED
    }
}
