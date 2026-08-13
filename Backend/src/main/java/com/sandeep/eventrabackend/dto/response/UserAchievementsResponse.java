package com.sandeep.eventrabackend.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserAchievementsResponse {
    private long totalEvents;
    private long gssocEvents;
    private int currentStreak;
    private List<AchievementBadgeResponse> badges;
}
