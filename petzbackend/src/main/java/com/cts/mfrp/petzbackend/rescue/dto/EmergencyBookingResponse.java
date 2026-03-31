package com.cts.mfrp.petzbackend.rescue.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EmergencyBookingResponse {

    private UUID bookingId;
    private UUID sosReportId;
    private UUID hospitalId;
    private String slotTime;
    private String status;
}
