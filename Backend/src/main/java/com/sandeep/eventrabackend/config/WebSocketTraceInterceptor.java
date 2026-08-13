package com.sandeep.eventrabackend.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import java.util.Map;

/**
 * Handshake interceptor propagating OpenTelemetry trace spans to WebSocket contexts (#16507).
 */
public class WebSocketTraceInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        
        // Extract trace parent parameters from inbound handshake headers
        String traceParent = request.getHeaders().getFirst("traceparent");
        if (traceParent != null) {
            attributes.put("WEBSOCKET_TRACE_PARENT", traceParent);
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}
