package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.LiveAudiencePollRepository;
import com.sandeep.eventrabackend.repository.LiveAudiencePollVoteRepository;
import com.sandeep.eventrabackend.repository.LiveAudienceQuestionRepository;
import com.sandeep.eventrabackend.repository.LiveAudienceQuestionUpvoteRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class LiveAudienceControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LiveAudienceQuestionRepository questionRepository;

    @Autowired
    private LiveAudienceQuestionUpvoteRepository questionUpvoteRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private LiveAudiencePollRepository pollRepository;

    @Autowired
    private LiveAudiencePollVoteRepository pollVoteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long eventId;
    private final String organizerEmail = "liveorganizer@example.com";
    private final String attendeeEmail = "liveattendee@example.com";

    @BeforeEach
    void setUp() {
        pollVoteRepository.deleteAll();
        pollRepository.deleteAll();
        questionUpvoteRepository.deleteAll();
        questionRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        User organizer = User.builder()
                .firstName("Live")
                .lastName("Organizer")
                .email(organizerEmail)
                .username("liveorganizer")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(organizer);

        User attendee = User.builder()
                .firstName("Live")
                .lastName("Attendee")
                .email(attendeeEmail)
                .username("liveattendee")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(attendee);

        Event event = new Event();
        event.setTitle("Live Audience Test Event");
        event.setCapacity(50);
        event.setEventDate(LocalDateTime.now().plusDays(1));
        event.setOwnerId(organizer.getId());
        event.setPublic(true);
        event = eventRepository.save(event);
        eventId = event.getId();
    }

    @Test
    @DisplayName("GET /api/events/{id}/live-audience — empty board")
    void testGetInitialDataEmpty() throws Exception {
        mockMvc.perform(get("/api/events/{id}/live-audience", eventId)
                        .with(user(attendeeEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions", hasSize(0)))
                .andExpect(jsonPath("$.activePoll").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/events/{id}/live-audience — 404 event not found")
    void testGetInitialDataEventNotFound() throws Exception {
        mockMvc.perform(get("/api/events/99999/live-audience")
                        .with(user(attendeeEmail)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/events/{id}/live-audience — 401 unauthenticated")
    void testGetInitialDataUnauthorized() throws Exception {
        mockMvc.perform(get("/api/events/{id}/live-audience", eventId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/events/{id}/live-audience/questions — success")
    void testCreateQuestionSuccess() throws Exception {
        mockMvc.perform(post("/api/events/{id}/live-audience/questions", eventId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("text", "Will there be a networking session?"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.text").value("Will there be a networking session?"))
                .andExpect(jsonPath("$.upvotes").value(0))
                .andExpect(jsonPath("$.flagged").value(false))
                .andExpect(jsonPath("$.isSpeaker").value(false))
                .andExpect(jsonPath("$.userName").value("Live Attendee"));
    }

    @Test
    @DisplayName("POST /api/events/{id}/live-audience/questions — 400 blank text")
    void testCreateQuestionBlankText() throws Exception {
        mockMvc.perform(post("/api/events/{id}/live-audience/questions", eventId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("text", "   "))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/events/{id}/live-audience/questions — 401 unauthenticated")
    void testCreateQuestionUnauthorized() throws Exception {
        mockMvc.perform(post("/api/events/{id}/live-audience/questions", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("text", "Hello?"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST upvote — success then duplicate rejected")
    void testUpvoteQuestion() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/events/{id}/live-audience/questions", eventId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("text", "When is lunch?"))))
                .andExpect(status().isCreated())
                .andReturn();

        long questionId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/events/{id}/live-audience/questions/{qid}/upvote", eventId, questionId)
                        .with(user(attendeeEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upvotes").value(1));

        mockMvc.perform(post("/api/events/{id}/live-audience/questions/{qid}/upvote", eventId, questionId)
                        .with(user(attendeeEmail)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST flag — owner can flag, plain attendee cannot")
    void testFlagQuestionAuthorization() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/events/{id}/live-audience/questions", eventId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("text", "Spam question"))))
                .andExpect(status().isCreated())
                .andReturn();

        long questionId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/events/{id}/live-audience/questions/{qid}/flag", eventId, questionId)
                        .with(user(attendeeEmail)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/events/{id}/live-audience/questions/{qid}/flag", eventId, questionId)
                        .with(user(organizerEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.flagged").value(true));
    }

    @Test
    @DisplayName("DELETE question — owner deletes, board empty")
    void testDeleteQuestion() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/events/{id}/live-audience/questions", eventId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("text", "Remove me"))))
                .andExpect(status().isCreated())
                .andReturn();

        long questionId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(delete("/api/events/{id}/live-audience/questions/{qid}", eventId, questionId)
                        .with(user(organizerEmail)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/events/{id}/live-audience", eventId)
                        .with(user(attendeeEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions", hasSize(0)));
    }

    @Test
    @DisplayName("POST /polls — organizer creates poll")
    void testCreatePoll() throws Exception {
        mockMvc.perform(post("/api/events/{id}/live-audience/polls", eventId)
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of(
                                        "question", "How was the keynote?",
                                        "type", "single",
                                        "options", List.of("Excellent", "Good", "Poor")))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.question").value("How was the keynote?"))
                .andExpect(jsonPath("$.status").value("active"))
                .andExpect(jsonPath("$.options", hasSize(3)))
                .andExpect(jsonPath("$.results.Excellent").value(0));
    }

    @Test
    @DisplayName("POST /polls — attendee forbidden, too-few options rejected")
    void testCreatePollValidation() throws Exception {
        mockMvc.perform(post("/api/events/{id}/live-audience/polls", eventId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of(
                                        "question", "Any questions?",
                                        "options", List.of("Yes", "No")))))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/events/{id}/live-audience/polls", eventId)
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of(
                                        "question", "One option only",
                                        "options", List.of("Only")))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /polls/{id}/vote — success, duplicate rejected, closed rejected")
    void testSubmitVote() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/events/{id}/live-audience/polls", eventId)
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of(
                                        "question", "How was the keynote?",
                                        "options", List.of("Excellent", "Good")))))
                .andExpect(status().isCreated())
                .andReturn();

        long pollId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/events/{id}/live-audience/polls/{pid}/vote", eventId, pollId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("option", "Excellent"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results.Excellent").value(1));

        mockMvc.perform(post("/api/events/{id}/live-audience/polls/{pid}/vote", eventId, pollId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("option", "Excellent"))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/events/{id}/live-audience/polls/{pid}/vote", eventId, pollId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("option", "Unknown"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /polls/{id}/status — owner closes poll, votes then rejected")
    void testClosePollBlocksVotes() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/events/{id}/live-audience/polls", eventId)
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of(
                                        "question", "Vote please",
                                        "options", List.of("A", "B")))))
                .andExpect(status().isCreated())
                .andReturn();

        long pollId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/events/{id}/live-audience/polls/{pid}/status", eventId, pollId)
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("status", "closed"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("closed"));

        mockMvc.perform(post("/api/events/{id}/live-audience/polls/{pid}/vote", eventId, pollId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("option", "A"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /polls — duplicate option texts rejected (#15301)")
    void testCreatePollRejectsDuplicateOptions() throws Exception {
        mockMvc.perform(post("/api/events/{id}/live-audience/polls", eventId)
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of(
                                        "question", "Duplicate options?",
                                        "type", "single",
                                        "options", List.of("Yes", "Yes", "No")))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/events/{id}/live-audience/polls", eventId)
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of(
                                        "question", "Case-insensitive dupes?",
                                        "type", "single",
                                        "options", List.of("Yes", "yes", "No")))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET initial data — reflects persisted questions and latest poll")
    void testGetInitialDataPopulated() throws Exception {
        mockMvc.perform(post("/api/events/{id}/live-audience/questions", eventId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("text", "Question one"))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/events/{id}/live-audience/polls", eventId)
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("question", "Poll question", "options", List.of("Yes", "No")))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/events/{id}/live-audience", eventId)
                        .with(user(attendeeEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions", hasSize(1)))
                .andExpect(jsonPath("$.questions[0].text").value("Question one"))
                .andExpect(jsonPath("$.activePoll.question").value("Poll question"));
    }

    @Test
    @DisplayName("Private event — unregistered users are denied on all read/write paths (#16198)")
    void testPrivateEventDeniesUnregisteredUser() throws Exception {
        Event privateEvent = new Event();
        privateEvent.setTitle("Private Live Audience Event");
        privateEvent.setCapacity(20);
        privateEvent.setEventDate(LocalDateTime.now().plusDays(1));
        privateEvent.setOwnerId(userRepository.findByEmail(organizerEmail).orElseThrow().getId());
        privateEvent.setPublic(false);
        privateEvent = eventRepository.save(privateEvent);
        Long privateEventId = privateEvent.getId();

        String intruderEmail = "intruder@example.com";
        userRepository.save(User.builder()
                .firstName("Intruder")
                .lastName("User")
                .email(intruderEmail)
                .username("intruder")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        mockMvc.perform(get("/api/events/{id}/live-audience", privateEventId)
                        .with(user(intruderEmail)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/events/{id}/live-audience/questions", privateEventId)
                        .with(user(intruderEmail)))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/events/{id}/live-audience/questions", privateEventId)
                        .with(user(intruderEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("text", "Sneaky question"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/events/{id}/live-audience/polls", privateEventId)
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("question", "Vote?", "options", List.of("A", "B")))))
                .andExpect(status().isCreated());

        long pollId = objectMapper.readTree(
                        mockMvc.perform(post("/api/events/{id}/live-audience/polls", privateEventId)
                                        .with(user(organizerEmail))
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(
                                                java.util.Map.of("question", "Vote?", "options", List.of("A", "B")))))
                                .andExpect(status().isCreated())
                                .andReturn().getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(post("/api/events/{id}/live-audience/polls/{pid}/vote", privateEventId, pollId)
                        .with(user(intruderEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("option", "A"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Private event — organizer and registered participant are allowed (#16198)")
    void testPrivateEventAllowsOrganizerAndParticipant() throws Exception {
        Event privateEvent = new Event();
        privateEvent.setTitle("Private Live Audience Event");
        privateEvent.setCapacity(20);
        privateEvent.setEventDate(LocalDateTime.now().plusDays(1));
        privateEvent.setOwnerId(userRepository.findByEmail(organizerEmail).orElseThrow().getId());
        privateEvent.setPublic(false);
        privateEvent = eventRepository.save(privateEvent);
        Long privateEventId = privateEvent.getId();

        User attendee = userRepository.findByEmail(attendeeEmail).orElseThrow();
        EventRegistration registration = new EventRegistration();
        registration.setEvent(privateEvent);
        registration.setUser(attendee);
        registration.setStatus("CONFIRMED");
        eventRegistrationRepository.save(registration);

        // Registered participant can read and post.
        mockMvc.perform(get("/api/events/{id}/live-audience", privateEventId)
                        .with(user(attendeeEmail)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/events/{id}/live-audience/questions", privateEventId)
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("text", "Registered question"))))
                .andExpect(status().isCreated());

        // Organizer (owner) can read too.
        mockMvc.perform(get("/api/events/{id}/live-audience/questions", privateEventId)
                        .with(user(organizerEmail)))
                .andExpect(status().isOk());
    }
}
