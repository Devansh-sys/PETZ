package com.cts.mfrp.petzbackend.rescue.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReassignResponse {

    private UUID assignmentId;
    private UUID sosReportId;
    private UUID newNgoId;
    private UUID newVolunteerId;
    private String reason;
    private LocalDateTime reassignedAt;

    private ReassignResponse() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ReassignResponse r = new ReassignResponse();
        public Builder assignmentId(UUID v)          { r.assignmentId    = v; return this; }
        public Builder sosReportId(UUID v)           { r.sosReportId     = v; return this; }
        public Builder newNgoId(UUID v)              { r.newNgoId        = v; return this; }
        public Builder newVolunteerId(UUID v)        { r.newVolunteerId  = v; return this; }
        public Builder reason(String v)              { r.reason          = v; return this; }
        public Builder reassignedAt(LocalDateTime v) { r.reassignedAt    = v; return this; }
        public ReassignResponse build()              { return r; }
    }

    public UUID getAssignmentId()         { return assignmentId; }
    public UUID getSosReportId()          { return sosReportId; }
    public UUID getNewNgoId()             { return newNgoId; }
    public UUID getNewVolunteerId()       { return newVolunteerId; }
    public String getReason()             { return reason; }
    public LocalDateTime getReassignedAt(){ return reassignedAt; }
}