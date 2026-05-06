package com.petz.service;

import com.petz.dto.request.DoctorRequest;
import com.petz.entity.Doctor;
import com.petz.exception.ResourceNotFoundException;
import com.petz.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepo;

    public Doctor addDoctor(Long hospitalId, DoctorRequest req) {
        Doctor d = new Doctor();
        d.setHospitalId(hospitalId);
        d.setName(req.getName());
        d.setSpecialization(req.getSpecialization());
        d.setPhone(req.getPhone());
        d.setEmail(req.getEmail());
        d.setScheduleStart(req.getScheduleStart());
        d.setScheduleEnd(req.getScheduleEnd());
        if (req.getSlotDuration() != null) d.setSlotDuration(req.getSlotDuration());
        return doctorRepo.save(d);
    }

    public Doctor updateDoctor(Long id, DoctorRequest req) {
        Doctor d = getById(id);
        if (req.getName() != null)           d.setName(req.getName());
        if (req.getSpecialization() != null) d.setSpecialization(req.getSpecialization());
        if (req.getPhone() != null)          d.setPhone(req.getPhone());
        if (req.getEmail() != null)          d.setEmail(req.getEmail());
        if (req.getScheduleStart() != null)  d.setScheduleStart(req.getScheduleStart());
        if (req.getScheduleEnd() != null)    d.setScheduleEnd(req.getScheduleEnd());
        if (req.getSlotDuration() != null)   d.setSlotDuration(req.getSlotDuration());
        return doctorRepo.save(d);
    }

    public List<Doctor> getByHospital(Long hospitalId) {
        return doctorRepo.findByHospitalIdAndIsActive(hospitalId, true);
    }

    public Doctor getById(Long id) {
        return doctorRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
    }

    public void delete(Long id) {
        Doctor d = getById(id);
        d.setIsActive(false);
        doctorRepo.save(d);
    }
}
