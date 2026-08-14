package com.sandeep.eventrabackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Map;
import java.util.regex.Pattern;

@Component
public class SqlInjectionAuditFilter extends OncePerRequestFilter {

    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        "('.*--)|(--)|(\\|\\|)|(%27)|(union\\s+select)|(select\\s+.*\\s+from)",
        Pattern.CASE_INSENSITIVE
    );

    private final SqlAuditProperties sqlAuditProperties;

    public SqlInjectionAuditFilter(SqlAuditProperties sqlAuditProperties) {
        this.sqlAuditProperties = sqlAuditProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        Map<String, String[]> parameters = request.getParameterMap();

        for (Map.Entry<String, String[]> entry : parameters.entrySet()) {
            for (String val : entry.getValue()) {
                if (SQL_INJECTION_PATTERN.matcher(val).find()) {
                    System.err.println("SQL INJECTION SIGNATURE DETECTED from IP: " + request.getRemoteAddr() + " parameter: " + entry.getKey());
                    if (sqlAuditProperties.isBlockOnDetection()) {
                        response.setStatus(400);
                        response.getWriter().write("Bad Request - SQL injection signature detected");
                        return;
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
