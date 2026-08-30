package com.eventra.repository;

import com.eventra.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByEventId(Long eventId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.eventId = :eventId")
    Optional<Double> findAverageRatingByEventId(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.eventId = :eventId AND f.sentiment = :sentiment")
    long countByEventIdAndSentiment(@Param("eventId") Long eventId, @Param("sentiment") String sentiment);
}
