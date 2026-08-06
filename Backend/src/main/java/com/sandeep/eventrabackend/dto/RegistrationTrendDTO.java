package com.sandeep.eventrabackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationTrendDTO {

    /**
     * Format depends on granularity:
     *   monthly → "2025-01"
     *   weekly  → "202503"  (YEARWEEK value)
     *   daily   → "2025-01-15"
     */
    private String period;

    private long registrationCount;  // registrations in this period
    private long cumulativeTotal;    // running total up to this period
}
