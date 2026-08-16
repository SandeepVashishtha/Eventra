package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.HackathonRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TeamWorkspaceSyncService {

    private static final Pattern HACKATHON_ROOM_KEY =
            Pattern.compile("^hackathon:(\\d+)(?::team:.*)?$");

    private static final String HACKATHON_ROOM_PREFIX = "hackathon:";
    private static final String USER_ROOM_PREFIX = "user:";

    private static final class WorkspaceState {
        private final Object lock = new Object();
        private List<Map<String, Object>> tasks = new ArrayList<>();
        private List<Map<String, Object>> pins = new ArrayList<>();
        private List<Map<String, Object>> chat = new ArrayList<>();
        private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    }

    private final ConcurrentHashMap<String, WorkspaceState> rooms = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final HackathonRepository hackathonRepository;
    private final HackathonRegistrationRepository hackathonRegistrationRepository;

    public TeamWorkspaceSyncService(
            UserRepository userRepository,
            HackathonRepository hackathonRepository,
            HackathonRegistrationRepository hackathonRegistrationRepository) {
        this.userRepository = userRepository;
        this.hackathonRepository = hackathonRepository;
        this.hackathonRegistrationRepository = hackathonRegistrationRepository;
    }

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
        requireWriteAccess(roomKey);
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
            return HACKATHON_ROOM_PREFIX + hackathonId.trim() + ":team:" + teamId.trim();
        }
        if (StringUtils.hasText(hackathonId)) {
            return HACKATHON_ROOM_PREFIX + hackathonId.trim();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && StringUtils.hasText(auth.getName())) {
            return USER_ROOM_PREFIX + auth.getName().trim().toLowerCase();
        }
        return "default";
    }

    /**
     * Resolves the room key exactly like {@link #resolveRoomKey(String, String, String)}
     * but only after verifying that the caller is a registered member of the
     * hackathon identified by the supplied {@code hackathonId} (or embedded in
     * {@code roomKey}). This stops any authenticated user from guessing another
     * team's enumerable {@code hackathonId}/{@code teamId} and reading or
     * overwriting its workspace (#15367).
     *
     * @param userEmail the authenticated caller's email (never a client-supplied claim)
     */
    public String resolveRoomKeyForMember(String roomKey, String hackathonId, String teamId, String userEmail) {
        String resolved = resolveRoomKey(roomKey, hackathonId, teamId);
        Long hackathon = extractHackathonId(resolved);
        if (hackathon == null) {
            throw new AccessDeniedException(
                    "A hackathon workspace room is required. Provide a valid hackathonId and teamId.");
        }
        if (userEmail == null || !hackathonRegistrationRepository
                .existsByHackathon_IdAndUser_Email(hackathon, userEmail)) {
            throw new AccessDeniedException(
                    "You are not a member of this hackathon and cannot access its team workspace.");
        }
        return resolved;
    }

    private Long extractHackathonId(String roomKey) {
        if (!StringUtils.hasText(roomKey)) {
            return null;
        }
        Matcher matcher = HACKATHON_ROOM_KEY.matcher(roomKey.trim());
        if (!matcher.matches()) {
            return null;
        }
        try {
            return Long.valueOf(matcher.group(1));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    /**
     * Authorize reading a room. Hackathon rooms require the caller to be a
     * registered participant or owner; user rooms are scoped to the caller's
     * own account; arbitrary custom room keys are rejected (#15296).
     */
    public void requireReadAccess(String roomKey) {
        if (!StringUtils.hasText(roomKey)) {
            throw new AccessDeniedException("Room key is required.");
        }
        String normalized = roomKey.trim().toLowerCase();
        if (normalized.startsWith(HACKATHON_ROOM_PREFIX)) {
            requireHackathonMembership(parseHackathonId(roomKey));
            return;
        }
        if (normalized.startsWith(USER_ROOM_PREFIX)) {
            requireOwnUserRoom(roomKey);
            return;
        }
        throw new AccessDeniedException("Custom room keys are not allowed.");
    }

    /**
     * Authorize mutating a room. Only the hackathon owner (or a platform
     * admin) may overwrite a team workspace; user rooms are write-scoped to
     * the caller's own account (#15296).
     */
    public void requireWriteAccess(String roomKey) {
        if (!StringUtils.hasText(roomKey)) {
            throw new AccessDeniedException("Room key is required.");
        }
        String normalized = roomKey.trim().toLowerCase();
        if (normalized.startsWith(HACKATHON_ROOM_PREFIX)) {
            requireHackathonOwnership(parseHackathonId(roomKey));
            return;
        }
        if (normalized.startsWith(USER_ROOM_PREFIX)) {
            requireOwnUserRoom(roomKey);
            return;
        }
        throw new AccessDeniedException("Custom room keys are not allowed.");
    }

    private void requireHackathonMembership(Long hackathonId) {
        User user = currentUser();
        if (isPlatformAdmin(user) || isHackathonOwner(hackathonId, user)) {
            return;
        }
        if (!hackathonRegistrationRepository.existsByHackathon_IdAndUser_Email(hackathonId, user.getEmail())) {
            throw new AccessDeniedException("You are not a member of this hackathon team workspace.");
        }
    }

    private void requireHackathonOwnership(Long hackathonId) {
        User user = currentUser();
        if (isPlatformAdmin(user) || isHackathonOwner(hackathonId, user)) {
            return;
        }
        throw new AccessDeniedException("Only the hackathon owner can update the team workspace.");
    }

    private void requireOwnUserRoom(String roomKey) {
        String expected = USER_ROOM_PREFIX + authenticatedEmail().trim().toLowerCase();
        if (!expected.equals(roomKey.trim().toLowerCase())) {
            throw new AccessDeniedException("Workspace rooms are scoped to your own account.");
        }
    }

    private boolean isHackathonOwner(Long hackathonId, User user) {
        return hackathonRepository.findById(hackathonId)
                .map(hackathon -> user.getId() != null && user.getId().equals(hackathon.getOwnerId()))
                .orElse(false);
    }

    private Long parseHackathonId(String roomKey) {
        String remainder = roomKey.substring(HACKATHON_ROOM_PREFIX.length());
        int teamMarker = remainder.indexOf(":team:");
        if (teamMarker != -1) {
            remainder = remainder.substring(0, teamMarker);
        }
        try {
            return Long.parseLong(remainder.trim());
        } catch (NumberFormatException ex) {
            throw new AccessDeniedException("Invalid hackathon room key.");
        }
    }

    private User currentUser() {
        return userRepository.findByEmail(authenticatedEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found for authenticated principal."));
    }

    private String authenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !StringUtils.hasText(auth.getName())) {
            throw new AccessDeniedException("Authentication required.");
        }
        return auth.getName();
    }

    private boolean isPlatformAdmin(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN;
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
