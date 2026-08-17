package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.LiveAudiencePollVote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiveAudiencePollVoteRepository extends JpaRepository<LiveAudiencePollVote, Long> {

    boolean existsByPollIdAndUserId(Long pollId, Long userId);

    boolean existsByPollIdAndUserIdAndOptionText(Long pollId, Long userId, String optionText);
}
