package com.cts.mfrp.petzbackend.user.repository;

import com.cts.mfrp.petzbackend.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    // ── Epic 2 (Pet Adoption): helpers used by adoption module ──────────
    /** Fetch a user only when their role matches (e.g. adopter vs ngo rep). */
    Optional<User> findByIdAndRole(UUID id, User.Role role);

    /**
     * US-4.2.1 — look up all NGO_REP users bound to an NGO so the
     * notification stub can fan out in-app notifications to NGO staff.
     */
    List<User> findByNgoId(UUID ngoId);
}