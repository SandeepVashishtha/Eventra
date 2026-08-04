package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Notification;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class NotificationControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser1;
    private User testUser2;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();

        testUser1 = User.builder()
                .firstName("User1")
                .lastName("Test")
                .email("user1@example.com")
                .username("user1")
                .password("password")
                .role(Role.CLIENT)
                .build();
        userRepository.save(testUser1);

        testUser2 = User.builder()
                .firstName("User2")
                .lastName("Test")
                .email("user2@example.com")
                .username("user2")
                .password("password")
                .role(Role.CLIENT)
                .build();
        userRepository.save(testUser2);
    }

    @Test
    @DisplayName("GET /api/notifications returns empty list for user with no notifications")
    void testGetNotificationsEmpty() throws Exception {
        mockMvc.perform(get("/api/notifications")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/notifications returns 401 for unauthenticated request")
    void testGetNotificationsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/notifications returns notifications for authenticated user")
    void testGetNotificationsSuccess() throws Exception {
        Notification n1 = Notification.builder()
                .user(testUser1)
                .title("Title 1")
                .message("Message 1")
                .isRead(false)
                .build();
        notificationRepository.save(n1);

        mockMvc.perform(get("/api/notifications")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Title 1"))
                .andExpect(jsonPath("$[0].message").value("Message 1"))
                .andExpect(jsonPath("$[0].read").value(false));
    }

    @Test
    @DisplayName("GET /api/notifications filters notifications by user")
    void testGetNotificationsIsolation() throws Exception {
        Notification n1 = Notification.builder()
                .user(testUser1)
                .title("User 1 Notification")
                .message("Secret")
                .isRead(false)
                .build();
        notificationRepository.save(n1);

        Notification n2 = Notification.builder()
                .user(testUser2)
                .title("User 2 Notification")
                .message("Secret")
                .isRead(false)
                .build();
        notificationRepository.save(n2);

        mockMvc.perform(get("/api/notifications")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("User 1 Notification"));
    }

    @Test
    @DisplayName("GET /api/notifications returns notifications sorted by newest first")
    void testGetNotificationsSorting() throws Exception {
        Notification oldNotification = Notification.builder()
                .user(testUser1)
                .title("Old")
                .message("Old Message")
                .isRead(false)
                .build();
        notificationRepository.save(oldNotification);

        // Add small delay to ensure distinct @CreationTimestamp values
        Thread.sleep(100);

        Notification newNotification = Notification.builder()
                .user(testUser1)
                .title("New")
                .message("New Message")
                .isRead(false)
                .build();
        notificationRepository.save(newNotification);

        mockMvc.perform(get("/api/notifications")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title").value("New"))
                .andExpect(jsonPath("$[1].title").value("Old"));
    }

    @Test
    @DisplayName("PUT /api/notifications/{id}/read marks own notification as read")
    void testMarkAsReadSuccess() throws Exception {
        Notification n1 = Notification.builder()
                .user(testUser1)
                .title("Unread")
                .message("Msg")
                .isRead(false)
                .build();
        n1 = notificationRepository.save(n1);

        mockMvc.perform(put("/api/notifications/" + n1.getId() + "/read")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));
    }

    @Test
    @DisplayName("PUT /api/notifications/{id}/read returns 404 for non-existent notification")
    void testMarkAsReadNotFound() throws Exception {
        mockMvc.perform(put("/api/notifications/999/read")
                        .with(user("user1@example.com")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/notifications/{id}/read returns 404 for another user's notification")
    void testMarkAsReadIsolation() throws Exception {
        Notification n2 = Notification.builder()
                .user(testUser2)
                .title("User 2 Notification")
                .message("Secret")
                .isRead(false)
                .build();
        n2 = notificationRepository.save(n2);

        mockMvc.perform(put("/api/notifications/" + n2.getId() + "/read")
                        .with(user("user1@example.com")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/notifications/{id}/read returns 401 for unauthenticated request")
    void testMarkAsReadUnauthorized() throws Exception {
        mockMvc.perform(put("/api/notifications/1/read"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/notifications/{id}/read returns 200 for already-read notification")
    void testMarkAsReadAlreadyRead() throws Exception {
        Notification n1 = Notification.builder()
                .user(testUser1)
                .title("Read")
                .message("Msg")
                .isRead(true)
                .build();
        n1 = notificationRepository.save(n1);

        mockMvc.perform(put("/api/notifications/" + n1.getId() + "/read")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true));
    }
}
