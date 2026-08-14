package com.sandeep.eventrabackend.controller;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "eventra.validation")
public class ValidationProperties {

    private boolean enableStrictMatching = true;

    public boolean isEnableStrictMatching() {
        return enableStrictMatching;
    }

    public void setEnableStrictMatching(boolean enableStrictMatching) {
        this.enableStrictMatching = enableStrictMatching;
    }
}
