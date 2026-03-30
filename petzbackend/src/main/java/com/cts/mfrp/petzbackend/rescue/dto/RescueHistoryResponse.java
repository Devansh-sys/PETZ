// ─────────────────────────────────────────────────────────────────────────────
// FILE: rescue/dto/RescueHistoryResponse.java
package com.cts.mfrp.petzbackend.rescue.dto;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RescueHistoryResponse {

    private UUID sosId;
    private LocalDateTime reportedAt;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private UrgencyLevel urgencyLevel;
    private ReportStatus status;
    private String description;
    private String outcome; // human-readable summary e.g. "Rescue completed"

    // ── Builder ───────────────────────────────────────────────────────────────
    private RescueHistoryResponse() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final RescueHistoryResponse r = new RescueHistoryResponse();
        public Builder sosId(UUID v)              { r.sosId = v;          return this; }
        public Builder reportedAt(LocalDateTime v){ r.reportedAt = v;     return this; }
        public Builder latitude(BigDecimal v)     { r.latitude = v;       return this; }
        public Builder longitude(BigDecimal v)    { r.longitude = v;      return this; }
        public Builder urgencyLevel(UrgencyLevel v){ r.urgencyLevel = v;  return this; }
        public Builder status(ReportStatus v)     { r.status = v;         return this; }
        public Builder description(String v)      { r.description = v;    return this; }
        public Builder outcome(String v)          { r.outcome = v;        return this; }
        public RescueHistoryResponse build()      { return r; }
    }

    public UUID getSosId()               { return sosId; }
    public LocalDateTime getReportedAt() { return reportedAt; }
    public BigDecimal getLatitude()      { return latitude; }
    public BigDecimal getLongitude()     { return longitude; }
    public UrgencyLevel getUrgencyLevel(){ return urgencyLevel; }
    public ReportStatus getStatus()      { return status; }
    public String getDescription()       { return description; }
    public String getOutcome()           { return outcome; }
}
