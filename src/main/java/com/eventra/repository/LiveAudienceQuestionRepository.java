package com.eventra.repository;

import com.eventra.model.LiveAudienceQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LiveAudienceQuestionRepository extends JpaRepository<LiveAudienceQuestion, Long> {

    @Modifying
    @Query("UPDATE LiveAudienceQuestion q SET q.upvotes = q.upvotes - 1 WHERE q.id = :id AND q.upvotes > 0")
    int decrementUpvotesAtomic(@Param("id") Long id);

    @Modifying
    @Query("UPDATE LiveAudienceQuestion q SET q.upvotes = q.upvotes + 1 WHERE q.id = :id")
    int incrementUpvotesAtomic(@Param("id") Long id);
}
