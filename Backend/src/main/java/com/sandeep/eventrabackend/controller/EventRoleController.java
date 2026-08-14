package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.EventRoleAssignmentRequest;
import com.sandeep.eventrabackend.dto.response.EventRoleAuditResponse;
import com.sandeep.eventrabackend.dto.response.EventTeamMemberResponse;
import com.sandeep.eventrabackend.service.EventRoleService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/roles")
public class EventRoleController {

    private final EventRoleService eventRoleService;

    public EventRoleController(EventRoleService eventRoleService) {
        this.eventRoleService = eventRoleService;
    }

    @GetMapping
    public ResponseEntity<List<EventTeamMemberResponse>> getTeam(
            @PathVariable Long eventId,
            Authentication authentication) {
        return ResponseEntity.ok(eventRoleService.getTeam(eventId, authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<EventTeamMemberResponse> assignRole(
            @PathVariable Long eventId,
            @Valid @RequestBody EventRoleAssignmentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(eventRoleService.assignRole(eventId, request, authentication.getName()));
    }

    @GetMapping("/audit")
    public ResponseEntity<Page<EventRoleAuditResponse>> getAuditLog(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        return ResponseEntity.ok(eventRoleService.getAuditLog(eventId, authentication.getName(), page, size));
    }
}
