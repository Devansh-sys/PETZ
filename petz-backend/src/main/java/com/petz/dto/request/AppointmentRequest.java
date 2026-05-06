package com.petz.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {

    @NotNull
    private Long hospitalId;

    @NotNull
    private Long doctorId;

    private Long petId;

    @NotNull
    private LocalDate apptDate;

    @NotNull
    private LocalTime apptTime;

    private String reason;
}
