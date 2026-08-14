package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface FeedbackAnalyticsRepository extends JpaRepository<Feedback, Long> {

    // Scoped variants accept a nullable collection of event IDs: null = global,
    // non-null = restrict to those events (e.g. a caller's accessible events).

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE (:eventIds IS NULL OR f.event.id IN :eventIds)")
    Double findOverallAverageRating(@Param("eventIds") Collection<Long> eventIds);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.event.id IN :eventIds")
    Double findAverageRatingForEvents(@Param("eventIds") java.util.Collection<Long> eventIds);

    @Query("""
        SELECT u.id, AVG(f.rating)
        FROM User u, Event e
        LEFT JOIN Feedback f ON f.event.id = e.id
        WHERE (e.ownerId = u.id
               OR e.id IN (SELECT tm.event.id FROM EventTeamMember tm WHERE tm.user.id = u.id))
          AND u.id IN :organizerIds
        GROUP BY u.id
        """)
    List<Object[]> findAverageRatingByOrganizers(@Param("organizerIds") java.util.Collection<Long> organizerIds);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE (:eventIds IS NULL OR f.event.id IN :eventIds)")
    long countTotalFeedback(@Param("eventIds") Collection<Long> eventIds);

    // Returns: [eventId, eventTitle, avgRating, feedbackCount]
    @Query("""
        SELECT f.event.id,
               f.event.title,
               AVG(f.rating),
               COUNT(f)
        FROM Feedback f
        WHERE (:eventIds IS NULL OR f.event.id IN :eventIds)
        GROUP BY f.event.id, f.event.title
        ORDER BY AVG(f.rating) DESC
        """)
    List<Object[]> findPerEventSummary(@Param("eventIds") Collection<Long> eventIds);

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

    List<Feedback> findByEvent_IdOrderBySubmittedAtDesc(Long eventId);

    void deleteByUser_Id(Long userId);

    void deleteByEvent_Id(Long eventId);

    @Query("""
        SELECT AVG(f.rating)
        FROM Feedback f
        WHERE f.event.ownerId = :organizerId
        """)
    Double findAverageRatingByOrganizer(@Param("organizerId") Long organizerId);

    @Query("""
        SELECT COUNT(f)
        FROM Feedback f
        WHERE f.event.ownerId = :organizerId
        """)
    long countByOrganizer(@Param("organizerId") Long organizerId);

    @Query("""
        SELECT f
        FROM Feedback f
        WHERE f.event.ownerId = :organizerId
        ORDER BY f.submittedAt DESC
        """)
    List<Feedback> findByOrganizer(@Param("organizerId") Long organizerId);
}
