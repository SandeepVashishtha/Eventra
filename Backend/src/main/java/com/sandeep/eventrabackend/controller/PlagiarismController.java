package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.PlagiarismDetectionService;
import com.sandeep.eventrabackend.service.PlagiarismDetectionService.SubmissionComparison;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/organizer/plagiarism")
@PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
public class PlagiarismController {

    @Autowired
    private PlagiarismDetectionService plagiarismService;

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeSubmissions(@RequestBody Map<String, Map<String, String>> teamSubmissions) {
        List<SubmissionComparison> comparisons = plagiarismService.analyzeHackathonSubmissions(teamSubmissions);

        long highRiskCount = comparisons.stream().filter(c -> "HIGH".equals(c.getRiskLevel())).count();
        long mediumRiskCount = comparisons.stream().filter(c -> "MEDIUM".equals(c.getRiskLevel())).count();

        Map<String, Object> response = new HashMap<>();
        response.put("totalComparisons", comparisons.size());
        response.put("highRiskCount", highRiskCount);
        response.put("mediumRiskCount", mediumRiskCount);
        response.put("comparisons", comparisons);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/export-report")
    public ResponseEntity<byte[]> exportCsvReport(@RequestBody List<SubmissionComparison> comparisons) {
        String csvData = plagiarismService.generateCsvAuditReport(comparisons);
        byte[] output = csvData.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=plagiarism_audit_report.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(output);
    }
}
