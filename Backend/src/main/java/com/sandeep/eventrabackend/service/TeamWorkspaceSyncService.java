package com.sandeep.eventrabackend.service;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class TeamWorkspaceSyncService {

    private static final class WorkspaceState {
        private final Object lock = new Object();
        private List<Map<String, Object>> tasks = new ArrayList<>();
        private List<Map<String, Object>> pins = new ArrayList<>();
        private List<Map<String, Object>> chat = new ArrayList<>();
        private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    }

    private final ConcurrentHashMap<String, WorkspaceState> rooms = new ConcurrentHashMap<>();

    public Map<String, Object> snapshot(String roomKey) {
        WorkspaceState room = roomFor(roomKey);
        synchronized (room.lock) {
            return Map.of(
                    "tasks", List.copyOf(room.tasks),
                    "pins", List.copyOf(room.pins),
                    "chat", List.copyOf(room.chat)
            );
        }
    }

    public Map<String, Object> applyUpdate(String roomKey, Map<String, Object> body) {
        WorkspaceState room = roomFor(roomKey);
        synchronized (room.lock) {
            if (body != null) {
                if (body.get("tasks") instanceof List<?> list) {
                    room.tasks = castList(list);
                }
                if (body.get("pins") instanceof List<?> list) {
                    room.pins = castList(list);
                }
                if (body.get("chat") instanceof List<?> list) {
                    room.chat = castList(list);
                }
            }
            Map<String, Object> snap = Map.of(
                    "tasks", List.copyOf(room.tasks),
                    "pins", List.copyOf(room.pins),
                    "chat", List.copyOf(room.chat)
            );
            broadcast(room, "init", snap);
            return snap;
        }
    }

    public SseEmitter subscribe(String roomKey) {
        WorkspaceState room = roomFor(roomKey);
        SseEmitter emitter = new SseEmitter(300_000L);
        room.emitters.add(emitter);
        Runnable cleanup = () -> room.emitters.remove(emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(ex -> cleanup.run());

        try {
            Map<String, Object> payload = new java.util.HashMap<>(snapshot(roomKey));
            payload.put("type", "init");
            emitter.send(SseEmitter.event().name("message").data(payload, MediaType.APPLICATION_JSON));
        } catch (IOException ex) {
            cleanup.run();
            emitter.completeWithError(ex);
        }
        return emitter;
    }

    public String resolveRoomKey(String roomKey, String hackathonId, String teamId) {
        if (StringUtils.hasText(roomKey)) {
            return roomKey.trim();
        }
        if (StringUtils.hasText(hackathonId) && StringUtils.hasText(teamId)) {
            return "hackathon:" + hackathonId.trim() + ":team:" + teamId.trim();
        }
        if (StringUtils.hasText(hackathonId)) {
            return "hackathon:" + hackathonId.trim();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && StringUtils.hasText(auth.getName())) {
            return "user:" + auth.getName().trim().toLowerCase();
        }
        return "default";
    }

    private WorkspaceState roomFor(String roomKey) {
        return rooms.computeIfAbsent(roomKey, key -> new WorkspaceState());
    }

    private void broadcast(WorkspaceState room, String type, Map<String, Object> snap) {
        Map<String, Object> payload = new java.util.HashMap<>(snap);
        payload.put("type", type);
        for (SseEmitter emitter : room.emitters) {
            try {
                emitter.send(SseEmitter.event().name("message").data(payload, MediaType.APPLICATION_JSON));
            } catch (IOException ex) {
                room.emitters.remove(emitter);
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
