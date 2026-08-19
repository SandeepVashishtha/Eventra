package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.AdminUpdateUserRequest;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    private AdminService service;

    @BeforeEach
    void setUp() {
        service = new AdminService(userRepository, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAsSuperAdmin() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin@example.com", null, List.of(new SimpleGrantedAuthority("SUPER_ADMIN"))));
    }

    private User user(Long id, String email) {
        return User.builder().id(id).firstName("Alice").lastName("Doe").username("alice").email(email).password("x").role(Role.ATTENDEE).build();
    }

    @Test
    @DisplayName("admin email change is rejected so the JWT and email-keyed data are not orphaned (#15297)")
    void emailChangeIsRejected() {
        authenticateAsSuperAdmin();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "alice@example.com")));

        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setEmail("bob@example.com");

        assertThrows(IllegalArgumentException.class, () -> service.updateUser(1L, request));
    }

    @Test
    @DisplayName("sending the current email back is a harmless no-op (#15297)")
    void sameEmailIsAllowed() {
        authenticateAsSuperAdmin();
        User alice = user(1L, "alice@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(userRepository.save(alice)).thenReturn(alice);

        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setEmail("ALICE@example.com");
        request.setFirstName("Alicia");

        assertDoesNotThrow(() -> service.updateUser(1L, request));
        assertEquals("alice@example.com", alice.getEmail());
        assertEquals("Alicia", alice.getFirstName());
    }
}
