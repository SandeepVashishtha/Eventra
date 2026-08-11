package com.eventra.service;

import com.eventra.model.LiveAudiencePollVote;
import com.eventra.repository.LiveAudiencePollVoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.logging.Logger;

@Service
public class LiveAudiencePollService {

    private static final Logger logger = Logger.getLogger(LiveAudiencePollService.class.getName());

    @Autowired
    private LiveAudiencePollVoteRepository voteRepository;

    @Transactional
    public void registerVote(Long pollId, String userId, Long optionId) {
        if (voteRepository.existsByPollIdAndUserId(pollId, userId)) {
            logger.warning("Duplicate vote attempt blocked for pollId: " + pollId + " by userId: " + userId);
            throw new IllegalStateException("User has already submitted a vote for this poll.");
        }

        LiveAudiencePollVote vote = new LiveAudiencePollVote(pollId, userId, optionId);
        voteRepository.save(vote);
        logger.info("Successfully registered vote for pollId: " + pollId + " by userId: " + userId);
    }
}
