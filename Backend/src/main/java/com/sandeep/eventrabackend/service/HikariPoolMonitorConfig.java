package com.sandeep.eventrabackend.service;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * HikariCP Connection Pool Monitor Configuration (#14085).
 * Enables leak detection threshold logs to identify database connection starvation.
 */
@Configuration
public class HikariPoolMonitorConfig {

    @Autowired(required = false)
    private HikariDataSource dataSource;

    @PostConstruct
    public void configureHikariLeakDetection() {
        if (dataSource != null) {
            // Log connections held open longer than 2 seconds
            dataSource.setLeakDetectionThreshold(2000);
            dataSource.setConnectionTimeout(5000);
        }
    }
}
