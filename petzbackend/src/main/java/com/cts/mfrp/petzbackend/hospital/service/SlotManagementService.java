
// ─────────────────────────────────────────────
// FILE 21: hospital/service/SlotManagementService.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.hospital.dto.*;
import com.cts.mfrp.petzbackend.hospital.model.*;
import com.cts.mfrp.petzbackend.hospital.model.AppointmentSlot.BookingType;
import com.cts.mfrp.petzbackend.hospital.model.AppointmentSlot.SlotStatus;
import com.cts.mfrp.petzbackend.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotManagementService {

    private final AppointmentSlotRepository slotRepo;
    private final BlackoutDateRepository    blackoutRepo;
    private final HospitalRepository        hospitalRepo;
    private final DoctorRepository          doctorRepo;

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
        final Doctor finalDoctor = doctor;

        for (LocalDate date : dates) {
            if (blackoutRepo.existsByHospitalAndBlackoutDate(hospital, date)) continue;

            if (finalDoctor != null) {
                List<AppointmentSlot> overlap = slotRepo.findOverlappingSlots(
                        hospital, finalDoctor, date, req.getStartTime(), endTime);
                if (!overlap.isEmpty()) throw new IllegalStateException(
                        "Overlapping slot for doctor on " + date + " at " + req.getStartTime());
            }

            AppointmentSlot slot = AppointmentSlot.builder()
                    .hospital(hospital).doctor(finalDoctor)
                    .slotDate(date).startTime(req.getStartTime()).endTime(endTime)
                    .durationMinutes(req.getDurationMinutes())
                    .slotStatus(SlotStatus.AVAILABLE)
                    .bookingType(req.getBookingType() != null
                            ? BookingType.valueOf(req.getBookingType().toUpperCase())
                            : BookingType.ROUTINE)
                    .build();

            slotRepo.save(slot);
            created.add(toSlotResponse(slot));
        }
        return created;
    }

    // US-3.3.1 — Get slots for a date (user calendar view)
    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsForDate(UUID hospitalId, LocalDate date) {
        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Hospital not found: " + hospitalId));

        if (blackoutRepo.existsByHospitalAndBlackoutDate(hospital, date))
            return List.of(); // unavailable

        return slotRepo.findByHospitalAndSlotDate(hospital, date).stream()
                .map(this::toSlotResponse)
                .sorted(Comparator.comparing(SlotResponse::getStartTime))
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

        List<AppointmentSlot> toBlock = slotRepo
                .findAvailableSlotsByHospitalAndDate(hospital, req.getBlackoutDate());
        toBlock.forEach(s -> s.setSlotStatus(SlotStatus.BLOCKED));
        slotRepo.saveAll(toBlock);
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

        slotRepo.findByHospitalAndSlotDate(hospital, date).stream()
                .filter(s -> s.getSlotStatus() == SlotStatus.BLOCKED)
                .forEach(s -> s.setSlotStatus(SlotStatus.AVAILABLE));
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

        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Hospital not found: " + hospitalId));

        List<AppointmentSlot> slots = slotRepo
                .findByHospitalAndDateRange(hospital, from, to);

        if (doctorId != null) {
            slots = slots.stream()
                    .filter(s -> s.getDoctor() != null
                            && s.getDoctor().getId().equals(doctorId))
                    .collect(Collectors.toList());
        }

        Map<LocalDate, List<AppointmentSlot>> byDate = slots.stream()
                .collect(Collectors.groupingBy(AppointmentSlot::getSlotDate));

        return byDate.entrySet().stream().map(e -> {
                    List<AppointmentSlot> day = e.getValue();
                    long total     = day.size();
                    long booked    = day.stream().filter(s -> s.getSlotStatus() == SlotStatus.BOOKED).count();
                    long available = day.stream().filter(s -> s.getSlotStatus() == SlotStatus.AVAILABLE).count();
                    double pct = total > 0 ? Math.round((booked * 100.0 / total) * 10.0) / 10.0 : 0.0;
                    return SlotUtilizationResponse.builder()
                            .date(e.getKey()).totalSlots(total)
                            .bookedSlots(booked).availableSlots(available)
                            .utilizationPercent(pct).build();
                }).sorted(Comparator.comparing(SlotUtilizationResponse::getDate))
                .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private SlotResponse toSlotResponse(AppointmentSlot s) {
        return SlotResponse.builder()
                .id(s.getId())
                .hospitalId(s.getHospital().getId())
                .doctorId(s.getDoctor() != null ? s.getDoctor().getId() : null)
                .doctorName(s.getDoctor() != null ? s.getDoctor().getName() : null)
                .serviceId(s.getService() != null ? s.getService().getId() : null)
                .serviceName(s.getService() != null ? s.getService().getServiceName() : null)
                .slotDate(s.getSlotDate()).startTime(s.getStartTime())
                .endTime(s.getEndTime()).durationMinutes(s.getDurationMinutes())
                .slotStatus(s.getSlotStatus().name())
                .bookingType(s.getBookingType().name())
                .build();
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
