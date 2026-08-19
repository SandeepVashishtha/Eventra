package com.sandeep.eventrabackend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/stream")
public class StreamController {

    private final ConcurrentHashMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    @GetMapping(value = "/subtitles", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSubtitles(@RequestParam("channelId") String channelId) {
        SseEmitter emitter = new SseEmitter(60 * 1000L); // 1 minute timeout
        emitters.put(channelId, emitter);

        emitter.onCompletion(() -> emitters.remove(channelId));
        emitter.onTimeout(() -> emitters.remove(channelId));

        return emitter;
    }

    @PostMapping("/send-subtitle")
    public void sendSubtitle(@RequestParam("channelId") String channelId, @RequestBody String text) {
        SseEmitter emitter = emitters.get(channelId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().data(text));
            } catch (IOException e) {
                emitters.remove(channelId);
            }
        }
    }
}
