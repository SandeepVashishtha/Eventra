package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.DashboardStatsDTO;
import com.sandeep.eventrabackend.dto.FeedbackAnalyticsDTO;
import com.sandeep.eventrabackend.dto.OrganizerInsightDTO;
import com.sandeep.eventrabackend.dto.RegistrationTrendDTO;
import com.sandeep.eventrabackend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/registrations/trends")
    public ResponseEntity<List<RegistrationTrendDTO>> getRegistrationTrends(
            @RequestParam(defaultValue = "monthly") String granularity,
            @RequestParam(defaultValue = "6") int periods) {
        return ResponseEntity.ok(analyticsService.getRegistrationTrend(granularity, periods));
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<FeedbackAnalyticsDTO>> getFeedbackAnalytics() {
        return ResponseEntity.ok(analyticsService.getFeedbackAnalytics());
    }

    @GetMapping("/organizers")
    public ResponseEntity<List<OrganizerInsightDTO>> getOrganizerInsights() {
        return ResponseEntity.ok(analyticsService.getOrganizerInsights());
    }
}
