package com.petz.service;

import com.petz.entity.Ngo;
import com.petz.exception.BadRequestException;
import com.petz.exception.ResourceNotFoundException;
import com.petz.repository.NgoRepository;
import com.petz.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NgoService {

    private final NgoRepository ngoRepo;
    private final FileStorageUtil fileStorage;

    public Ngo createOrUpdate(Long ownerUserId, Map<String, Object> body) {
        Ngo ngo = ngoRepo.findByOwnerUserId(ownerUserId).orElse(new Ngo());
        ngo.setOwnerUserId(ownerUserId);
        if (body.containsKey("name"))           ngo.setName((String) body.get("name"));
        if (body.containsKey("registrationNo")) ngo.setRegistrationNo((String) body.get("registrationNo"));
        if (body.containsKey("description"))    ngo.setDescription((String) body.get("description"));
        if (body.containsKey("city"))           ngo.setCity((String) body.get("city"));
        if (body.containsKey("address"))        ngo.setAddress((String) body.get("address"));
        if (body.containsKey("phone"))          ngo.setPhone((String) body.get("phone"));
        if (body.containsKey("email"))          ngo.setEmail((String) body.get("email"));
        return ngoRepo.save(ngo);
    }

    public Ngo getByOwner(Long ownerUserId) {
        return ngoRepo.findByOwnerUserId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found for user " + ownerUserId));
    }

    public Ngo getById(Long id) {
        return ngoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found: " + id));
    }

    public List<Ngo> getAll() {
        return ngoRepo.findByIsActive(true);
    }

    // Admin-specific: returns only APPROVED (active) NGOs for the management page.
    // Pending NGOs are handled separately via the pending-approvals endpoint.
    public List<Ngo> getAllForAdmin() {
        return ngoRepo.findByIsActive(true);
    }

    public List<Ngo> getUnverified() {
        return ngoRepo.findByIsVerified(false);
    }

    public Ngo uploadLogo(Long ownerUserId, MultipartFile file) throws IOException {
        Ngo ngo = getByOwner(ownerUserId);
        String url = fileStorage.store(file, "ngo-logos");
        ngo.setLogoUrl(url);
        return ngoRepo.save(ngo);
    }

    public Ngo verify(Long id, boolean verified) {
        Ngo ngo = getById(id);
        ngo.setIsVerified(verified);
        return ngoRepo.save(ngo);
    }

    public Ngo toggleActive(Long id, boolean active) {
        Ngo ngo = getById(id);
        ngo.setIsActive(active);
        return ngoRepo.save(ngo);
    }
}
