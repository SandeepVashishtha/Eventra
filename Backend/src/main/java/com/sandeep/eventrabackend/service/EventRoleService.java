package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.EventRoleAssignmentRequest;
import com.sandeep.eventrabackend.dto.response.EventRoleAuditResponse;
import com.sandeep.eventrabackend.dto.response.EventTeamMemberResponse;
import com.sandeep.eventrabackend.exception.EventNotFoundException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.EventRoleAuditLog;
import com.sandeep.eventrabackend.model.EventTeamMember;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.EventRoleAuditLogRepository;
import com.sandeep.eventrabackend.repository.EventTeamMemberRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventRoleService {

    private final EventRepository eventRepository;
    private final EventTeamMemberRepository eventTeamMemberRepository;
    private final EventRoleAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public EventRoleService(
            EventRepository eventRepository,
            EventTeamMemberRepository eventTeamMemberRepository,
            EventRoleAuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.eventTeamMemberRepository = eventTeamMemberRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void assignOwner(Event event, User owner) {
        upsertRole(event, owner, EventRole.OWNER, owner, "ASSIGNED");
    }

    @Transactional(readOnly = true)
    public boolean hasRole(Long eventId, String userEmail, EventRole requiredRole) {
        User user = findUser(userEmail);
        if (isPlatformAdmin(user) || isLegacyOwner(eventId, user.getId())) {
            return true;
        }

        return eventTeamMemberRepository.findByEvent_IdAndUser_Id(eventId, user.getId())
                .map(member -> member.getRole().includes(requiredRole))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public void requireRole(Long eventId, String userEmail, EventRole requiredRole) {
        if (!hasRole(eventId, userEmail, requiredRole)) {
            throw new AccessDeniedException("Insufficient event role for this action.");
        }
    }

    @Transactional
    public EventTeamMemberResponse assignRole(Long eventId, EventRoleAssignmentRequest request, String actorEmail) {
        Event event = findEvent(eventId);
        User actor = findUser(actorEmail);
        if (!isPlatformAdmin(actor)) {
            requireRole(eventId, actorEmail, EventRole.OWNER);
        }

        EventRole newRole = EventRole.from(request.getRole());
        if (newRole == EventRole.OWNER && !isPlatformAdmin(actor) && !hasOwnerRole(eventId, actor.getId())) {
            throw new AccessDeniedException("Only the event owner can transfer ownership.");
        }

        User target = findUser(request.getUserEmail());

        // If assigning OWNER, downgrade the current owner to ORGANIZER
        if (newRole == EventRole.OWNER) {
            eventTeamMemberRepository.findByEvent_IdAndRole(eventId, EventRole.OWNER)
                    .filter(member -> !member.getUser().getEmail().equals(request.getUserEmail()))
                    .ifPresent(currentOwner -> {
                        currentOwner.setRole(EventRole.ORGANIZER);
                        currentOwner.setAssignedAt(LocalDateTime.now());
                        eventTeamMemberRepository.save(currentOwner);
                        auditLogRepository.save(toAuditLog(eventId, currentOwner.getUser().getId(), actor, EventRole.OWNER, EventRole.ORGANIZER, "DOWNGRADED"));
                    });
            event.setOwnerId(target.getId());
            eventRepository.save(event);
        }

        EventTeamMember member = upsertRole(event, target, newRole, actor, "ASSIGNED");
        return toTeamMemberResponse(member);
    }

    @Transactional(readOnly = true)
    public List<EventTeamMemberResponse> getTeam(Long eventId, String actorEmail) {
        requireRole(eventId, actorEmail, EventRole.ORGANIZER);
        return eventTeamMemberRepository.findByEvent_IdOrderByRoleDescAssignedAtDesc(eventId)
                .stream()
                .map(this::toTeamMemberResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<EventRoleAuditResponse> getAuditLog(Long eventId, String actorEmail, int page, int size) {
        requireRole(eventId, actorEmail, EventRole.ORGANIZER);
        int clampedSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, clampedSize);
        return auditLogRepository.findByEventIdOrderByChangedAtDesc(eventId, pageable)
                .map(this::toAuditResponse);
    }

    private EventTeamMember upsertRole(Event event, User target, EventRole newRole, User actor, String action) {
        EventTeamMember member = eventTeamMemberRepository
                .findByEvent_IdAndUser_Id(event.getId(), target.getId())
                .orElseGet(EventTeamMember::new);

        EventRole previousRole = member.getRole();
        member.setEvent(event);
        member.setUser(target);
        member.setRole(newRole);
        member.setAssignedBy(actor);
        member.setAssignedAt(LocalDateTime.now());

        EventTeamMember saved = eventTeamMemberRepository.save(member);
        auditLogRepository.save(toAuditLog(event.getId(), target.getId(), actor, previousRole, newRole, action));
        return saved;
    }

    private EventRoleAuditLog toAuditLog(
            Long eventId,
            Long targetUserId,
            User actor,
            EventRole previousRole,
            EventRole newRole,
            String action) {
        EventRoleAuditLog log = new EventRoleAuditLog();
        log.setEventId(eventId);
        log.setTargetUserId(targetUserId);
        log.setActorUserId(actor != null ? actor.getId() : null);
        log.setPreviousRole(previousRole);
        log.setNewRole(newRole);
        log.setAction(action);
        return log;
    }

    private Event findEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private boolean isLegacyOwner(Long eventId, Long userId) {
        return eventRepository.findById(eventId)
                .map(event -> userId != null && userId.equals(event.getOwnerId()))
                .orElse(false);
    }

    private boolean hasOwnerRole(Long eventId, Long userId) {
        if (isLegacyOwner(eventId, userId)) {
            return true;
        }
        return eventTeamMemberRepository.findByEvent_IdAndUser_Id(eventId, userId)
                .map(member -> member.getRole() == EventRole.OWNER)
                .orElse(false);
    }

    private boolean isPlatformAdmin(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN;
    }

    private EventTeamMemberResponse toTeamMemberResponse(EventTeamMember member) {
        User user = member.getUser();
        return new EventTeamMemberResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                member.getRole().name(),
                member.getAssignedAt());
    }

    private EventRoleAuditResponse toAuditResponse(EventRoleAuditLog log) {
        return new EventRoleAuditResponse(
                log.getId(),
                log.getEventId(),
                log.getTargetUserId(),
                log.getActorUserId(),
                log.getPreviousRole() != null ? log.getPreviousRole().name() : null,
                log.getNewRole().name(),
                log.getAction(),
                log.getChangedAt());
    }
}
