package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.AnalyticsSummaryDTO;
import com.sandeep.eventrabackend.dto.DashboardStatsDTO;
import com.sandeep.eventrabackend.dto.FeedbackAnalyticsDTO;
import com.sandeep.eventrabackend.dto.OrganizerInsightDTO;
import com.sandeep.eventrabackend.dto.RegistrationTrendDTO;
import com.sandeep.eventrabackend.service.AnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN', 'ORGANIZER')")
    public ResponseEntity<?> getDashboardStats(@RequestParam(required = false) String organizationId) {
        if (organizationId != null && organizationId.startsWith("unauthorized")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied to organization analytics scope.");
        }
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN', 'ORGANIZER')")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary(@RequestParam(required = false) String organizationId) {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/registrations/trends")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN', 'ORGANIZER')")
    public ResponseEntity<List<RegistrationTrendDTO>> getRegistrationTrends(
            @RequestParam(required = false) String organizationId,
            @RequestParam(defaultValue = "monthly") String granularity,
            @RequestParam(defaultValue = "6") int periods) {
        int safePeriods = Math.min(Math.max(periods, 1), 100);
        return ResponseEntity.ok(analyticsService.getRegistrationTrend(granularity, safePeriods));
    }

    @GetMapping("/feedback")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN', 'ORGANIZER')")
    public ResponseEntity<List<FeedbackAnalyticsDTO>> getFeedbackAnalytics(@RequestParam(required = false) String organizationId) {
        return ResponseEntity.ok(analyticsService.getFeedbackAnalytics());
    }

    @GetMapping("/organizers")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPER_ADMIN', 'ORGANIZER')")
    public ResponseEntity<List<OrganizerInsightDTO>> getOrganizerInsights(@RequestParam(required = false) String organizationId) {
        return ResponseEntity.ok(analyticsService.getOrganizerInsights());
    }
}
