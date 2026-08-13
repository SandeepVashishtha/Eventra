package com.sandeep.eventrabackend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

/**
 * Spring WebSockets dynamic handler mappings configuration class (#16269).
 */
@Configuration
@EnableWebSocket
public class ClusteredWebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register connection endpoint mappings securely
    }
}
