package com.sandeep.eventrabackend.websocket;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Registry storing active clustered WebSocket session IDs (#16269).
 */
@Component
public class WebSocketSessionRegistry {

    private final Set<String> activeSessionIds = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void registerSession(String sessionId) {
        if (sessionId != null) {
            activeSessionIds.add(sessionId);
        }
    }

    public void removeSession(String sessionId) {
        if (sessionId != null) {
            activeSessionIds.remove(sessionId);
        }
    }

    public Set<String> getActiveSessionIds() {
        return activeSessionIds;
    }
}
