package com.sandeep.eventrabackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class GitHubProxyService {

    /**
     * Public Eventra surfaces only need this repo (contributors/stats) plus
     * public user profile lookups. Broad {@code repos|orgs|users} prefixes let
     * an unauthenticated caller abuse a shared {@code GITHUB_TOKEN}.
     */
    private static final Set<String> ALLOWED_REPOS = Set.of(
            "repos/sandeepvashishtha/eventra"
    );

    /**
     * Curated, read-only public sub-paths permitted beneath an allowlisted repo.
     * Anything else (including {@code /hooks}, {@code /keys}, etc.) is rejected.
     */
    private static final Set<String> ALLOWED_REPO_SUBPATHS = Set.of(
            "/contributors", "/stats", "/languages", "/commits", "/readme"
    );

    /**
     * Sensitive sub-resources that must never be reachable through the proxy,
     * even if nested under an allowlisted repo path.
     */
    private static final Set<String> BLOCKED_PATH_SEGMENTS = Set.of(
            "hooks", "keys", "actions", "secrets", "environments", "deployments"
    );

    private static final Pattern SAFE_PATH = Pattern.compile("^[A-Za-z0-9_./\\-]+$");
    private static final Pattern USERS_PATH = Pattern.compile(
            "^users/[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}(/[A-Za-z0-9_./\\-]*)?$",
            Pattern.CASE_INSENSITIVE
    );

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    @Value("${GITHUB_TOKEN:#{null}}")
    private String githubToken;

    public ResponseEntity<String> proxy(String path, Map<String, String> queryParams) {
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body("{\"error\":\"path is required\"}");
        }

        String normalized = path.startsWith("/") ? path.substring(1) : path;
        if (normalized.contains("..") || !SAFE_PATH.matcher(normalized).matches()) {
            return ResponseEntity.badRequest().body("{\"error\":\"invalid path\"}");
        }

        if (!isAllowlisted(normalized)) {
            return ResponseEntity.status(403).body("{\"error\":\"path not allowlisted\"}");
        }

        StringBuilder url = new StringBuilder("https://api.github.com/").append(normalized);
        if (queryParams != null && !queryParams.isEmpty()) {
            url.append('?');
            boolean first = true;
            for (Map.Entry<String, String> entry : queryParams.entrySet()) {
                if ("path".equals(entry.getKey())) {
                    continue;
                }
                if (!first) {
                    url.append('&');
                }
                first = false;
                url.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                        .append('=')
                        .append(URLEncoder.encode(entry.getValue() == null ? "" : entry.getValue(), StandardCharsets.UTF_8));
            }
        }

        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url.toString()))
                .timeout(Duration.ofSeconds(10))
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .GET();

        if (githubToken != null && !githubToken.isBlank()) {
            builder.header(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken.trim());
        }

        try {
            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            return ResponseEntity.status(response.statusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=60")
                    .body(response.body());
        } catch (IOException | InterruptedException ex) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(502).body("{\"error\":\"github upstream failed\"}");
        }
    }

    static boolean isAllowlisted(String normalizedPath) {
        String lower = normalizedPath.toLowerCase(Locale.ROOT);
        if (lower.startsWith("repos/")) {
            if (BLOCKED_PATH_SEGMENTS.stream().anyMatch(lower::contains)) {
                return false;
            }
            return ALLOWED_REPOS.stream().anyMatch(repo ->
                    lower.equals(repo)
                            || ALLOWED_REPO_SUBPATHS.stream().anyMatch(sub ->
                                    lower.equals(repo + sub)
                                            || lower.startsWith(repo + sub + "/")));
        }
        if (lower.startsWith("users/")) {
            return USERS_PATH.matcher(normalizedPath).matches();
        }
        return false;
    }
}
