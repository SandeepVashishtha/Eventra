package com.sandeep.eventrabackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/github")
public class GitHubProxyController {

    private final GitHubSyncService githubSyncService;

    public GitHubProxyController(GitHubSyncService githubSyncService) {
        this.githubSyncService = githubSyncService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleGithubWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Hub-Signature-256") String signature) {

        if (signature == null || signature.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Signature header is missing");
        }

        boolean success = githubSyncService.syncIssuePayload(payload);
        if (success) {
            return ResponseEntity.ok("Leaderboard synced successfully!");
        }
        return ResponseEntity.internalServerError().body("Failed to sync issue payload");
    }
}
