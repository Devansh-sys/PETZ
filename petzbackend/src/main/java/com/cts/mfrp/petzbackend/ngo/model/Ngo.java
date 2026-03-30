package com.cts.mfrp.petzbackend.ngo.model;

import jakarta.persistence.*;

@Entity
public class Ngo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
