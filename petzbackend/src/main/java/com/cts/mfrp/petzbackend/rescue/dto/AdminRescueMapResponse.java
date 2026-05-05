package com.cts.mfrp.petzbackend.rescue.dto;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class AdminRescueMapResponse {

    private UUID sosId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private ReportStatus status;
    private UrgencyLevel urgencyLevel;
    private String reporterPhone;
    private LocalDateTime reportedAt;
    private String assignedNgoId;
    private String assignedNgoName;
    private String assignedVolunteerId;

    private AdminRescueMapResponse() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AdminRescueMapResponse r = new AdminRescueMapResponse();
        public Builder sosId(UUID v)                  { r.sosId = v;               return this; }
        public Builder latitude(BigDecimal v)         { r.latitude = v;            return this; }
        public Builder longitude(BigDecimal v)        { r.longitude = v;           return this; }
        public Builder status(ReportStatus v)         { r.status = v;              return this; }
        public Builder urgencyLevel(UrgencyLevel v)   { r.urgencyLevel = v;        return this; }
        public Builder reporterPhone(String v)        { r.reporterPhone = v;       return this; }
        public Builder reportedAt(LocalDateTime v)    { r.reportedAt = v;          return this; }
        public Builder assignedNgoId(String v)        { r.assignedNgoId = v;       return this; }
        public Builder assignedNgoName(String v)      { r.assignedNgoName = v;     return this; }
        public Builder assignedVolunteerId(String v)  { r.assignedVolunteerId = v; return this; }
        public AdminRescueMapResponse build()         { return r; }
    }

    public UUID getSosId()                  { return sosId; }
    public BigDecimal getLatitude()         { return latitude; }
    public BigDecimal getLongitude()        { return longitude; }
    public ReportStatus getStatus()         { return status; }
    public UrgencyLevel getUrgencyLevel()   { return urgencyLevel; }
    public String getReporterPhone()        { return reporterPhone; }
    public LocalDateTime getReportedAt()    { return reportedAt; }
    public String getAssignedNgoId()        { return assignedNgoId; }
    public String getAssignedNgoName()      { return assignedNgoName; }
    public String getAssignedVolunteerId()  { return assignedVolunteerId; }
}
