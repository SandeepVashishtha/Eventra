package com.sandeep.eventrabackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizerInsightDTO {

    private Long   organizerId;
    private String organizerName;

    private long   totalEvents;
    private long   totalRegistrations;

    private double averageRating;           // avg feedback rating across their events
    private double avgCapacityUtilization;  // avg registeredCount/capacity
}
