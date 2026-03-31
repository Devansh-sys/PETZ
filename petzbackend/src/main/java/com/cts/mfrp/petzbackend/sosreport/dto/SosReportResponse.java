package com.cts.mfrp.petzbackend.sosreport.dto;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import com.cts.mfrp.petzbackend.sosmedia.dto.SosMediaResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SosReportResponse {

    private UUID id;
    private UUID reporterId;
    private String reporterName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private UrgencyLevel urgencyLevel;
    private ReportStatus currentStatus;
    private String description;
    private LocalDateTime reportedAt;
    private List<SosMediaResponse> media;
}