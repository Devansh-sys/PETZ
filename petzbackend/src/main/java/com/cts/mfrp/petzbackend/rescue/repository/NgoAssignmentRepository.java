// ============================================================
// FILE 8: rescue/repository/NgoAssignmentRepository.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface NgoAssignmentRepository extends JpaRepository<NgoAssignment, UUID> {

    Optional<NgoAssignment> findBySosReportIdAndAssignmentStatus(
            UUID sosReportId, AssignmentStatus status);

    Optional<NgoAssignment> findBySosReportIdAndVolunteerId(
            UUID sosReportId, UUID volunteerId);
}
