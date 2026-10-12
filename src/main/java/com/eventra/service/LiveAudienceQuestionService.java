package com.eventra.service;

import com.eventra.repository.LiveAudienceQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.logging.Logger;

@Service
public class LiveAudienceQuestionService {

    private static final Logger logger = Logger.getLogger(LiveAudienceQuestionService.class.getName());

    @Autowired
    private LiveAudienceQuestionRepository questionRepository;

    @Transactional
    public void unUpvoteQuestion(Long questionId) {
        int rowsUpdated = questionRepository.decrementUpvotesAtomic(questionId);
        if (rowsUpdated == 0) {
            logger.warning("Un-upvote ignored: Question ID " + questionId + " upvotes already at 0 or question not found.");
        } else {
            logger.info("Successfully decremented upvote count atomically for Question ID: " + questionId);
        }
    }

    @Transactional
    public void upvoteQuestion(Long questionId) {
        questionRepository.incrementUpvotesAtomic(questionId);
        logger.info("Successfully incremented upvote count for Question ID: " + questionId);
    }
}
