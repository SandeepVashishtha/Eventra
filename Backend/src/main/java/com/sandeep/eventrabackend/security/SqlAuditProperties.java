package com.sandeep.eventrabackend.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "eventra.security.sql")
public class SqlAuditProperties {

    private boolean blockOnDetection = true;

    public boolean isBlockOnDetection() {
        return blockOnDetection;
    }

    public void setBlockOnDetection(boolean blockOnDetection) {
        this.blockOnDetection = blockOnDetection;
    }
}
