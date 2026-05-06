package com.petz.controller;

import com.petz.entity.Ngo;
import com.petz.service.NgoService;
import com.petz.util.ApiResponse;
import com.petz.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ngo")
@RequiredArgsConstructor
public class NgoController {

    private final NgoService ngoService;
    private final SecurityUtil securityUtil;

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<Ngo>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(ngoService.getAll()));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<ApiResponse<Ngo>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(ngoService.getById(id)));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<Ngo>> getMyProfile() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(ngoService.getByOwner(userId)));
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<Ngo>> saveProfile(@RequestBody Map<String, Object> body) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(ngoService.createOrUpdate(userId, body), "NGO profile saved."));
    }

    @PostMapping("/profile/logo")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<Ngo>> uploadLogo(@RequestParam("file") MultipartFile file)
            throws IOException {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(ngoService.uploadLogo(userId, file), "Logo uploaded."));
    }
}
