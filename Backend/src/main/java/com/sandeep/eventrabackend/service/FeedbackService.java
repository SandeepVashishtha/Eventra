package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.FeedbackRequest;
import com.sandeep.eventrabackend.dto.response.FeedbackResponse;
import com.sandeep.eventrabackend.dto.response.PublicFeedbackResponse;
import com.sandeep.eventrabackend.exception.EventNotFoundException;
import com.sandeep.eventrabackend.exception.FeedbackAlreadyExistsException;
import com.sandeep.eventrabackend.exception.UserNotRegisteredException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Feedback;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.FeedbackAnalyticsRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
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

        if (request.getComment() != null && request.getComment().trim().length() > 1000) {
            throw new IllegalArgumentException("Comment cannot exceed 1000 characters.");
        }
        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setEvent(event);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        try {
            Feedback savedFeedback = feedbackRepository.saveAndFlush(feedback);
            return mapToResponse(savedFeedback);
        } catch (DataIntegrityViolationException ex) {
            throw new FeedbackAlreadyExistsException("You have already submitted feedback for this event.");
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrganizerScore(Long organizerId, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + callerEmail));

        boolean isAdmin = caller.getRole() == Role.ADMIN || caller.getRole() == Role.SUPER_ADMIN;
        if (!isAdmin && !caller.getId().equals(organizerId)) {
            throw new AccessDeniedException("You are not authorized to view score for this organizer.");
        }

        Double averageRating = feedbackRepository.findAverageRatingByOrganizer(organizerId);
        long reviewCount = feedbackRepository.countByOrganizer(organizerId);

        Map<String, Object> response = new HashMap<>();
        response.put("organizerId", organizerId);
        response.put("averageRating", averageRating == null ? 0.0 : Math.round(averageRating * 10.0) / 10.0);
        response.put("reviewCount", reviewCount);
        return response;
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getOrganizerFeedback(Long organizerId, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + callerEmail));

        boolean isAdmin = caller.getRole() == Role.ADMIN || caller.getRole() == Role.SUPER_ADMIN;
        if (!isAdmin && !caller.getId().equals(organizerId)) {
            throw new AccessDeniedException("You are not authorized to view feedback for this organizer.");
        }

        return feedbackRepository.findByOrganizer(organizerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicFeedbackResponse> getEventFeedback(Long eventId) {
        // Enforce the same visibility rule as the event detail API
        // (EventService.requirePublicEvent): private events are hidden from the
        // public read path, and cancelled events never expose their feedback.
        // A missing, private, or cancelled event is reported as not-found so
        // callers cannot distinguish it from a nonexistent id (issue #14615).
        Event event = eventRepository.findById(eventId)
                .filter(Event::isPublic)
                .filter(e -> !"CANCELLED".equals(e.getStatus()))
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + eventId));

        return feedbackRepository.findByEvent_IdOrderBySubmittedAtDesc(event.getId()).stream()
                .map(this::mapToPublicResponse)
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

    private PublicFeedbackResponse mapToPublicResponse(Feedback feedback) {
        return PublicFeedbackResponse.builder()
                .id(feedback.getId())
                .eventId(feedback.getEvent().getId())
                .rating(feedback.getRating())
                .comment(sanitizePublicComment(feedback.getComment()))
                .submittedAt(feedback.getSubmittedAt())
                .build();
    }

    /**
     * Lightweight sanitization for the public feedback list: strips any HTML so
     * comment text can never be rendered as markup, collapses whitespace, and
     * caps the length. The organizer-facing view ({@link #mapToResponse}) keeps
     * the raw comment. Issue #14615.
     */
    private static String sanitizePublicComment(String comment) {
        if (comment == null || comment.isBlank()) {
            return comment;
        }
        String stripped = comment.replaceAll("<[^>]*>", "").replaceAll("\\s+", " ").trim();
        return stripped.length() > 1000 ? stripped.substring(0, 1000) : stripped;
    }
}
