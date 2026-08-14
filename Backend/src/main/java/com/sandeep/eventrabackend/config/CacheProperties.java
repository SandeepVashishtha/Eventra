package com.sandeep.eventrabackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "spring.cache.redis")
public class CacheProperties {

    private int timeToLiveMinutes = 10;

    public int getTimeToLiveMinutes() {
        return timeToLiveMinutes;
    }

    public void setTimeToLiveMinutes(int timeToLiveMinutes) {
        this.timeToLiveMinutes = timeToLiveMinutes;
    }
}
