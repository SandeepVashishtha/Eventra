package com.sandeep.eventrabackend.service;

public class IndexReport {
    private final String tableName;
    private final String columnName;
    private final String sqlRecommendation;

    public IndexReport(String tableName, String columnName, String sqlRecommendation) {
        this.tableName = tableName;
        this.columnName = columnName;
        this.sqlRecommendation = sqlRecommendation;
    }

    public String getTableName() {
        return tableName;
    }

    public String getColumnName() {
        return columnName;
    }

    public String getSqlRecommendation() {
        return sqlRecommendation;
    }
}
