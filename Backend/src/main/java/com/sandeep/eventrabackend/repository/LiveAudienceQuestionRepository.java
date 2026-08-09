package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.LiveAudienceQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LiveAudienceQuestionRepository extends JpaRepository<LiveAudienceQuestion, Long> {

    List<LiveAudienceQuestion> findByEventIdOrderByUpvotesDescCreatedAtDesc(Long eventId);

    Optional<LiveAudienceQuestion> findByIdAndEventId(Long id, Long eventId);

    void deleteByEventId(Long eventId);
}
