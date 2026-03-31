package com.cts.mfrp.petzbackend.sosmedia.model;

import com.cts.mfrp.petzbackend.enums.SosMediaType;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "sos_media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SosMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sos_report_id", nullable = false)
    private SosReport sosReport;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private SosMediaType mediaType;
}