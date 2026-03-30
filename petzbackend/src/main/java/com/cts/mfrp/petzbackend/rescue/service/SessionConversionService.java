package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.rescue.dto.ConvertSessionRequest;
import com.cts.mfrp.petzbackend.rescue.dto.ConvertSessionResponse;
import com.cts.mfrp.petzbackend.rescue.repository.UserRescueRepository;
import com.cts.mfrp.petzbackend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * US-1.7.1 – Converts a temporary SOS reporter session into a full PETZ account.
 *
 * Flow:
 *  1. Lookup user by UUID (created during OTP auth — isTemporary = true)
 *  2. Validate not already converted, email uniqueness
 *  3. Set password hash, optional profile, flip isTemporary → false
 *  4. Rescue history is automatically linked (same UUID, same sos_reports.reporter_id)
 */
@Service
@RequiredArgsConstructor
public class SessionConversionService {

    private final UserRescueRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ConvertSessionResponse convertSession(UUID userId, ConvertSessionRequest req) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (!user.isTemporary()) {
            throw new IllegalStateException("Account is already a full PETZ account.");
        }

        if (req.getEmail() != null && userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        // Set password and promote account
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setTemporary(false);

        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getEmail()    != null) user.setEmail(req.getEmail());

        userRepo.save(user);

        return new ConvertSessionResponse(
                user.getId(),
                user.getPhone(),
                user.getFullName(),
                user.getEmail(),
                "Account successfully created. Your rescue history has been linked."
        );
    }
}

