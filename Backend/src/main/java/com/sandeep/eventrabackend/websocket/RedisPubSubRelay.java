package com.sandeep.eventrabackend.websocket;

import org.springframework.stereotype.Component;

/**
 * Clustered message broker relay simulated wrapper using mock pubsub pipeline (#16269).
 */
@Component
public class RedisPubSubRelay {

    private final WebSocketSessionRegistry sessionRegistry;

    public RedisPubSubRelay(WebSocketSessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }

    public void publishMessage(String channel, String payload) {
        // System logs simulated relay publish actions to listeners
        System.out.println("[RedisPubSubRelay] Published to channel: " + channel + ", payload: " + payload);
    }
}
