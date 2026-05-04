package com.cts.mfrp.petzbackend.hospital.model;

import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Represents a veterinary appointment booked by a pet owner.
 * Lifecycle transitions are managed by Epic 3.5 (US-3.5.1 – US-3.5.5).
 * Primary structure based on advanced slot management with legacy constraints integrated.
 */
@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pet_id", nullable = false)
    private UUID petId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "doctor_id", nullable = false)
    private UUID doctorId;

    @Column(name = "slot_id", nullable = false)
    private UUID slotId;

    @Column(name = "service_type")
    private String serviceType;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_status")
    private SlotStatus slotStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type")
    private BookingType bookingType;

    @Column(name = "is_locked")
    private boolean isLocked;

    /**
     * US-3.4.2 — slot-lock expiry timestamp. While slotStatus=LOCKED and
     * lockedUntil is in the future, the slot is held for a pending booking.
     * A scheduled sweeper flips expired locks back to AVAILABLE.
     */
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    /** Optimistic-locking guard for concurrent booking attempts (US-3.4.2). */
    @Version
    @Column(name = "version")
    private Long version;

    /**
     * US-3.4.5 — link to the originating SOS report when the appointment was
     * booked via the rescue flow. Null for regular user-driven bookings.
     */
    @Column(name = "sos_report_id")
    private UUID sosReportId;

    @Column(name = "clinical_notes")
    private String clinicalNotes;           // Populated on US-3.5.4

    @Column(name = "no_show_count")
    private Integer noShowCount;                // Incremented on US-3.5.5

    @Column(name = "cancellation_policy_hours")
    private Integer cancellationPolicyHours;    // Hospital-defined window for US-3.5.1 / US-3.5.2

    @Column(name = "attended_at")
    private LocalDateTime attendedAt;       // US-3.5.3

    @Column(name = "completed_at")
    private LocalDateTime completedAt;      // US-3.5.4

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;      // US-3.5.1

    @Column(name = "rescheduled_at")
    private LocalDateTime rescheduledAt;    // US-3.5.2

    @Column(name = "cancellation_reason")
    private String cancellationReason;      // US-3.5.1

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Internal Enums from Snippet 2
    public enum SlotStatus  { AVAILABLE, BOOKED, BLOCKED, LOCKED }
    public enum BookingType { ROUTINE, EMERGENCY }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        // Default statuses from Snippet 2
        if (this.slotStatus == null) this.slotStatus  = SlotStatus.AVAILABLE;
        if (this.bookingType == null) this.bookingType = BookingType.ROUTINE;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Appointment() {}

    // ── Getters & Setters ──────────────────────────────────────────────

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPetId() { return petId; }
    public void setPetId(UUID petId) { this.petId = petId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getHospitalId() { return hospitalId; }
    public void setHospitalId(UUID hospitalId) { this.hospitalId = hospitalId; }

    public UUID getDoctorId() { return doctorId; }
    public void setDoctorId(UUID doctorId) { this.doctorId = doctorId; }

    public UUID getSlotId() { return slotId; }
    public void setSlotId(UUID slotId) { this.slotId = slotId; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public SlotStatus getSlotStatus() { return slotStatus; }
    public void setSlotStatus(SlotStatus slotStatus) { this.slotStatus = slotStatus; }

    public BookingType getBookingType() { return bookingType; }
    public void setBookingType(BookingType bookingType) { this.bookingType = bookingType; }

    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { isLocked = locked; }

    public LocalDateTime getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(LocalDateTime lockedUntil) { this.lockedUntil = lockedUntil; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public UUID getSosReportId() { return sosReportId; }
    public void setSosReportId(UUID sosReportId) { this.sosReportId = sosReportId; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public Integer getNoShowCount() { return noShowCount; }
    public void setNoShowCount(Integer noShowCount) { this.noShowCount = noShowCount; }

    public Integer getCancellationPolicyHours() { return cancellationPolicyHours; }
    public void setCancellationPolicyHours(Integer cancellationPolicyHours) { this.cancellationPolicyHours = cancellationPolicyHours; }

    public LocalDateTime getAttendedAt() { return attendedAt; }
    public void setAttendedAt(LocalDateTime attendedAt) { this.attendedAt = attendedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public LocalDateTime getRescheduledAt() { return rescheduledAt; }
    public void setRescheduledAt(LocalDateTime rescheduledAt) { this.rescheduledAt = rescheduledAt; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}