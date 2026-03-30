package com.cts.mfrp.petzbackend.rescue.dto;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

public class KpiRequest {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime to;

    private String ngoId;  // optional — UUID as string for query param convenience
    private String city;   // optional — reserved for future DB predicate

    public LocalDateTime getFrom() { return from; }
    public void setFrom(LocalDateTime from) { this.from = from; }

    public LocalDateTime getTo() { return to; }
    public void setTo(LocalDateTime to) { this.to = to; }

    public String getNgoId() { return ngoId; }
    public void setNgoId(String ngoId) { this.ngoId = ngoId; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}