package com.sandeep.eventrabackend.dto.request;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class EventScheduleRequest {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean overrideConflicts;
}
