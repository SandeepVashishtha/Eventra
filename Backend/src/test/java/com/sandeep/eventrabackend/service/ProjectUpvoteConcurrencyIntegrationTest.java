package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import com.sandeep.eventrabackend.model.Project;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.ProjectRepository;
import com.sandeep.eventrabackend.repository.ProjectUpvoteRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class ProjectUpvoteConcurrencyIntegrationTest {

    private static final String USER_EMAIL = "race@example.com";

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectUpvoteRepository projectUpvoteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        projectUpvoteRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(User.builder()
                .firstName("Race")
                .lastName("Client")
                .email(USER_EMAIL)
                .username("raceclient")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());
    }

    @Test
    @DisplayName("Concurrent double-upvote returns a conflict, not a 500")
    void concurrentDoubleUpvote_ReturnsOneSuccessAndOneConflict() throws InterruptedException {
        Project project = Project.builder()
                .title("Raced Upvote")
                .description("Description")
                .category("Web Development")
                .thumbnailUrl("http://example.com/thumb.png")
                .githubUrl("http://github.com/test/raced")
                .upvotes(5)
                .build();
        project = projectRepository.save(project);
        Long projectId = project.getId();

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger conflictCount = new AtomicInteger();
        AtomicInteger unexpectedCount = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    ready.countDown();
                    start.await();
                    projectService.upvoteProject(projectId, USER_EMAIL);
                    successCount.incrementAndGet();
                } catch (RegistrationConflictException ex) {
                    conflictCount.incrementAndGet();
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                } catch (Exception ex) {
                    unexpectedCount.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
        }

        ready.await(10, TimeUnit.SECONDS);
        start.countDown();
        done.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        assertEquals(1, successCount.get(),
                "Exactly one thread should have upvoted successfully");
        assertEquals(1, conflictCount.get(),
                "The racing thread should receive a conflict, not a 500");
        assertEquals(0, unexpectedCount.get(),
                "No thread should have encountered an unexpected exception");

        Project updated = projectRepository.findById(projectId).orElseThrow();
        assertEquals(6, updated.getUpvotes(), "Upvote count should increment exactly once");
        assertEquals(1, projectUpvoteRepository.count(), "Exactly one upvote row should be persisted");
        assertTrue(done.getCount() == 0, "All racing threads should have finished");
    }
}
