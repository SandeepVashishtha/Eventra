package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.Hackathon;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.HackathonRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeamWorkspaceSyncServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private HackathonRepository hackathonRepository;

    @Mock
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    private TeamWorkspaceSyncService service;

    @BeforeEach
    void setUp() {
        service = new TeamWorkspaceSyncService(userRepository, hackathonRepository, hackathonRegistrationRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null));
    }

    private User user(Long id, String email, Role role) {
        return User.builder().id(id).email(email).username(email).password("x").role(role).build();
    }

    private Hackathon hackathon(Long id, Long ownerId) {
        return Hackathon.builder().id(id).title("Hack").ownerId(ownerId).build();
    }

    @Test
    @DisplayName("registered participant may read a hackathon team room (#15296)")
    void registeredMemberCanReadHackathonRoom() {
        authenticateAs("alice@example.com");
        when(userRepository.findByEmail("alice@example.com"))
                .thenReturn(Optional.of(user(1L, "alice@example.com", Role.ATTENDEE)));
        when(hackathonRepository.findById(10L)).thenReturn(Optional.of(hackathon(10L, 99L)));
        when(hackathonRegistrationRepository.existsByHackathon_IdAndUser_Email(10L, "alice@example.com"))
                .thenReturn(true);

        assertDoesNotThrow(() -> service.requireReadAccess("hackathon:10:team:7"));
    }

    @Test
    @DisplayName("non-member is denied read access to a hackathon team room (#15296)")
    void nonMemberCannotReadHackathonRoom() {
        authenticateAs("mallory@example.com");
        when(userRepository.findByEmail("mallory@example.com"))
                .thenReturn(Optional.of(user(1L, "mallory@example.com", Role.ATTENDEE)));
        when(hackathonRepository.findById(10L)).thenReturn(Optional.of(hackathon(10L, 99L)));
        when(hackathonRegistrationRepository.existsByHackathon_IdAndUser_Email(10L, "mallory@example.com"))
                .thenReturn(false);

        assertThrows(AccessDeniedException.class,
                () -> service.requireReadAccess("hackathon:10:team:7"));
    }

    @Test
    @DisplayName("hackathon owner may read their team room (#15296)")
    void ownerCanReadHackathonRoom() {
        authenticateAs("owner@example.com");
        when(userRepository.findByEmail("owner@example.com"))
                .thenReturn(Optional.of(user(99L, "owner@example.com", Role.ATTENDEE)));
        when(hackathonRepository.findById(10L)).thenReturn(Optional.of(hackathon(10L, 99L)));

        assertDoesNotThrow(() -> service.requireReadAccess("hackathon:10"));
    }

    @Test
    @DisplayName("platform admin may read any hackathon team room (#15296)")
    void adminCanReadHackathonRoom() {
        authenticateAs("admin@example.com");
        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(user(1L, "admin@example.com", Role.ADMIN)));

        assertDoesNotThrow(() -> service.requireReadAccess("hackathon:10:team:7"));
    }

    @Test
    @DisplayName("only the hackathon owner may write to a team room (#15296)")
    void onlyOwnerCanWriteToHackathonRoom() {
        authenticateAs("alice@example.com");
        when(userRepository.findByEmail("alice@example.com"))
                .thenReturn(Optional.of(user(1L, "alice@example.com", Role.ATTENDEE)));
        when(hackathonRepository.findById(10L)).thenReturn(Optional.of(hackathon(10L, 99L)));

        assertThrows(AccessDeniedException.class,
                () -> service.requireWriteAccess("hackathon:10:team:7"));
    }

    @Test
    @DisplayName("hackathon owner may write to their team room (#15296)")
    void ownerCanWriteToHackathonRoom() {
        authenticateAs("owner@example.com");
        when(userRepository.findByEmail("owner@example.com"))
                .thenReturn(Optional.of(user(99L, "owner@example.com", Role.ATTENDEE)));
        when(hackathonRepository.findById(10L)).thenReturn(Optional.of(hackathon(10L, 99L)));

        assertDoesNotThrow(() -> service.requireWriteAccess("hackathon:10:team:7"));
    }

    @Test
    @DisplayName("user room is scoped to the authenticated caller (#15296)")
    void userRoomAllowedForOwnEmail() {
        authenticateAs("Alice@Example.com");

        assertDoesNotThrow(() -> service.requireReadAccess("user:alice@example.com"));
        assertDoesNotThrow(() -> service.requireWriteAccess("user:alice@example.com"));
    }

    @Test
    @DisplayName("user room for another account is denied (#15296)")
    void userRoomDeniedForOtherEmail() {
        authenticateAs("alice@example.com");

        assertThrows(AccessDeniedException.class,
                () -> service.requireReadAccess("user:bob@example.com"));
        assertThrows(AccessDeniedException.class,
                () -> service.requireWriteAccess("user:bob@example.com"));
    }

    @Test
    @DisplayName("arbitrary custom room keys are rejected (#15296)")
    void customRoomKeyRejected() {
        authenticateAs("alice@example.com");

        assertThrows(AccessDeniedException.class,
                () -> service.requireReadAccess("some-arbitrary-room"));
        assertThrows(AccessDeniedException.class,
                () -> service.requireWriteAccess("some-arbitrary-room"));
    }

    @Test
    @DisplayName("resolveRoomKey uses provided roomKey when available")
    void resolveRoomKeyUsesProvidedKey() {
        assertEquals("hackathon:10:team:5", service.resolveRoomKey("hackathon:10:team:5", "10", "5"));
    }

    @Test
    @DisplayName("resolveRoomKey builds hackathon room prefix with hackathonId and teamId")
    void resolveRoomKeyWithHackathonAndTeam() {
        assertEquals("hackathon:10:team:7", service.resolveRoomKey(null, "10", "7"));
    }

    @Test
    @DisplayName("resolveRoomKey builds hackathon room prefix with hackathonId only")
    void resolveRoomKeyWithHackathonOnly() {
        assertEquals("hackathon:10", service.resolveRoomKey("", "10", null));
    }

    @Test
    @DisplayName("resolveRoomKey defaults to user room prefix when caller authenticated")
    void resolveRoomKeyWithUserPrefix() {
        authenticateAs("alice@example.com");
        assertEquals("user:alice@example.com", service.resolveRoomKey(null, null, null));
    }

    @Test
    @DisplayName("resolveRoomKey defaults to 'default' when no auth or params")
    void resolveRoomKeyDefaultFallback() {
        assertEquals("default", service.resolveRoomKey(null, null, null));
    }

    @Test
    @DisplayName("resolveRoomKeyForMember succeeds for registered member (#15367)")
    void resolveRoomKeyForMemberAllowed() {
        when(hackathonRegistrationRepository.existsByHackathon_IdAndUser_Email(10L, "alice@example.com"))
                .thenReturn(true);

        String resolved = service.resolveRoomKeyForMember(null, "10", "7", "alice@example.com");
        assertEquals("hackathon:10:team:7", resolved);
    }

    @Test
    @DisplayName("resolveRoomKeyForMember throws AccessDeniedException for non-member (#15367)")
    void resolveRoomKeyForMemberDenied() {
        when(hackathonRegistrationRepository.existsByHackathon_IdAndUser_Email(10L, "bob@example.com"))
                .thenReturn(false);

        assertThrows(AccessDeniedException.class,
                () -> service.resolveRoomKeyForMember(null, "10", "7", "bob@example.com"));
    }

    @Test
    @DisplayName("resolveRoomKeyForMember throws AccessDeniedException when room key cannot derive hackathon id")
    void resolveRoomKeyForMemberInvalidRoomKey() {
        assertThrows(AccessDeniedException.class,
                () -> service.resolveRoomKeyForMember("invalid-room-key", null, null, "alice@example.com"));
    }

    @Test
    @DisplayName("parseHackathonId throws AccessDeniedException for invalid hackathon room key format")
    void parseHackathonIdInvalidFormat() {
        authenticateAs("alice@example.com");
        assertThrows(AccessDeniedException.class,
                () -> service.requireReadAccess("hackathon:notanumber"));
    }
}
