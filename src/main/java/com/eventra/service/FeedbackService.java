package com.eventra.service;

import com.eventra.dto.FeedbackSummaryDTO;
import com.eventra.model.Feedback;
import com.eventra.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.logging.Logger;

@Service
public class FeedbackService {

    private static final Logger logger = Logger.getLogger(FeedbackService.class.getName());

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Transactional
    public Feedback submitFeedback(Long eventId, String userId, Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }

        Feedback feedback = new Feedback(eventId, userId, rating, comment);
        feedback.setSentiment(classifySentiment(rating, comment));

        Feedback saved = feedbackRepository.save(feedback);
        logger.info("Feedback saved for event ID: " + eventId + " with sentiment: " + saved.getSentiment());
        return saved;
    }

    @Transactional(readOnly = true)
    public FeedbackSummaryDTO getEventFeedbackSummary(Long eventId) {
        Double avgRating = feedbackRepository.findAverageRatingByEventId(eventId).orElse(0.0);
        List<Feedback> allFeedbacks = feedbackRepository.findByEventId(eventId);

        long positiveCount = feedbackRepository.countByEventIdAndSentiment(eventId, "POSITIVE");
        long neutralCount = feedbackRepository.countByEventIdAndSentiment(eventId, "NEUTRAL");
        long negativeCount = feedbackRepository.countByEventIdAndSentiment(eventId, "NEGATIVE");

        return new FeedbackSummaryDTO(
                eventId,
                Math.round(avgRating * 100.0) / 100.0,
                allFeedbacks.size(),
                positiveCount,
                neutralCount,
                negativeCount
        );
    }

    private String classifySentiment(Integer rating, String comment) {
        if (comment != null && !comment.trim().isEmpty()) {
            String lowerComment = comment.toLowerCase();
            if (lowerComment.contains("great") || lowerComment.contains("excellent") || lowerComment.contains("amazing") || lowerComment.contains("awesome") || lowerComment.contains("love")) {
                return "POSITIVE";
            }
            if (lowerComment.contains("bad") || lowerComment.contains("poor") || lowerComment.contains("terrible") || lowerComment.contains("horrible") || lowerComment.contains("waste")) {
                return "NEGATIVE";
            }
        }

        if (rating >= 4) {
            return "POSITIVE";
        } else if (rating <= 2) {
            return "NEGATIVE";
        }
        return "NEUTRAL";
    }
}
