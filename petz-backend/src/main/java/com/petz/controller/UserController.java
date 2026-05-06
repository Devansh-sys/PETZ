package com.petz.controller;

import com.petz.dto.request.UpdateProfileRequest;
import com.petz.dto.response.UserResponse;
import com.petz.service.UserService;
import com.petz.util.ApiResponse;
import com.petz.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final SecurityUtil securityUtil;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(userId)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody UpdateProfileRequest req) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(userService.updateProfile(userId, req), "Profile updated."));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<ApiResponse<UserResponse>> uploadPhoto(@RequestParam("file") MultipartFile file)
            throws IOException {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(userService.uploadProfilePhoto(userId, file), "Photo uploaded."));
    }
}
