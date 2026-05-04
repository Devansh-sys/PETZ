package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.hospital.dto.*;
import com.cts.mfrp.petzbackend.hospital.model.*;
import com.cts.mfrp.petzbackend.hospital.model.Appointment.BookingType;
import com.cts.mfrp.petzbackend.hospital.model.Appointment.SlotStatus;
import com.cts.mfrp.petzbackend.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotManagementService {

    private final AppointmentRepository    appointmentRepo;
    private final BlackoutDateRepository   blackoutRepo;
    private final HospitalRepository       hospitalRepo;
    private final DoctorRepository         doctorRepo;

    // US-3.3.1 — Create appointment slots (single or recurring)
    @Transactional
    public List<SlotResponse> createSlots(SlotCreateRequest req) {
        Hospital hospital = hospitalRepo.findById(req.getHospitalId())
                .orElseThrow(() -> new NoSuchElementException(
                        "Hospital not found: " + req.getHospitalId()));

        Doctor doctor = null;
        if (req.getDoctorId() != null) {
            doctor = doctorRepo.findById(req.getDoctorId())
                    .orElseThrow(() -> new NoSuchElementException(
                            "Doctor not found: " + req.getDoctorId()));
        }

        List<LocalDate> dates = new ArrayList<>();
        if (Boolean.TRUE.equals(req.getRecurring()) && req.getRecurringEnd() != null) {
            LocalDate current = req.getSlotDate();
            Set<DayOfWeek> allowed = parseRecurringDays(req.getRecurringDays());
            while (!current.isAfter(req.getRecurringEnd())) {
                if (allowed.isEmpty() || allowed.contains(current.getDayOfWeek()))
                    dates.add(current);
                current = current.plusDays(1);
            }
        } else {
            dates.add(req.getSlotDate());
        }

        List<SlotResponse> created = new ArrayList<>();
        LocalTime endTime = req.getStartTime().plusMinutes(req.getDurationMinutes());
        final UUID finalDoctorId   = doctor != null ? doctor.getId()   : null;
        final String finalDoctorName = doctor != null ? doctor.getName() : null;

        for (LocalDate date : dates) {
            if (blackoutRepo.existsByHospitalAndBlackoutDate(hospital, date)) continue;

            if (finalDoctorId != null) {
                List<Appointment> overlap = appointmentRepo.findOverlappingAppointments(
                        req.getHospitalId(), finalDoctorId, date, req.getStartTime(), endTime);
                if (!overlap.isEmpty()) throw new IllegalStateException(
                        "Overlapping slot for doctor on " + date + " at " + req.getStartTime());
            }

            Appointment appointment = new Appointment();
            appointment.setHospitalId(req.getHospitalId());
            appointment.setDoctorId(finalDoctorId);
            appointment.setAppointmentDate(date);
            appointment.setAppointmentTime(req.getStartTime());
            appointment.setEndTime(endTime);
            appointment.setDurationMinutes(req.getDurationMinutes());
            appointment.setSlotStatus(SlotStatus.AVAILABLE);
            appointment.setBookingType(req.getBookingType() != null
                    ? BookingType.valueOf(req.getBookingType().toUpperCase())
                    : BookingType.ROUTINE);
            appointment.setCreatedAt(LocalDateTime.now());

            appointmentRepo.save(appointment);
            created.add(toSlotResponse(appointment, finalDoctorName));
        }
        return created;
    }

    // US-3.3.1 — Get slots for a date (user calendar view)
    // Fetches all hospital slots first; auto-generates if none exist; then filters by doctor.
    // Keeping the hospital-level fetch as the source of truth avoids auto-generation
    // conflicts when only one doctor has no slots but others do on the same date.
    @Transactional
    public List<SlotResponse> getSlotsForDate(UUID hospitalId, LocalDate date, UUID doctorId) {
        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Hospital not found: " + hospitalId));

        if (blackoutRepo.existsByHospitalAndBlackoutDate(hospital, date))
            return List.of();

        List<Appointment> existing = appointmentRepo
                .findByHospitalIdAndAppointmentDateOrderByAppointmentTimeAsc(hospitalId, date);

        List<SlotResponse> slots;
        if (!existing.isEmpty()) {
            slots = existing.stream()
                    .map(a -> toSlotResponse(a, getDoctorName(a.getDoctorId())))
                    .collect(Collectors.toList());
        } else {
            // No slots for this hospital on this date — generate for all active doctors
            slots = generateAndPersistSlots(hospital, date);
        }

        // Filter to the requested doctor's slots
        if (doctorId != null) {
            final UUID fid = doctorId;
            slots = slots.stream()
                    .filter(s -> fid.equals(s.getDoctorId()))
                    .collect(Collectors.toList());
        }

        return slots;
    }

    /** Auto-generates slots for a date with no pre-seeded data.
     *  Each doctor gets 4 slots in their assigned shift:
     *  odd  last UUID byte → morning   09:00–11:00
     *  even last UUID byte → afternoon 14:00–16:00 */
    private List<SlotResponse> generateAndPersistSlots(Hospital hospital, LocalDate date) {
        List<Doctor> doctors = doctorRepo
                .findByHospitalIdAndIsActiveOrderByNameAsc(hospital.getId(), true);
        if (doctors.isEmpty()) return List.of();

        List<LocalTime[]> morningSlots = List.of(
            new LocalTime[]{ LocalTime.of(9,  0), LocalTime.of(9,  30) },
            new LocalTime[]{ LocalTime.of(9, 30), LocalTime.of(10,  0) },
            new LocalTime[]{ LocalTime.of(10, 0), LocalTime.of(10, 30) },
            new LocalTime[]{ LocalTime.of(10,30), LocalTime.of(11,  0) }
        );
        List<LocalTime[]> afternoonSlots = List.of(
            new LocalTime[]{ LocalTime.of(14,  0), LocalTime.of(14, 30) },
            new LocalTime[]{ LocalTime.of(14, 30), LocalTime.of(15,  0) },
            new LocalTime[]{ LocalTime.of(15,  0), LocalTime.of(15, 30) },
            new LocalTime[]{ LocalTime.of(15, 30), LocalTime.of(16,  0) }
        );

        List<Appointment> toSave = new ArrayList<>();
        for (Doctor doctor : doctors) {
            // Use the least-significant byte of the UUID to assign shift
            long lsb = doctor.getId().getLeastSignificantBits();
            List<LocalTime[]> times = (lsb % 2 != 0) ? morningSlots : afternoonSlots;
            for (LocalTime[] t : times) {
                Appointment a = new Appointment();
                a.setHospitalId(hospital.getId());
                a.setDoctorId(doctor.getId());
                a.setAppointmentDate(date);
                a.setAppointmentTime(t[0]);
                a.setEndTime(t[1]);
                a.setDurationMinutes(30);
                a.setSlotStatus(SlotStatus.AVAILABLE);
                a.setBookingType(BookingType.ROUTINE);
                toSave.add(a);
            }
        }

        List<Appointment> saved = appointmentRepo.saveAll(toSave);
        return saved.stream()
                .map(a -> toSlotResponse(a, getDoctorName(a.getDoctorId())))
                .collect(Collectors.toList());
    }

    // US-3.3.2 — Add blackout date
    @Transactional
    public void addBlackoutDate(BlackoutDateRequest req) {
        Hospital hospital = hospitalRepo.findById(req.getHospitalId())
                .orElseThrow(() -> new NoSuchElementException(
                        "Hospital not found: " + req.getHospitalId()));

        if (blackoutRepo.existsByHospitalAndBlackoutDate(hospital, req.getBlackoutDate()))
            throw new IllegalStateException(
                    "Blackout date already exists: " + req.getBlackoutDate());

        blackoutRepo.save(BlackoutDate.builder()
                .hospital(hospital).blackoutDate(req.getBlackoutDate())
                .reason(req.getReason()).build());

        List<Appointment> toBlock = appointmentRepo
                .findByHospitalIdAndAppointmentDateAndSlotStatus(
                        req.getHospitalId(), req.getBlackoutDate(), SlotStatus.AVAILABLE);
        toBlock.forEach(a -> a.setSlotStatus(SlotStatus.BLOCKED));
        appointmentRepo.saveAll(toBlock);
    }

    // US-3.3.2 — Remove blackout date
    @Transactional
    public void removeBlackoutDate(UUID hospitalId, LocalDate date) {
        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Hospital not found: " + hospitalId));

        BlackoutDate blackout = blackoutRepo
                .findByHospitalAndBlackoutDate(hospital, date)
                .orElseThrow(() -> new NoSuchElementException(
                        "Blackout date not found: " + date));

        blackoutRepo.delete(blackout);

        appointmentRepo.findByHospitalIdAndAppointmentDateOrderByAppointmentTimeAsc(hospitalId, date)
                .stream()
                .filter(a -> a.getSlotStatus() == SlotStatus.BLOCKED)
                .forEach(a -> a.setSlotStatus(SlotStatus.AVAILABLE));
    }

    // US-3.3.2 — Get all blackout dates
    public List<LocalDate> getBlackoutDates(UUID hospitalId) {
        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Hospital not found: " + hospitalId));
        return blackoutRepo.findByHospital(hospital).stream()
                .map(BlackoutDate::getBlackoutDate)
                .sorted().collect(Collectors.toList());
    }

    // US-3.3.3 — View slot utilization
    @Transactional(readOnly = true)
    public List<SlotUtilizationResponse> getUtilization(
            UUID hospitalId, LocalDate from, LocalDate to, UUID doctorId) {

        hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Hospital not found: " + hospitalId));

        List<Appointment> appointments = appointmentRepo
                .findByHospitalIdAndAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(
                        hospitalId, from, to);

        if (doctorId != null) {
            appointments = appointments.stream()
                    .filter(a -> doctorId.equals(a.getDoctorId()))
                    .collect(Collectors.toList());
        }

        Map<LocalDate, List<Appointment>> byDate = appointments.stream()
                .collect(Collectors.groupingBy(Appointment::getAppointmentDate));

        return byDate.entrySet().stream().map(e -> {
                    List<Appointment> day = e.getValue();
                    long total     = day.size();
                    long booked    = day.stream().filter(a -> a.getSlotStatus() == SlotStatus.BOOKED).count();
                    long available = day.stream().filter(a -> a.getSlotStatus() == SlotStatus.AVAILABLE).count();
                    double pct = total > 0 ? Math.round((booked * 100.0 / total) * 10.0) / 10.0 : 0.0;
                    return SlotUtilizationResponse.builder()
                            .date(e.getKey()).totalSlots(total)
                            .bookedSlots(booked).availableSlots(available)
                            .utilizationPercent(pct).build();
                }).sorted(Comparator.comparing(SlotUtilizationResponse::getDate))
                .collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private SlotResponse toSlotResponse(Appointment a, String doctorName) {
        return SlotResponse.builder()
                .id(a.getId())
                .hospitalId(a.getHospitalId())
                .doctorId(a.getDoctorId())
                .doctorName(doctorName)
                .serviceId(null)
                .serviceName(a.getServiceType())
                .slotDate(a.getAppointmentDate())
                .startTime(a.getAppointmentTime())
                .endTime(a.getEndTime())
                .durationMinutes(a.getDurationMinutes())
                .slotStatus(a.getSlotStatus() != null ? a.getSlotStatus().name() : null)
                .bookingType(a.getBookingType() != null ? a.getBookingType().name() : null)
                .available(a.getSlotStatus() == null || a.getSlotStatus() == Appointment.SlotStatus.AVAILABLE)
                .build();
    }

    private String getDoctorName(UUID doctorId) {
        if (doctorId == null) return null;
        return doctorRepo.findById(doctorId).map(Doctor::getName).orElse(null);
    }

    private Set<DayOfWeek> parseRecurringDays(String days) {
        if (days == null || days.isBlank()) return Set.of();
        Set<DayOfWeek> result = new HashSet<>();
        for (String d : days.split(",")) {
            try { result.add(DayOfWeek.valueOf(d.trim().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        return result;
    }
}