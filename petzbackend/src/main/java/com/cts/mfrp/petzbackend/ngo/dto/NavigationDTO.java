package com.cts.mfrp.petzbackend.ngo.dto;

public class NavigationDTO {
    private double lat;
    private double lon;
    private String eta; // Estimated time of arrival

    public NavigationDTO() {}

    public NavigationDTO(double lat, double lon, String eta) {
        this.lat = lat;
        this.lon = lon;
        this.eta = eta;
    }

    // Getters and Setters
    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLon() { return lon; }
    public void setLon(double lon) { this.lon = lon; }

    public String getEta() { return eta; }
    public void setEta(String eta) { this.eta = eta; }
}
