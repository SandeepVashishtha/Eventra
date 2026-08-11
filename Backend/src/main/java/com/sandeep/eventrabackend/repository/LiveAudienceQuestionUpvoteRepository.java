package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.LiveAudienceQuestionUpvote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiveAudienceQuestionUpvoteRepository
        extends JpaRepository<LiveAudienceQuestionUpvote, Long> {

    boolean existsByQuestionIdAndUserId(Long questionId, Long userId);
}
