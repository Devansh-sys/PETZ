package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptablePetStatus;
import com.cts.mfrp.petzbackend.adoption.model.AdoptablePet;
import org.springframework.data.jpa.domain.Specification;

/**
 * US-2.1.2 — "Filter and Search Pets".
 *
 * Beginner-friendly: each static method returns one tiny predicate.
 * The service composes them with {@code Specification.where(...).and(...)}
 * so there's no hand-written JPQL and no Criteria-API ceremony.
 */
public final class AdoptablePetSpecifications {

    private AdoptablePetSpecifications() {}

    public static Specification<AdoptablePet> hasStatus(AdoptablePetStatus status) {
        return (root, q, cb) -> status == null ? null
                : cb.equal(root.get("status"), status);
    }

    public static Specification<AdoptablePet> hasNgo(java.util.UUID ngoId) {
        return (root, q, cb) -> ngoId == null ? null
                : cb.equal(root.get("ngoId"), ngoId);
    }

    public static Specification<AdoptablePet> speciesEq(String species) {
        return (root, q, cb) -> (species == null || species.isBlank()) ? null
                : cb.equal(cb.lower(root.get("species")), species.toLowerCase());
    }

    public static Specification<AdoptablePet> breedEq(String breed) {
        return (root, q, cb) -> (breed == null || breed.isBlank()) ? null
                : cb.equal(cb.lower(root.get("breed")), breed.toLowerCase());
    }

    public static Specification<AdoptablePet> genderEq(String gender) {
        return (root, q, cb) -> (gender == null || gender.isBlank()) ? null
                : cb.equal(cb.lower(root.get("gender")), gender.toLowerCase());
    }

    public static Specification<AdoptablePet> cityEq(String city) {
        return (root, q, cb) -> (city == null || city.isBlank()) ? null
                : cb.equal(cb.lower(root.get("locationCity")), city.toLowerCase());
    }

    public static Specification<AdoptablePet> minAge(Integer minMonths) {
        return (root, q, cb) -> minMonths == null ? null
                : cb.greaterThanOrEqualTo(root.get("ageMonths"), minMonths);
    }

    public static Specification<AdoptablePet> maxAge(Integer maxMonths) {
        return (root, q, cb) -> maxMonths == null ? null
                : cb.lessThanOrEqualTo(root.get("ageMonths"), maxMonths);
    }

    public static Specification<AdoptablePet> specialNeedsEq(Boolean flag) {
        return (root, q, cb) -> flag == null ? null
                : cb.equal(root.get("specialNeeds"), flag);
    }

    public static Specification<AdoptablePet> adoptionReadyEq(Boolean flag) {
        return (root, q, cb) -> flag == null ? null
                : cb.equal(root.get("isAdoptionReady"), flag);
    }

    /**
     * "vaccinated=true" filter means vaccinationStatus is a non-blank value.
     * The front-end flag is intentionally simple (boolean) because the
     * stored value is free text like "Fully vaccinated" or "2/3 shots".
     */
    public static Specification<AdoptablePet> vaccinatedEq(Boolean vaccinated) {
        return (root, q, cb) -> {
            if (vaccinated == null) return null;
            if (Boolean.TRUE.equals(vaccinated)) {
                return cb.and(
                        cb.isNotNull(root.get("vaccinationStatus")),
                        cb.notEqual(cb.trim(root.get("vaccinationStatus")), "")
                );
            }
            return cb.or(
                    cb.isNull(root.get("vaccinationStatus")),
                    cb.equal(cb.trim(root.get("vaccinationStatus")), "")
            );
        };
    }
}
