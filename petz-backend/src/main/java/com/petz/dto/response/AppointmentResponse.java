package com.petz.dto.response;

import com.petz.entity.Appointment;
import com.petz.entity.Doctor;
import com.petz.entity.Hospital;
import com.petz.entity.Pet;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class AppointmentResponse {

    private Long id;
    private Long userId;
    private Long petId;
    private Long hospitalId;
    private Long doctorId;
    private LocalDate apptDate;
    private LocalTime apptTime;
    private String reason;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Enriched fields
    private String hospitalName;
    private String hospitalCity;
    private String hospitalAddress;
    private String hospitalPhone;
    private String doctorName;
    private String doctorSpecialization;
    private String petName;
    private String petSpecies;
    private String petBreed;

    public static AppointmentResponse from(Appointment a, Hospital h, Doctor d, Pet p) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setUserId(a.getUserId());
        r.setPetId(a.getPetId());
        r.setHospitalId(a.getHospitalId());
        r.setDoctorId(a.getDoctorId());
        r.setApptDate(a.getApptDate());
        r.setApptTime(a.getApptTime());
        r.setReason(a.getReason());
        r.setStatus(a.getStatus() != null ? a.getStatus().name() : null);
        r.setNotes(a.getNotes());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());

        if (h != null) {
            r.setHospitalName(h.getName());
            r.setHospitalCity(h.getCity());
            r.setHospitalAddress(h.getAddress());
            r.setHospitalPhone(h.getPhone());
        }
        if (d != null) {
            r.setDoctorName(d.getName());
            r.setDoctorSpecialization(d.getSpecialization());
        }
        if (p != null) {
            r.setPetName(p.getName());
            r.setPetSpecies(p.getSpecies());
            r.setPetBreed(p.getBreed());
        }
        return r;
    }
}
