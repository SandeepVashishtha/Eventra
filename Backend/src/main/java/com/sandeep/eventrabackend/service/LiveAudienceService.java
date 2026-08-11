package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.CreatePollRequest;
import com.sandeep.eventrabackend.dto.response.LiveAudienceDataResponse;
import com.sandeep.eventrabackend.dto.response.LiveAudiencePollResponse;
import com.sandeep.eventrabackend.dto.response.LiveAudienceQuestionResponse;
import com.sandeep.eventrabackend.exception.EventNotFoundException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.LiveAudiencePoll;
import com.sandeep.eventrabackend.model.LiveAudiencePollVote;
import com.sandeep.eventrabackend.model.LiveAudienceQuestion;
import com.sandeep.eventrabackend.model.LiveAudienceQuestionUpvote;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.LiveAudiencePollRepository;
import com.sandeep.eventrabackend.repository.LiveAudiencePollVoteRepository;
import com.sandeep.eventrabackend.repository.LiveAudienceQuestionRepository;
import com.sandeep.eventrabackend.repository.LiveAudienceQuestionUpvoteRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LiveAudienceService {

    private static final String TOPIC = "live-audience";
    private static final List<String> POLL_STATUSES = List.of("active", "paused", "closed");
    private static final List<String> POLL_TYPES = List.of("single", "multiple");

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventRoleService eventRoleService;
    private final LiveAudienceQuestionRepository questionRepository;
    private final LiveAudienceQuestionUpvoteRepository questionUpvoteRepository;
    private final LiveAudiencePollRepository pollRepository;
    private final LiveAudiencePollVoteRepository pollVoteRepository;
    private final EventStreamService eventStreamService;

    @Transactional(readOnly = true)
    public LiveAudienceDataResponse getInitialData(Long eventId) {
        requireEvent(eventId);
        List<LiveAudienceQuestionResponse> questions = questionRepository
                .findByEventIdOrderByUpvotesDescCreatedAtDesc(eventId)
                .stream()
                .map(this::toQuestionResponse)
                .toList();
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

    @Transactional
    public LiveAudienceQuestionResponse createQuestion(Long eventId, String text, String email) {
        requireEvent(eventId);
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
        requireEvent(eventId);
        LiveAudienceQuestion question = requireQuestion(eventId, questionId);
        User user = getUser(email);
        if (questionUpvoteRepository.existsByQuestionIdAndUserId(questionId, user.getId())) {
            throw new IllegalArgumentException("You have already upvoted this question");
        }
        questionUpvoteRepository.save(LiveAudienceQuestionUpvote.builder()
                .questionId(questionId)
                .userId(user.getId())
                .build());
        question.setUpvotes(question.getUpvotes() + 1);
        question = questionRepository.save(question);
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
        for (String option : request.getOptions()) {
            if (option == null || option.isBlank()) {
                throw new IllegalArgumentException("Poll options cannot be blank");
            }
            options.add(option.trim());
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
        requireEvent(eventId);
        LiveAudiencePoll poll = requirePoll(eventId, pollId);
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
        pollVoteRepository.save(LiveAudiencePollVote.builder()
                .pollId(pollId)
                .userId(user.getId())
                .optionText(trimmed)
                .build());
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
        eventStreamService.publish(TOPIC, type,
                Map.of("eventId", eventId, "type", type, "payload", payload));
    }

    private Event requireEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
    }

    private LiveAudienceQuestion requireQuestion(Long eventId, Long questionId) {
        return questionRepository.findByIdAndEventId(questionId, eventId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + questionId));
    }

    private LiveAudiencePoll requirePoll(Long eventId, Long pollId) {
        return pollRepository.findByIdAndEventId(pollId, eventId)
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
