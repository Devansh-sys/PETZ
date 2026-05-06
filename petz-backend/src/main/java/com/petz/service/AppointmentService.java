package com.petz.service;

import com.petz.dto.request.AppointmentRequest;
import com.petz.dto.response.SlotResponse;
import com.petz.entity.Appointment;
import com.petz.entity.Doctor;
import com.petz.enums.AppointmentStatus;
import com.petz.exception.BadRequestException;
import com.petz.exception.ResourceNotFoundException;
import com.petz.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final DoctorService doctorService;
    private final NotificationService notificationService;

    public Appointment book(Long userId, AppointmentRequest req) {
        Doctor doctor = doctorService.getById(req.getDoctorId());

        boolean slotTaken = appointmentRepo
                .existsByDoctorIdAndApptDateAndApptTimeAndStatusNot(
                        req.getDoctorId(), req.getApptDate(), req.getApptTime(),
                        AppointmentStatus.CANCELLED);
        if (slotTaken) throw new BadRequestException("Slot already booked.");

        Appointment a = new Appointment();
        a.setUserId(userId);
        a.setPetId(req.getPetId());
        a.setHospitalId(req.getHospitalId());
        a.setDoctorId(req.getDoctorId());
        a.setApptDate(req.getApptDate());
        a.setApptTime(req.getApptTime());
        a.setReason(req.getReason());
        a.setStatus(AppointmentStatus.PENDING);

        a = appointmentRepo.save(a);
        notificationService.notifyUser(userId,
                "Appointment Booked",
                "Your appointment on " + req.getApptDate() + " at " + req.getApptTime() + " is pending confirmation.",
                a.getId(), "APPOINTMENT");
        return a;
    }

    public Appointment updateStatus(Long id, String status, Long hospitalOwnerId) {
        Appointment a = getById(id);
        try {
            a.setStatus(AppointmentStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
        a = appointmentRepo.save(a);

        if (a.getStatus() == AppointmentStatus.CONFIRMED) {
            notificationService.notifyUser(a.getUserId(),
                    "Appointment Confirmed",
                    "Your appointment on " + a.getApptDate() + " has been confirmed.",
                    a.getId(), "APPOINTMENT");
        }
        return a;
    }

    public List<Appointment> getByUser(Long userId) {
        return appointmentRepo.findByUserId(userId);
    }

    public List<Appointment> getByHospital(Long hospitalId) {
        return appointmentRepo.findByHospitalId(hospitalId);
    }

    public Appointment getById(Long id) {
        return appointmentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    public Appointment cancel(Long id, Long userId) {
        Appointment a = getById(id);
        if (!a.getUserId().equals(userId)) throw new BadRequestException("Not your appointment.");
        if (a.getStatus() == AppointmentStatus.COMPLETED)
            throw new BadRequestException("Cannot cancel a completed appointment.");
        a.setStatus(AppointmentStatus.CANCELLED);
        return appointmentRepo.save(a);
    }

    public List<SlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorService.getById(doctorId);
        if (doctor.getScheduleStart() == null || doctor.getScheduleEnd() == null) {
            return List.of();
        }

        List<Appointment> booked = appointmentRepo
                .findByDoctorIdAndApptDateAndStatus(doctorId, date, AppointmentStatus.CONFIRMED);

        List<LocalTime> bookedTimes = booked.stream()
                .map(Appointment::getApptTime)
                .toList();

        int duration = doctor.getSlotDuration() != null ? doctor.getSlotDuration() : 30;
        List<SlotResponse> slots = new ArrayList<>();
        LocalTime current = doctor.getScheduleStart();

        while (!current.isAfter(doctor.getScheduleEnd().minusMinutes(duration))) {
            slots.add(new SlotResponse(current, !bookedTimes.contains(current)));
            current = current.plusMinutes(duration);
        }

        return slots;
    }
}
