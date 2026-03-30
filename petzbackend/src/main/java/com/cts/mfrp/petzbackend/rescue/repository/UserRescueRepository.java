package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRescueRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);
}