package com.cts.mfrp.petzbackend.rescue.dto;

public class KpiResponse {

    private Double avgMinutesToAcceptance;
    private Double completionRatePercent;
    private Double hospitalHandoverRatePercent;
    private Double volunteerResponseRatePercent;
    private long totalSos;
    private long completedSos;
    private long totalDispatched;
    private long acceptedDispatched;

    private KpiResponse() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final KpiResponse r = new KpiResponse();
        public Builder avgMinutesToAcceptance(Double v)      { r.avgMinutesToAcceptance      = v; return this; }
        public Builder completionRatePercent(Double v)       { r.completionRatePercent       = v; return this; }
        public Builder hospitalHandoverRatePercent(Double v) { r.hospitalHandoverRatePercent = v; return this; }
        public Builder volunteerResponseRatePercent(Double v){ r.volunteerResponseRatePercent= v; return this; }
        public Builder totalSos(long v)                      { r.totalSos                    = v; return this; }
        public Builder completedSos(long v)                  { r.completedSos                = v; return this; }
        public Builder totalDispatched(long v)               { r.totalDispatched             = v; return this; }
        public Builder acceptedDispatched(long v)            { r.acceptedDispatched          = v; return this; }
        public KpiResponse build()                           { return r; }
    }

    public Double getAvgMinutesToAcceptance()       { return avgMinutesToAcceptance; }
    public Double getCompletionRatePercent()        { return completionRatePercent; }
    public Double getHospitalHandoverRatePercent()  { return hospitalHandoverRatePercent; }
    public Double getVolunteerResponseRatePercent() { return volunteerResponseRatePercent; }
    public long getTotalSos()                       { return totalSos; }
    public long getCompletedSos()                   { return completedSos; }
    public long getTotalDispatched()                { return totalDispatched; }
    public long getAcceptedDispatched()             { return acceptedDispatched; }
}