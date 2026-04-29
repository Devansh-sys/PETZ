package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.hospital.dto.ServiceManagementDtos.ServiceCreateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.ServiceManagementDtos.ServiceUpdateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.ServiceResponse;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalRepository;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * US-3.2.2 — "Manage Hospital Services".
 *
 *   AC#1 CRUD on services      → add / list / update / delete
 *   AC#2 name + type + price   → ServiceCreateRequest / ServiceUpdateRequest
 *   AC#3 reflected immediately → @Transactional writes, plain JPA reads —
 *                                other read endpoints (discovery, profile)
 *                                see the change on the next request since
 *                                they query the same table.
 */
@Service
@RequiredArgsConstructor
public class ServiceCatalogService {

    private final HospitalRepository        hospitalRepo;
    private final HospitalServiceRepository serviceRepo;

    @Transactional(readOnly = true)
    public List<ServiceResponse> listServices(UUID hospitalId) {
        ensureHospitalExists(hospitalId);
        return serviceRepo.findByHospital_IdOrderByServiceNameAsc(hospitalId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceResponse addService(UUID hospitalId, ServiceCreateRequest req) {
        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", hospitalId));

        HospitalService entity = HospitalService.builder()
                .hospital(hospital)
                .serviceName(req.getServiceName())
                .serviceType(parseServiceType(req.getServiceType()))
                .price(req.getPrice())
                .build();

        return toResponse(serviceRepo.save(entity));
    }

    @Transactional
    public ServiceResponse updateService(UUID hospitalId, UUID serviceId, ServiceUpdateRequest req) {
        HospitalService svc = serviceRepo.findByIdAndHospital_Id(serviceId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service " + serviceId + " not found at hospital " + hospitalId));

        if (req.getServiceName() != null) svc.setServiceName(req.getServiceName());
        if (req.getServiceType() != null) svc.setServiceType(parseServiceType(req.getServiceType()));
        if (req.getPrice() != null)       svc.setPrice(req.getPrice());

        return toResponse(serviceRepo.save(svc));
    }

    @Transactional
    public void deleteService(UUID hospitalId, UUID serviceId) {
        HospitalService svc = serviceRepo.findByIdAndHospital_Id(serviceId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service " + serviceId + " not found at hospital " + hospitalId));
        serviceRepo.delete(svc);
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private void ensureHospitalExists(UUID hospitalId) {
        if (!hospitalRepo.existsById(hospitalId)) {
            throw new ResourceNotFoundException("Hospital", hospitalId);
        }
    }

    private HospitalService.ServiceType parseServiceType(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("serviceType is required");
        }
        try {
            return HospitalService.ServiceType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            String allowed = Stream.of(HospitalService.ServiceType.values())
                    .map(Enum::name).collect(Collectors.joining(", "));
            throw new IllegalArgumentException(
                    "Invalid serviceType '" + raw + "'. Allowed: " + allowed);
        }
    }

    private ServiceResponse toResponse(HospitalService s) {
        return ServiceResponse.builder()
                .id(s.getId())
                .hospitalId(s.getHospital() != null ? s.getHospital().getId() : null)
                .serviceName(s.getServiceName())
                .description(s.getServiceName())
                .serviceType(s.getServiceType() != null ? s.getServiceType().name() : null)
                .price(s.getPrice())
                .emergencyDedicated(s.getServiceType() == HospitalService.ServiceType.EMERGENCY)
                .active(true)
                .build();
    }
}
