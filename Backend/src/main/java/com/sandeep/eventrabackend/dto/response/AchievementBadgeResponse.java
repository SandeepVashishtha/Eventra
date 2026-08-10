package com.sandeep.eventrabackend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AchievementBadgeResponse {
    private String id;
    private String name;
    private String description;
    private boolean earned;
    private long currentProgress;
    private long targetProgress;
}
