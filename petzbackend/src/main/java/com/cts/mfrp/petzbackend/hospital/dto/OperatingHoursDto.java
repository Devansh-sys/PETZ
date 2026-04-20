package com.cts.mfrp.petzbackend.hospital.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.Valid;
import lombok.*;

import java.time.DayOfWeek;
import java.util.EnumMap;
import java.util.Map;

/**
 * US-3.2.4 AC#1 — "Hours editable per day".
 * Structured representation of a hospital's weekly opening hours.
 *
 * <pre>{@code
 * {
 *   "days": {
 *     "MON": {"open": "09:00", "close": "17:00", "closed": false},
 *     "SUN": {"closed": true}
 *   }
 * }
 * }</pre>
 *
 * Serialized to JSON and stored in {@code Hospital.operatingHoursJson};
 * a human-readable summary is derived into {@code Hospital.operatingHours}
 * by {@code HospitalProfileService} so legacy read endpoints keep working.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OperatingHoursDto {

    @Builder.Default
    @Valid
    private Map<DayOfWeek, DailyHours> days = new EnumMap<>(DayOfWeek.class);

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DailyHours {
        /** "HH:mm" format, e.g. "09:00". Ignored if {@code closed=true}. */
        private String open;
        /** "HH:mm" format, e.g. "17:00". Ignored if {@code closed=true}. */
        private String close;
        /** If true, hospital is closed that day — open/close ignored.
         *  Boxed so omitting the field from JSON is valid (treated as false). */
        private Boolean closed;

        /** Null-safe accessor used internally by the formatter/service. */
        public boolean isClosedSafe() { return Boolean.TRUE.equals(closed); }
    }
}
