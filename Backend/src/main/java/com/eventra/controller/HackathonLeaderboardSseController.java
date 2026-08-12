package com.eventra.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/v1/hackathons")
public class HackathonLeaderboardSseController {

    private static final Logger logger = Logger.getLogger(HackathonLeaderboardSseController.class.getName());
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> leaderboardEmitters = new ConcurrentHashMap<>();

    @GetMapping(value = "/{id}/leaderboard/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLeaderboardUpdates(@PathVariable("id") Long hackathonId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 min timeout

        leaderboardEmitters.computeIfAbsent(hackathonId, key -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(hackathonId, emitter));
        emitter.onTimeout(() -> removeEmitter(hackathonId, emitter));
        emitter.onError((ex) -> removeEmitter(hackathonId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data("Connected to leaderboard stream for hackathon " + hackathonId));
        } catch (IOException e) {
            removeEmitter(hackathonId, emitter);
        }

        return emitter;
    }

    public void broadcastLeaderboardUpdate(Long hackathonId, Object leaderboardData) {
        CopyOnWriteArrayList<SseEmitter> emitters = leaderboardEmitters.get(hackathonId);
        if (emitters == null || emitters.isEmpty()) return;

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("LEADERBOARD_UPDATE")
                        .data(leaderboardData, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                removeEmitter(hackathonId, emitter);
            }
        }
    }

    private void removeEmitter(Long hackathonId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = leaderboardEmitters.get(hackathonId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                leaderboardEmitters.remove(hackathonId);
            }
        }
    }
}
