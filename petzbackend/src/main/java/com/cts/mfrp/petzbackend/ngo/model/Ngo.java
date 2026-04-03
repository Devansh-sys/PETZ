package com.cts.mfrp.petzbackend.ngo.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
public class Ngo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private double latitude;
    private double longitude;
    private boolean active;

    // Constructors
    public Ngo() {}

    public Ngo(String name, double latitude, double longitude, boolean active) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.active = active;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
