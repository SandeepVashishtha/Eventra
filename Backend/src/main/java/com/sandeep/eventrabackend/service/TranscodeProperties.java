package com.sandeep.eventrabackend.service;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "eventra.transcode")
public class TranscodeProperties {

    private int audioBitrateKbps = 64;

    public int getAudioBitrateKbps() {
        return audioBitrateKbps;
    }

    public void setAudioBitrateKbps(int audioBitrateKbps) {
        this.audioBitrateKbps = audioBitrateKbps;
    }
}
