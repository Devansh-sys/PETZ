package com.cts.mfrp.petzbackend.user.repository;

import com.cts.mfrp.petzbackend.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * User repository — shared across all modules.
 *
 * TEAMMATES: Add your query methods here. Do NOT create a second
 * UserRepository in another package — JPA will fail with duplicate
 * bean definitions.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByPhone(String phone);

    Optional<User> findByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
}