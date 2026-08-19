package com.sandeep.eventrabackend.service;

public class ExportOptionsDto {
    private boolean includeEmails;
    private String delimiter = ",";

    public boolean isIncludeEmails() {
        return includeEmails;
    }

    public void setIncludeEmails(boolean includeEmails) {
        this.includeEmails = includeEmails;
    }

    public String getDelimiter() {
        return delimiter;
    }

    public void setDelimiter(String delimiter) {
        this.delimiter = delimiter;
    }
}
