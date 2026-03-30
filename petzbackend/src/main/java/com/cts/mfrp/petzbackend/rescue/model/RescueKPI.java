package com.cts.mfrp.petzbackend.rescue.model;

import java.time.LocalDateTime;

public class RescueKPI {

    // ── Computed KPI fields ───────────────────────────────────────────────────

    /**
     * Average time in minutes from SOS creation to a volunteer accepting the mission.
     * Sourced from: AVG(TIMESTAMPDIFF(MINUTE, sos_reports.reported_at, ngo_assignments.accepted_at))
     */
    private double avgSosToAcceptance;

    /**
     * Percentage of SOS reports that reached COMPLETE status.
     * Formula: (completedSos / totalSos) * 100
     */
    private double completionRate;

    /**
     * Percentage of completed rescues that were handed over to a hospital.
     * Formula: (handedOverCount / completedSos) * 100
     * TODO: wire to hospital_handovers table when available.
     */
    private double handoverRate;

    /**
     * Percentage of dispatch notifications where the volunteer accepted.
     * Formula: (acceptedDispatches / totalDispatches) * 100
     */
    private double volunteerResponseRate;

    /**
     * Timestamp of when this KPI snapshot was calculated.
     * Set in the service layer at the time of the API call.
     */
    private LocalDateTime calculatedAt;

    // ── Raw counts (used for trend charts on the frontend) ────────────────────

    private long totalSos;
    private long completedSos;
    private long totalDispatched;
    private long acceptedDispatched;

    // ── Constructor ───────────────────────────────────────────────────────────

    public RescueKPI() {
        this.calculatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public double getAvgSosToAcceptance() {
        return avgSosToAcceptance;
    }
    public void setAvgSosToAcceptance(double avgSosToAcceptance) {
        this.avgSosToAcceptance = avgSosToAcceptance;
    }

    public double getCompletionRate() {
        return completionRate;
    }
    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public double getHandoverRate() {
        return handoverRate;
    }
    public void setHandoverRate(double handoverRate) {
        this.handoverRate = handoverRate;
    }

    public double getVolunteerResponseRate() {
        return volunteerResponseRate;
    }
    public void setVolunteerResponseRate(double volunteerResponseRate) {
        this.volunteerResponseRate = volunteerResponseRate;
    }

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }
    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public long getTotalSos() {
        return totalSos;
    }
    public void setTotalSos(long totalSos) {
        this.totalSos = totalSos;
    }

    public long getCompletedSos() {
        return completedSos;
    }
    public void setCompletedSos(long completedSos) {
        this.completedSos = completedSos;
    }

    public long getTotalDispatched() {
        return totalDispatched;
    }
    public void setTotalDispatched(long totalDispatched) {
        this.totalDispatched = totalDispatched;
    }

    public long getAcceptedDispatched() {
        return acceptedDispatched;
    }
    public void setAcceptedDispatched(long acceptedDispatched) {
        this.acceptedDispatched = acceptedDispatched;
    }

    // ── toString (useful for logging) ─────────────────────────────────────────

    @Override
    public String toString() {
        return "RescueKPI{" +
                "avgSosToAcceptance=" + avgSosToAcceptance +
                ", completionRate=" + completionRate +
                ", handoverRate=" + handoverRate +
                ", volunteerResponseRate=" + volunteerResponseRate +
                ", totalSos=" + totalSos +
                ", completedSos=" + completedSos +
                ", calculatedAt=" + calculatedAt +
                '}';
    }
}