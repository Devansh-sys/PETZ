package com.petz.entity;

import com.petz.enums.AnimalStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "adoptable_animals")
@Data
@NoArgsConstructor
public class AdoptableAnimal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ngo_id", nullable = false)
    private Long ngoId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String species;

    @Column(length = 100)
    private String breed;

    @Column(name = "age_months")
    private Integer ageMonths;

    @Column(length = 10)
    private String gender;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(length = 100)
    private String city;

    @Column(name = "is_vaccinated", nullable = false)
    private Boolean isVaccinated = false;

    @Column(name = "is_neutered", nullable = false)
    private Boolean isNeutered = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnimalStatus status = AnimalStatus.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
