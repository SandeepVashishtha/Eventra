package com.sandeep.eventrabackend.config;

import org.springframework.stereotype.Component;

@Component
public class MigrationCheck {

    public void checkMigrationValidity(String scriptContent) throws RollbackException {
        String lower = scriptContent.toLowerCase();
        if (lower.contains("drop table") && !lower.contains("backup")) {
            throw new RollbackException("Database migration contains drop queries without backup safeguards - rolled back");
        }
    }
}
