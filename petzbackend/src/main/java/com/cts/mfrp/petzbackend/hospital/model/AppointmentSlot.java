
// ─────────────────────────────────────────────
// FILE 4: hospital/model/AppointmentSlot.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "appointment_slots", indexes = {
        @Index(name = "idx_slot_hospital_date", columnList = "hospital_id, slot_date"),
        @Index(name = "idx_slot_doctor_date",   columnList = "doctor_id, slot_date")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppointmentSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private HospitalService service;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_status", nullable = false)
    private SlotStatus slotStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type", nullable = false)
    private BookingType bookingType;

    @Column(name = "is_locked")
    private boolean isLocked;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.slotStatus == null)  this.slotStatus  = SlotStatus.AVAILABLE;
        if (this.bookingType == null) this.bookingType = BookingType.ROUTINE;
    }

    public enum SlotStatus  { AVAILABLE, BOOKED, BLOCKED, LOCKED }
    public enum BookingType { ROUTINE, EMERGENCY }
}

