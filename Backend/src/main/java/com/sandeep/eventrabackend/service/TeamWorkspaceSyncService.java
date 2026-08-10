package com.sandeep.eventrabackend.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class TeamWorkspaceSyncService {

    private final Object lock = new Object();
    private List<Map<String, Object>> tasks = new ArrayList<>();
    private List<Map<String, Object>> pins = new ArrayList<>();
    private List<Map<String, Object>> chat = new ArrayList<>();
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public Map<String, Object> snapshot() {
        synchronized (lock) {
            return Map.of(
                    "tasks", List.copyOf(tasks),
                    "pins", List.copyOf(pins),
                    "chat", List.copyOf(chat)
            );
        }
    }

    public Map<String, Object> applyUpdate(Map<String, Object> body) {
        synchronized (lock) {
            if (body != null) {
                if (body.get("tasks") instanceof List<?> list) {
                    tasks = castList(list);
                }
                if (body.get("pins") instanceof List<?> list) {
                    pins = castList(list);
                }
                if (body.get("chat") instanceof List<?> list) {
                    chat = castList(list);
                }
            }
            Map<String, Object> snap = Map.of(
                    "tasks", List.copyOf(tasks),
                    "pins", List.copyOf(pins),
                    "chat", List.copyOf(chat)
            );
            broadcast("init", snap);
            return snap;
        }
    }

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(300_000L);
        emitters.add(emitter);
        Runnable cleanup = () -> emitters.remove(emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(ex -> cleanup.run());

        try {
            Map<String, Object> payload = new java.util.HashMap<>(snapshot());
            payload.put("type", "init");
            emitter.send(SseEmitter.event().name("message").data(payload, MediaType.APPLICATION_JSON));
        } catch (IOException ex) {
            cleanup.run();
            emitter.completeWithError(ex);
        }
        return emitter;
    }

    private void broadcast(String type, Map<String, Object> snap) {
        Map<String, Object> payload = new java.util.HashMap<>(snap);
        payload.put("type", type);
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("message").data(payload, MediaType.APPLICATION_JSON));
            } catch (IOException ex) {
                emitters.remove(emitter);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> castList(List<?> list) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                result.add((Map<String, Object>) map);
            }
        }
        return result;
    }
}
