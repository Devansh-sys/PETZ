package com.petz.service;

import com.petz.dto.request.UpdateProfileRequest;
import com.petz.dto.response.UserResponse;
import com.petz.entity.User;
import com.petz.exception.ResourceNotFoundException;
import com.petz.repository.UserRepository;
import com.petz.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final FileStorageUtil fileStorage;

    public UserResponse getProfile(Long userId) {
        User user = getUser(userId);
        return toResponse(user);
    }

    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = getUser(userId);
        if (req.getName() != null)    user.setName(req.getName());
        if (req.getPhone() != null)   user.setPhone(req.getPhone());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getCity() != null)    user.setCity(req.getCity());
        return toResponse(userRepo.save(user));
    }

    public UserResponse uploadProfilePhoto(Long userId, MultipartFile file) throws IOException {
        User user = getUser(userId);
        String url = fileStorage.store(file, "profiles");
        user.setProfilePhoto(url);
        return toResponse(userRepo.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserResponse toggleActive(Long userId, boolean active) {
        User user = getUser(userId);
        user.setIsActive(active);
        return toResponse(userRepo.save(user));
    }

    private User getUser(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public UserResponse toResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setName(u.getName());
        r.setEmail(u.getEmail());
        r.setPhone(u.getPhone());
        r.setRole(u.getRole().name());
        r.setProfilePhoto(u.getProfilePhoto());
        r.setAddress(u.getAddress());
        r.setCity(u.getCity());
        r.setIsActive(u.getIsActive());
        r.setCreatedAt(u.getCreatedAt());
        return r;
    }
}
