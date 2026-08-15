package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class IndexOptimizer {

    public List<IndexReport> analyzeQueryLogs(List<String> slowQueries) {
        List<IndexReport> recommendations = new ArrayList<>();
        for (String query : slowQueries) {
            String lower = query.toLowerCase();
            if (lower.contains("where") && !lower.contains("index")) {
                // Parse filter column
                String table = parseTableName(lower);
                String column = parseColumnName(lower);
                recommendations.add(new IndexReport(table, column, "CREATE INDEX idx_" + table + "_" + column + " ON " + table + "(" + column + ");"));
            }
        }
        return recommendations;
    }

    private String parseTableName(String query) {
        // Extract the table referenced after FROM / UPDATE / JOIN.
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                "\\b(?:from|update|join)\\s+([a-z_][a-z0-9_]*)",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = pattern.matcher(query);
        return matcher.find() ? matcher.group(1) : "unknown";
    }

    private String parseColumnName(String query) {
        // Extract the column compared in the WHERE clause (e.g. WHERE col = ?).
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                "\\bwhere\\s+([a-z_][a-z0-9_]*)\\s*=",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = pattern.matcher(query);
        return matcher.find() ? matcher.group(1) : "unknown";
    }
}
