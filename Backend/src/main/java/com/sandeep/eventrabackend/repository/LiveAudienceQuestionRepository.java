package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.LiveAudienceQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LiveAudienceQuestionRepository extends JpaRepository<LiveAudienceQuestion, Long> {

    List<LiveAudienceQuestion> findByEventIdOrderByUpvotesDescCreatedAtDesc(Long eventId);

    Optional<LiveAudienceQuestion> findByIdAndEventId(Long id, Long eventId);

    void deleteByEventId(Long eventId);

    /**
     * Atomically increments the upvote counter. A bulk UPDATE avoids the
     * read-modify-write pattern, so concurrent upvotes cannot lose updates
     * (#14509). clearAutomatically invalidates the caller's stale entity copy,
     * so a subsequent read reflects the incremented value.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE LiveAudienceQuestion q SET q.upvotes = q.upvotes + 1 WHERE q.id = :id")
    int incrementUpvotes(@Param("id") Long id);
}
