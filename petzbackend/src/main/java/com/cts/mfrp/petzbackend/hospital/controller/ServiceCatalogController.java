package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.ServiceManagementDtos.ServiceCreateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.ServiceManagementDtos.ServiceUpdateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.ServiceResponse;
import com.cts.mfrp.petzbackend.hospital.service.ServiceCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * US-3.2.2 — "Manage Hospital Services" (CRUD with pricing).
 *
 *   GET    /api/v1/hospitals/{hospitalId}/services
 *   POST   /api/v1/hospitals/{hospitalId}/services
 *   PUT    /api/v1/hospitals/{hospitalId}/services/{serviceId}
 *   DELETE /api/v1/hospitals/{hospitalId}/services/{serviceId}
 */
@RestController
@RequestMapping("/api/v1/hospitals/{hospitalId}/services")
@RequiredArgsConstructor
public class ServiceCatalogController {

    private final ServiceCatalogService catalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> list(
            @PathVariable UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Services fetched.", catalogService.listServices(hospitalId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> add(
            @PathVariable UUID hospitalId,
            @Valid @RequestBody ServiceCreateRequest body) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Service added.", catalogService.addService(hospitalId, body)));
    }

    @PutMapping("/{serviceId}")
    public ResponseEntity<ApiResponse<ServiceResponse>> update(
            @PathVariable UUID hospitalId,
            @PathVariable UUID serviceId,
            @Valid @RequestBody ServiceUpdateRequest body) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Service updated.",
                catalogService.updateService(hospitalId, serviceId, body)));
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID hospitalId,
            @PathVariable UUID serviceId) {
        catalogService.deleteService(hospitalId, serviceId);
        return ResponseEntity.ok(ApiResponse.ok("Service deleted.", null));
    }
}
