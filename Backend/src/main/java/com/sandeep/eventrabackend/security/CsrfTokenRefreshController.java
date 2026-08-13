package com.sandeep.eventrabackend.security;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Controller endpoint allowing active pages to query fresh CSRF token values (#16595).
 */
@RestController
@RequestMapping("/api/security")
public class CsrfTokenRefreshController {

    @GetMapping("/csrf-refresh")
    public ResponseEntity<String> refreshCsrfToken(HttpServletRequest request) {
        // Retrieve fresh token from request attributes populated by Spring Security
        Object token = request.getAttribute("_csrf");
        if (token != null) {
            return ResponseEntity.ok(token.toString());
        }
        return ResponseEntity.ok("NO_ACTIVE_CSRF");
    }
}
