package com.sandeep.eventrabackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicFeedbackResponse {
    private Long id;
    private Long eventId;
    private Integer rating;
    private String comment;
    private LocalDateTime submittedAt;
}
