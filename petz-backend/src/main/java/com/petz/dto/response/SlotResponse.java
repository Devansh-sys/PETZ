package com.petz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalTime;

@Data
@AllArgsConstructor
public class SlotResponse {
    private LocalTime time;
    private boolean available;
}
