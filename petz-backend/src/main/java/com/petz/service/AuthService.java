package com.petz.service;

import com.petz.config.JwtUtil;
import com.petz.dto.request.LoginRequest;
import com.petz.dto.request.RegisterRequest;
import com.petz.dto.response.AuthResponse;
import com.petz.entity.Hospital;
import com.petz.entity.Ngo;
import com.petz.entity.User;
import com.petz.enums.Role;
import com.petz.exception.BadRequestException;
import com.petz.exception.ResourceNotFoundException;
import com.petz.repository.HospitalRepository;
import com.petz.repository.NgoRepository;
import com.petz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final HospitalRepository hospitalRepo;
    private final NgoRepository ngoRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered.");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());

        if (req.getRole() != null) {
            try {
                user.setRole(Role.valueOf(req.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(Role.USER);
            }
        }

        // NGO and HOSPITAL registrations require admin approval before they can log in
        boolean needsApproval = (user.getRole() == Role.NGO || user.getRole() == Role.HOSPITAL);
        if (needsApproval) {
            user.setIsApproved(false);
        }

        user = userRepo.save(user);

        // Auto-create a Hospital entity so the hospital dashboard & doctor management work.
        // isActive=false keeps it hidden from public listings until admin approves the account.
        if (user.getRole() == Role.HOSPITAL) {
            Hospital h = new Hospital();
            h.setOwnerUserId(user.getId());
            h.setName(req.getName());
            h.setPhone(req.getPhone());
            h.setEmail(req.getEmail());
            h.setCity("Chennai");
            h.setIsActive(false);
            hospitalRepo.save(h);
        }

        // Auto-create an NGO entity so the NGO dashboard & rescue queue work.
        // isActive=false, isVerified=false — both set to true once admin approves.
        if (user.getRole() == Role.NGO) {
            Ngo ngo = new Ngo();
            ngo.setOwnerUserId(user.getId());
            ngo.setName(req.getName());
            ngo.setPhone(req.getPhone());
            ngo.setEmail(req.getEmail());
            ngo.setCity("Chennai");
            ngo.setIsActive(false);
            ngo.setIsVerified(false);
            ngoRepo.save(ngo);
        }

        if (needsApproval) {
            // Return no token — account is pending admin approval
            return new AuthResponse(null, user.getId(), user.getEmail(), user.getName(), user.getRole().name(), false);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole().name(), true);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials.");
        }

        if (!user.getIsActive()) {
            throw new BadRequestException("Account is deactivated.");
        }

        if (!user.getIsApproved() && (user.getRole() == Role.NGO || user.getRole() == Role.HOSPITAL)) {
            throw new BadRequestException("Your account is pending admin approval. You will be notified once approved.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole().name(), true);
    }
}
