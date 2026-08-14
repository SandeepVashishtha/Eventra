package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.GitHubProxyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/github-proxy")
@Tag(name = "GitHub Proxy", description = "Allowlisted proxy for public GitHub API reads")
public class GitHubProxyController {

    private final GitHubProxyService gitHubProxyService;

    public GitHubProxyController(GitHubProxyService gitHubProxyService) {
        this.gitHubProxyService = gitHubProxyService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Proxy an allowlisted GitHub API path")
    public ResponseEntity<String> proxy(
            @RequestParam("path") String path,
            @RequestParam Map<String, String> allParams,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return gitHubProxyService.proxy(path, allParams);
    }
}
