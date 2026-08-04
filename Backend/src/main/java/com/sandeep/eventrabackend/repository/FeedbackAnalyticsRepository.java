package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackAnalyticsRepository extends JpaRepository<Feedback, Long> {

    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double findOverallAverageRating();

    @Query("SELECT COUNT(f) FROM Feedback f")
    long countTotalFeedback();

    // Returns: [eventId, eventTitle, avgRating, feedbackCount]
    @Query("""
        SELECT f.event.id,
               f.event.title,
               AVG(f.rating),
               COUNT(f)
        FROM Feedback f
        GROUP BY f.event.id, f.event.title
        ORDER BY AVG(f.rating) DESC
        """)
    List<Object[]> findPerEventSummary();

    // Returns: [rating(1–5), count]
    @Query("""
        SELECT f.rating, COUNT(f)
        FROM Feedback f
        WHERE f.event.id = :eventId
        GROUP BY f.rating
        ORDER BY f.rating
        """)
    List<Object[]> findRatingDistributionByEvent(@Param("eventId") Long eventId);

    boolean existsByEvent_IdAndUser_Email(Long eventId, String email);
}
