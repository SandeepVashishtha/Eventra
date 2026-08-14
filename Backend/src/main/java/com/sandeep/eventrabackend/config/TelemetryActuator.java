package com.sandeep.eventrabackend.config;

import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
@Endpoint(id = "telemetry")
public class TelemetryActuator {

    @ReadOperation
    public Map<String, Object> getSystemTelemetry() {
        Map<String, Object> metrics = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();

        metrics.put("freeMemoryBytes", runtime.freeMemory());
        metrics.put("maxMemoryBytes", runtime.maxMemory());
        metrics.put("totalMemoryBytes", runtime.totalMemory());
        metrics.put("activeThreads", Thread.activeCount());
        metrics.put("systemStatus", "HEALTHY");

        return metrics;
    }
}
