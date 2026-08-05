package com.sandeep.eventrabackend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Waitlist entry details for an event")
public class WaitlistResponse {

    private Long id;
    private Long eventId;
    private String eventTitle;
    private String userEmail;
    private int position;
    private String status;
    private LocalDateTime joinedAt;
}
