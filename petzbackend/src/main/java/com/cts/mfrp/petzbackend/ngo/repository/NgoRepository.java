package com.cts.mfrp.petzbackend.ngo.repository;

import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NgoRepository extends JpaRepository<Ngo, UUID> {

    @Query("SELECT n FROM Ngo n WHERE n.active = true")
    List<Ngo> findActiveNgos();

    /** US-4.3 — look up NGO by its owning user (NGO_REP who registered it). */
    Optional<Ngo> findByOwnerUserId(UUID ownerUserId);

    /** US-4.3 / US-2.6.2 — list NGOs pending admin verification. */
    List<Ngo> findByIsVerified(Boolean isVerified);

    /** Auto-queue: active NGOs with a representative, ordered by registration date (first-in = first-to-be-assigned). */
    List<Ngo> findByActiveTrueAndOwnerUserIdIsNotNullOrderByCreatedAtAsc();
}
