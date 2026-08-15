package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.CreatePollRequest;
import com.sandeep.eventrabackend.dto.response.LiveAudienceDataResponse;
import com.sandeep.eventrabackend.dto.response.LiveAudiencePollResponse;
import com.sandeep.eventrabackend.dto.response.LiveAudienceQuestionResponse;
import com.sandeep.eventrabackend.exception.EventNotFoundException;
import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.LiveAudiencePoll;
import com.sandeep.eventrabackend.model.LiveAudiencePollVote;
import com.sandeep.eventrabackend.model.LiveAudienceQuestion;
import com.sandeep.eventrabackend.model.LiveAudienceQuestionUpvote;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.LiveAudiencePollRepository;
import com.sandeep.eventrabackend.repository.LiveAudiencePollVoteRepository;
import com.sandeep.eventrabackend.repository.LiveAudienceQuestionRepository;
import com.sandeep.eventrabackend.repository.LiveAudienceQuestionUpvoteRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LiveAudienceService {

    private static final String TOPIC = "live-audience";
    private static final List<String> POLL_STATUSES = List.of("active", "paused", "closed");
    private static final List<String> POLL_TYPES = List.of("single", "multiple");

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final UserRepository userRepository;
    private final EventRoleService eventRoleService;
    private final LiveAudienceQuestionRepository questionRepository;
    private final LiveAudienceQuestionUpvoteRepository questionUpvoteRepository;
    private final LiveAudiencePollRepository pollRepository;
    private final LiveAudiencePollVoteRepository pollVoteRepository;
    private final EventStreamService eventStreamService;

    @Transactional(readOnly = true)
    public LiveAudienceDataResponse getInitialData(Long eventId, String email) {
        requireEventAccess(eventId, email);
        List<LiveAudienceQuestionResponse> questions = getQuestions(eventId, email);
        LiveAudiencePollResponse activePoll = pollRepository
                .findByEventIdOrderByCreatedAtDesc(eventId)
                .stream()
                .findFirst()
                .map(this::toPollResponse)
                .orElse(null);
        return LiveAudienceDataResponse.builder()
                .questions(questions)
                .activePoll(activePoll)
                .build();
    }

    @Transactional(readOnly = true)
    public List<LiveAudienceQuestionResponse> getQuestions(Long eventId, String email) {
        requireEventAccess(eventId, email);
        return questionRepository
                .findByEventIdOrderByUpvotesDescCreatedAtDesc(eventId)
                .stream()
                .map(this::toQuestionResponse)
                .toList();
    }
    @Transactional
    public LiveAudienceQuestionResponse createQuestion(Long eventId, String text, String email) {
        requireEventAccess(eventId, email);
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Question text is required");
        }
        String trimmed = text.trim();
        if (trimmed.length() > 500) {
            throw new IllegalArgumentException("Question text must not exceed 500 characters");
        }
        User user = getUser(email);
        LiveAudienceQuestion question = LiveAudienceQuestion.builder()
                .eventId(eventId)
                .userId(user.getId())
                .userName(displayName(user))
                .text(trimmed)
                .upvotes(0)
                .flagged(false)
                .isSpeaker(eventRoleService.hasRole(eventId, email, EventRole.ORGANIZER))
                .build();
        question = questionRepository.save(question);
        LiveAudienceQuestionResponse response = toQuestionResponse(question);
        publish(eventId, "NEW_QUESTION", response);
        return response;
    }

    @Transactional
    public LiveAudienceQuestionResponse upvoteQuestion(Long eventId, Long questionId, String email) {
        requireEventAccess(eventId, email);
        requireQuestion(eventId, questionId);
        User user = getUser(email);
        if (questionUpvoteRepository.existsByQuestionIdAndUserId(questionId, user.getId())) {
            throw new IllegalArgumentException("You have already upvoted this question");
        }
        try {
            // saveAndFlush surfaces a concurrent unique-constraint violation
            // here so we can map it to a friendly conflict instead of a 500,
            // mirroring ProjectService.upvoteProject (#14509).
            questionUpvoteRepository.saveAndFlush(LiveAudienceQuestionUpvote.builder()
                    .questionId(questionId)
                    .userId(user.getId())
                    .build());
        } catch (DataIntegrityViolationException ex) {
            throw new RegistrationConflictException("You have already upvoted this question");
        }
        // Atomic bulk increment: concurrent upvotes cannot lose updates (#14509).
        questionRepository.incrementUpvotes(questionId);
        // The bulk update cleared the persistence context; re-read for the
        // fresh counter.
        LiveAudienceQuestion question = requireQuestion(eventId, questionId);
        LiveAudienceQuestionResponse response = toQuestionResponse(question);
        publish(eventId, "UPDATE_QUESTION", response);
        return response;
    }

    @Transactional
    public LiveAudienceQuestionResponse flagQuestion(Long eventId, Long questionId, String email) {
        requireEvent(eventId);
        requireModerator(eventId, email);
        LiveAudienceQuestion question = requireQuestion(eventId, questionId);
        question.setFlagged(true);
        question = questionRepository.save(question);
        LiveAudienceQuestionResponse response = toQuestionResponse(question);
        publish(eventId, "UPDATE_QUESTION", response);
        return response;
    }

    @Transactional
    public void deleteQuestion(Long eventId, Long questionId, String email) {
        requireEvent(eventId);
        requireModerator(eventId, email);
        requireQuestion(eventId, questionId);
        // Remove the question's upvotes first so they are not orphaned in
        // live_audience_question_upvotes (#14509).
        questionUpvoteRepository.deleteByQuestionId(questionId);
        questionRepository.deleteById(questionId);
        publish(eventId, "DELETE_QUESTION", questionId);
    }

    @Transactional
    public LiveAudiencePollResponse createPoll(Long eventId, CreatePollRequest request, String email) {
        requireEvent(eventId);
        requireModerator(eventId, email);
        String type = request.getType() == null || request.getType().isBlank() ? "single" : request.getType().trim();
        if (!POLL_TYPES.contains(type)) {
            throw new IllegalArgumentException("Poll type must be 'single' or 'multiple'");
        }
        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new IllegalArgumentException("A poll needs at least 2 options");
        }
        if (request.getOptions().size() > 10) {
            throw new IllegalArgumentException("A poll can have at most 10 options");
        }
        List<String> options = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (String option : request.getOptions()) {
            if (option == null || option.isBlank()) {
                throw new IllegalArgumentException("Poll options cannot be blank");
            }
            String normalized = option.trim();
            if (!seen.add(normalized.toLowerCase(Locale.ROOT))) {
                throw new IllegalArgumentException("Poll options must be unique");
            }
            options.add(normalized);
        }
        Map<String, Object> results = new HashMap<>();
        options.forEach(opt -> results.put(opt, 0));

        LiveAudiencePoll poll = LiveAudiencePoll.builder()
                .eventId(eventId)
                .question(request.getQuestion().trim())
                .type(type)
                .status("active")
                .options(options)
                .results(results)
                .build();
        poll = pollRepository.save(poll);
        LiveAudiencePollResponse response = toPollResponse(poll);
        publish(eventId, "SET_POLL", response);
        return response;
    }

    @Transactional
    public LiveAudiencePollResponse updatePollStatus(Long eventId, Long pollId, String status, String email) {
        requireEvent(eventId);
        requireModerator(eventId, email);
        if (!POLL_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Poll status must be 'active', 'paused' or 'closed'");
        }
        LiveAudiencePoll poll = requirePoll(eventId, pollId);
        poll.setStatus(status);
        poll.setUpdatedAt(LocalDateTime.now());
        poll = pollRepository.save(poll);
        LiveAudiencePollResponse response = toPollResponse(poll);
        publish(eventId, "UPDATE_POLL", response);
        return response;
    }

    @Transactional
    public LiveAudiencePollResponse submitVote(Long eventId, Long pollId, String option, String email) {
        requireEventAccess(eventId, email);
        LiveAudiencePoll poll = requirePollForUpdate(eventId, pollId);
        if ("closed".equals(poll.getStatus())) {
            throw new IllegalArgumentException("Voting is closed for this poll");
        }
        if ("paused".equals(poll.getStatus())) {
            throw new IllegalArgumentException("Voting is paused for this poll");
        }
        User user = getUser(email);
        if (pollVoteRepository.existsByPollIdAndUserId(pollId, user.getId())) {
            throw new IllegalArgumentException("You have already voted in this poll");
        }
        String trimmed = option == null ? "" : option.trim();
        if (!poll.getOptions().contains(trimmed)) {
            throw new IllegalArgumentException("Selected option is not part of this poll");
        }
        try {
            // saveAndFlush surfaces a concurrent unique-constraint violation
            // here so we can map it to a friendly conflict instead of a 500
            // (#14509).
            pollVoteRepository.saveAndFlush(LiveAudiencePollVote.builder()
                    .pollId(pollId)
                    .userId(user.getId())
                    .optionText(trimmed)
                    .build());
        } catch (DataIntegrityViolationException ex) {
            throw new RegistrationConflictException("You have already voted in this poll");
        }
        // The poll row is locked (PESSIMISTIC_WRITE), so the read-modify-write
        // on the results JSON cannot lose concurrent updates (#14509).
        Map<String, Object> results = poll.getResults() == null
                ? new HashMap<>()
                : new HashMap<>(poll.getResults());
        int current = results.get(trimmed) instanceof Number number ? number.intValue() : 0;
        results.put(trimmed, current + 1);
        poll.setResults(results);
        poll = pollRepository.save(poll);
        LiveAudiencePollResponse response = toPollResponse(poll);
        publish(eventId, "UPDATE_POLL", response);
        return response;
    }

    private void publish(Long eventId, String type, Object payload) {
        eventStreamService.publish(TOPIC, eventId, type,
                Map.of("eventId", eventId, "type", type, "payload", payload));
    }

    private Event requireEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
    }

    /**
     * Gates live-audience reads/writes on event visibility (#16198). Public events
     * are open to any authenticated user; private events require the caller to be
     * an event organizer (or platform admin/legacy owner) or a registered
     * participant.
     */
    private void requireEventAccess(Long eventId, String email) {
        Event event = requireEvent(eventId);
        if (event.isPublic()) {
            return;
        }
        boolean organizer = eventRoleService.hasRole(eventId, email, EventRole.ORGANIZER);
        boolean participant = eventRegistrationRepository.existsByEvent_IdAndUser_Email(eventId, email);
        if (!organizer && !participant) {
            throw new AccessDeniedException("You do not have access to this event's live audience.");
        }
    }

    private LiveAudienceQuestion requireQuestion(Long eventId, Long questionId) {
        return questionRepository.findByIdAndEventId(questionId, eventId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + questionId));
    }

    private LiveAudiencePoll requirePoll(Long eventId, Long pollId) {
        return pollRepository.findByIdAndEventId(pollId, eventId)
                .orElseThrow(() -> new IllegalArgumentException("Poll not found with id: " + pollId));
    }

    private LiveAudiencePoll requirePollForUpdate(Long eventId, Long pollId) {
        return pollRepository.findByIdAndEventIdForUpdate(pollId, eventId)
                .orElseThrow(() -> new IllegalArgumentException("Poll not found with id: " + pollId));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private void requireModerator(Long eventId, String email) {
        eventRoleService.requireRole(eventId, email, EventRole.ORGANIZER);
    }

    private String displayName(User user) {
        String full = (user.getFirstName() + " " + user.getLastName()).trim();
        return full.isBlank() ? user.getUsername() : full;
    }

    private LiveAudienceQuestionResponse toQuestionResponse(LiveAudienceQuestion question) {
        return LiveAudienceQuestionResponse.builder()
                .id(question.getId())
                .text(question.getText())
                .upvotes(question.getUpvotes())
                .flagged(question.isFlagged())
                .isSpeaker(question.isSpeaker())
                .userName(question.getUserName())
                .createdAt(question.getCreatedAt())
                .build();
    }

    private LiveAudiencePollResponse toPollResponse(LiveAudiencePoll poll) {
        return LiveAudiencePollResponse.builder()
                .id(poll.getId())
                .question(poll.getQuestion())
                .type(poll.getType())
                .status(poll.getStatus())
                .options(poll.getOptions())
                .results(poll.getResults())
                .createdAt(poll.getCreatedAt())
                .build();
    }
}
