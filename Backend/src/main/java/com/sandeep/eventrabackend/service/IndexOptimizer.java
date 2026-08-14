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
        // Mock parsing table name
        return "event_registrations";
    }

    private String parseColumnName(String query) {
        // Mock parsing column name
        return "user_id";
    }
}
