package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.GitHubProxyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @Operation(summary = "Proxy an allowlisted GitHub API path")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> proxy(
            @RequestParam("path") String path,
            @RequestParam Map<String, String> allParams) {
        return gitHubProxyService.proxy(path, allParams);
    }
}
