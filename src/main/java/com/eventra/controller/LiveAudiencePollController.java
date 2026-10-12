package com.eventra.controller;

import com.eventra.service.LiveAudiencePollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/polls")
public class LiveAudiencePollController {

    @Autowired
    private LiveAudiencePollService pollService;

    @GetMapping(value = "/{pollId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamPollTally(@PathVariable Long pollId) {
        return pollService.subscribeToPollStream(pollId);
    }
}
