package com.eventra.repository;

import com.eventra.model.LiveAudiencePollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiveAudiencePollVoteRepository extends JpaRepository<LiveAudiencePollVote, Long> {

    boolean existsByPollIdAndUserId(Long pollId, String userId);
}
