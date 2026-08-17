package com.sandeep.eventrabackend.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Clustered message broker relay simulated wrapper using mock pubsub pipeline (#16269).
 */
@Component
@Slf4j
public class RedisPubSubRelay {

    private final WebSocketSessionRegistry sessionRegistry;

    public RedisPubSubRelay(WebSocketSessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }

    public void publishMessage(String channel, String payload) {
        log.info("[RedisPubSubRelay] Published to channel: {}, payload: {}", channel, payload);
    }
}

