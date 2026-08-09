package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.FeedbackRequest;
import com.sandeep.eventrabackend.dto.response.FeedbackResponse;
import com.sandeep.eventrabackend.exception.EventNotFoundException;
import com.sandeep.eventrabackend.exception.FeedbackAlreadyExistsException;
import com.sandeep.eventrabackend.exception.UserNotRegisteredException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Feedback;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.FeedbackAnalyticsRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackAnalyticsRepository feedbackRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventRegistrationRepository registrationRepository;

    @Transactional
    public FeedbackResponse submitFeedback(String userEmail, FeedbackRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + request.getEventId()));

        if (!event.isEventPast()) {
            throw new IllegalArgumentException("Feedback can only be submitted after the event has ended.");
        }

        // Validate user is registered for the event
        if (!registrationRepository.existsByEvent_IdAndUser_Email(event.getId(), userEmail)) {
            throw new UserNotRegisteredException("You must be registered for the event to provide feedback.");
        }

        // Prevent duplicate feedback
        if (feedbackRepository.existsByEvent_IdAndUser_Email(event.getId(), userEmail)) {
            throw new FeedbackAlreadyExistsException("You have already submitted feedback for this event.");
        }

        // Validate rating is within valid range
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be an integer between 1 and 5.");
        }

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setEvent(event);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        Feedback savedFeedback = feedbackRepository.save(feedback);

        return mapToResponse(savedFeedback);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrganizerScore(Long organizerId) {
        Double averageRating = feedbackRepository.findAverageRatingByOrganizer(organizerId);
        long reviewCount = feedbackRepository.countByOrganizer(organizerId);

        Map<String, Object> response = new HashMap<>();
        response.put("organizerId", organizerId);
        response.put("averageRating", averageRating == null ? 0.0 : Math.round(averageRating * 10.0) / 10.0);
        response.put("reviewCount", reviewCount);
        return response;
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getOrganizerFeedback(Long organizerId) {
        return feedbackRepository.findByOrganizer(organizerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getEventFeedback(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new EventNotFoundException("Event not found with ID: " + eventId);
        }

        return feedbackRepository.findByEvent_IdOrderBySubmittedAtDesc(eventId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .eventId(feedback.getEvent().getId())
                .userId(feedback.getUser().getId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .submittedAt(feedback.getSubmittedAt())
                .build();
    }
}
