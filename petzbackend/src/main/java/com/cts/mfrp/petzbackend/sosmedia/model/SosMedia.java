package com.cts.mfrp.petzbackend.sosmedia.model;

import com.cts.mfrp.petzbackend.enums.SosMediaType;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "sos_media")
public class SosMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sos_report_id", nullable = false)
    private SosReport sosReport;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 10)
    private SosMediaType mediaType;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public UUID getId() { return id; }

    public SosReport getSosReport() { return sosReport; }
    public void setSosReport(SosReport sosReport) { this.sosReport = sosReport; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public SosMediaType getMediaType() { return mediaType; }
    public void setMediaType(SosMediaType mediaType) { this.mediaType = mediaType; }
}