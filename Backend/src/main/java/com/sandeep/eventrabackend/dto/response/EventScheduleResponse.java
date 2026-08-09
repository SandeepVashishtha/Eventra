package com.sandeep.eventrabackend.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventScheduleResponse {
    private Long eventId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
