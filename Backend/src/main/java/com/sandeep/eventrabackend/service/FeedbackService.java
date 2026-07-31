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

        // Validate user is registered for the event
        if (!registrationRepository.existsByEvent_IdAndUser_Email(event.getId(), userEmail)) {
            throw new UserNotRegisteredException("You must be registered for the event to provide feedback.");
        }

        // Prevent duplicate feedback
        if (feedbackRepository.existsByEvent_IdAndUser_Email(event.getId(), userEmail)) {
            throw new FeedbackAlreadyExistsException("You have already submitted feedback for this event.");
        }

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setEvent(event);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        Feedback savedFeedback = feedbackRepository.save(feedback);

        return mapToResponse(savedFeedback);
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
