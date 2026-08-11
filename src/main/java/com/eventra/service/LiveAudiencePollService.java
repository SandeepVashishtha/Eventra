package com.eventra.service;

import com.eventra.model.LiveAudiencePollVote;
import com.eventra.repository.LiveAudiencePollVoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@Service
public class LiveAudiencePollService {

    private static final Logger logger = Logger.getLogger(LiveAudiencePollService.class.getName());
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @Autowired
    private LiveAudiencePollVoteRepository voteRepository;

    public SseEmitter subscribeToPollStream(Long pollId) {
        SseEmitter emitter = new SseEmitter(0L); // Infinite timeout for active streams
        emitters.computeIfAbsent(pollId, k -> new ArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(pollId, emitter));
        emitter.onTimeout(() -> removeEmitter(pollId, emitter));
        emitter.onError(e -> removeEmitter(pollId, emitter));

        logger.info("New SSE client subscribed to pollId: " + pollId);
        return emitter;
    }

    @Transactional
    public void registerVote(Long pollId, String userId, Long optionId) {
        if (voteRepository.existsByPollIdAndUserId(pollId, userId)) {
            throw new IllegalStateException("User has already submitted a vote for this poll.");
        }

        LiveAudiencePollVote vote = new LiveAudiencePollVote(pollId, userId, optionId);
        voteRepository.save(vote);
        logger.info("Vote registered for pollId: " + pollId + " by userId: " + userId);

        // Broadcast updated vote counts to all SSE subscribers
        broadcastPollTally(pollId);
    }

    public void broadcastPollTally(Long pollId) {
        List<SseEmitter> pollEmitters = emitters.get(pollId);
        if (pollEmitters == null || pollEmitters.isEmpty()) {
            return;
        }

        // Fetch updated vote counts grouped by option ID
        Map<Long, Long> tallies = voteRepository.getVoteCountsByOptionForPoll(pollId);

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : pollEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("poll-tally-update")
                        .data(tallies));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        pollEmitters.removeAll(deadEmitters);
    }

    private void removeEmitter(Long pollId, SseEmitter emitter) {
        List<SseEmitter> pollEmitters = emitters.get(pollId);
        if (pollEmitters != null) {
            pollEmitters.remove(emitter);
        }
    }
}
