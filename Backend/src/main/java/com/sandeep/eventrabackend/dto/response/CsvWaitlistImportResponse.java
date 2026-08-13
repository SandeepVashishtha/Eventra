package com.sandeep.eventrabackend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.ArrayList;
import java.util.List;

/**
 * Response DTO for bulk CSV import of legacy waitlist data.
 * Contains import results including success/failure information for each entry.
 */
public class CsvWaitlistImportResponse {

    @Schema(description = "Total number of entries processed from CSV", example = "100")
    private int totalProcessed;

    @Schema(description = "Number of entries successfully imported", example = "95")
    private int successfulImports;

    @Schema(description = "Number of entries that failed to import", example = "5")
    private int failedImports;

    @Schema(description = "List of failed entries with error details")
    private List<ImportFailure> failures = new ArrayList<>();

    @Schema(description = "Message summarizing the import result")
    private String message;

    // Inner class for failed import details
    public static class ImportFailure {
        @Schema(description = "Index of the failed entry in the original CSV (0-based)", example = "2")
        private int entryIndex;

        @Schema(description = "Email of the failed entry", example = "invalid-email@example.com")
        private String email;

        @Schema(description = "Reason for failure", example = "User with email not found")
        private String reason;

        // Default constructor
        public ImportFailure() {}

        public ImportFailure(int entryIndex, String email, String reason) {
            this.entryIndex = entryIndex;
            this.email = email;
            this.reason = reason;
        }

        // Getters and setters
        public int getEntryIndex() {
            return entryIndex;
        }

        public void setEntryIndex(int entryIndex) {
            this.entryIndex = entryIndex;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    // Default constructor
    public CsvWaitlistImportResponse() {}

    public CsvWaitlistImportResponse(int totalProcessed, int successfulImports, int failedImports, String message) {
        this.totalProcessed = totalProcessed;
        this.successfulImports = successfulImports;
        this.failedImports = failedImports;
        this.message = message;
    }

    // Getters and setters
    public int getTotalProcessed() {
        return totalProcessed;
    }

    public void setTotalProcessed(int totalProcessed) {
        this.totalProcessed = totalProcessed;
    }

    public int getSuccessfulImports() {
        return successfulImports;
    }

    public void setSuccessfulImports(int successfulImports) {
        this.successfulImports = successfulImports;
    }

    public int getFailedImports() {
        return failedImports;
    }

    public void setFailedImports(int failedImports) {
        this.failedImports = failedImports;
    }

    public List<ImportFailure> getFailures() {
        return failures;
    }

    public void setFailures(List<ImportFailure> failures) {
        this.failures = failures;
    }

    public void addFailure(ImportFailure failure) {
        this.failures.add(failure);
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}