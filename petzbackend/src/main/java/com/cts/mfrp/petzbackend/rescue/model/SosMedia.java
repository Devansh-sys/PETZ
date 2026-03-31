
// ============================================================
// FILE 5: rescue/model/SosMedia.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.model;

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

    @Column(name = "sos_report_id", nullable = false)
    private UUID sosReportId;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType mediaType;

    // INITIAL_REPORT | ON_SITE_ASSESSMENT | RELEASE_CONFIRMATION
    @Column(name = "upload_context")
    private String uploadContext;

    public enum MediaType {
        IMAGE, VIDEO
    }
}
