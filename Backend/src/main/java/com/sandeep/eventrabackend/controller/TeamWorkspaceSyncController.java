package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.TeamWorkspaceSyncService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/hackathons/team/sync")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Hackathon Team Sync")
public class TeamWorkspaceSyncController {

    private final TeamWorkspaceSyncService teamWorkspaceSyncService;

    public TeamWorkspaceSyncController(TeamWorkspaceSyncService teamWorkspaceSyncService) {
        this.teamWorkspaceSyncService = teamWorkspaceSyncService;
    }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @RequestParam(required = false) String roomKey,
            @RequestParam(required = false) String hackathonId,
            @RequestParam(required = false) String teamId) {
        String resolved = teamWorkspaceSyncService.resolveRoomKey(roomKey, hackathonId, teamId);
        return teamWorkspaceSyncService.subscribe(resolved);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> pollOrUpdate(
            @RequestParam(required = false) String roomKey,
            @RequestParam(required = false) String hackathonId,
            @RequestParam(required = false) String teamId,
            @RequestBody(required = false) Map<String, Object> body) {
        String resolved = teamWorkspaceSyncService.resolveRoomKey(roomKey, hackathonId, teamId);
        if (body == null || body.isEmpty()) {
            return ResponseEntity.ok(teamWorkspaceSyncService.snapshot(resolved));
        }
        return ResponseEntity.ok(teamWorkspaceSyncService.applyUpdate(resolved, body));
    }
}
