package com.petz.service;

import com.petz.entity.Hospital;
import com.petz.exception.ResourceNotFoundException;
import com.petz.repository.HospitalRepository;
import com.petz.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepo;
    private final FileStorageUtil fileStorage;

    public Hospital createOrUpdate(Long ownerUserId, Map<String, Object> body) {
        Hospital h = hospitalRepo.findByOwnerUserId(ownerUserId).orElse(new Hospital());
        h.setOwnerUserId(ownerUserId);
        if (body.containsKey("name"))    h.setName((String) body.get("name"));
        if (body.containsKey("address")) h.setAddress((String) body.get("address"));
        if (body.containsKey("city"))    h.setCity((String) body.get("city"));
        if (body.containsKey("phone"))   h.setPhone((String) body.get("phone"));
        if (body.containsKey("email"))   h.setEmail((String) body.get("email"));
        if (body.containsKey("latitude") && body.get("latitude") != null) {
            h.setLatitude(new BigDecimal(body.get("latitude").toString()));
        }
        if (body.containsKey("longitude") && body.get("longitude") != null) {
            h.setLongitude(new BigDecimal(body.get("longitude").toString()));
        }
        return hospitalRepo.save(h);
    }

    public Hospital getByOwner(Long ownerUserId) {
        return hospitalRepo.findByOwnerUserId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found for user " + ownerUserId));
    }

    public Hospital getById(Long id) {
        return hospitalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found: " + id));
    }

    public List<Hospital> getAll() {
        return hospitalRepo.findByIsActive(true);
    }

    // Admin-specific: returns only APPROVED (active) hospitals for the management page.
    // Pending hospitals are handled separately via the pending-approvals endpoint.
    public List<Hospital> getAllForAdmin() {
        return hospitalRepo.findByIsActive(true);
    }

    public List<Hospital> getByCity(String city) {
        return hospitalRepo.findByCityAndIsActive(city, true);
    }

    public Hospital uploadLogo(Long ownerUserId, MultipartFile file) throws IOException {
        Hospital h = getByOwner(ownerUserId);
        String url = fileStorage.store(file, "hospital-logos");
        h.setLogoUrl(url);
        return hospitalRepo.save(h);
    }

    public Hospital toggleActive(Long id, boolean active) {
        Hospital h = getById(id);
        h.setIsActive(active);
        return hospitalRepo.save(h);
    }
}
