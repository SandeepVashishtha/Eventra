package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Event;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface EventAnalyticsRepository extends JpaRepository<Event, Long> {

    // Scoped variants accept a nullable collection of event IDs: null = global,
    // non-null = restrict to those events (e.g. a caller's accessible events).

    @Query("SELECT COUNT(e) FROM Event e WHERE (:eventIds IS NULL OR e.id IN :eventIds)")
    long countEvents(@Param("eventIds") Collection<Long> eventIds);

    // "Active" = public, non-cancelled event whose date is in the future
    @Query("SELECT COUNT(e) FROM Event e WHERE e.eventDate > :now AND e.isPublic = TRUE AND (e.status IS NULL OR e.status <> 'CANCELLED') AND (:eventIds IS NULL OR e.id IN :eventIds)")
    long countActiveEvents(@Param("now") LocalDateTime now, @Param("eventIds") Collection<Long> eventIds);

    // "Completed" = public, non-cancelled event whose date is in the past
    @Query("SELECT COUNT(e) FROM Event e WHERE e.eventDate <= :now AND e.isPublic = TRUE AND (e.status IS NULL OR e.status <> 'CANCELLED') AND (:eventIds IS NULL OR e.id IN :eventIds)")
    long countCompletedEvents(@Param("now") LocalDateTime now, @Param("eventIds") Collection<Long> eventIds);

    // Uses registeredCount (denormalised counter already on Event — free query!)
    // Returns: [id, title, registeredCount, capacity, utilization]
    @Query("""
        SELECT e.id,
               e.title,
               e.registeredCount,
               e.capacity,
               (e.registeredCount * 1.0 / NULLIF(e.capacity, 0))
        FROM Event e
        WHERE (:eventIds IS NULL OR e.id IN :eventIds)
        ORDER BY e.registeredCount DESC
        """)
    List<Object[]> findMostPopularEvents(@Param("eventIds") Collection<Long> eventIds, Pageable pageable);

    // Per-category registration distribution. Returns: [category, count]
    @Query("""
        SELECT e.category, COUNT(e)
        FROM Event e
        WHERE e.category IS NOT NULL AND e.category <> ''
          AND (:eventIds IS NULL OR e.id IN :eventIds)
        GROUP BY e.category
        ORDER BY COUNT(e) DESC
        """)
    List<Object[]> findCategoryBreakdown(@Param("eventIds") Collection<Long> eventIds, Pageable pageable);

    // Average utilization across events that have a capacity set
    @Query("""
        SELECT AVG(e.registeredCount * 1.0 / NULLIF(e.capacity, 0))
        FROM Event e
        WHERE e.capacity IS NOT NULL AND e.capacity > 0
          AND (:eventIds IS NULL OR e.id IN :eventIds)
        """)
    Double findAverageCapacityUtilization(@Param("eventIds") Collection<Long> eventIds);

    // Total unique participants via confirmed registrations
    @Query("SELECT COUNT(DISTINCT r.user.id) FROM EventRegistration r WHERE r.status = 'CONFIRMED' AND (:eventIds IS NULL OR r.event.id IN :eventIds)")
    long countUniqueParticipants(@Param("eventIds") Collection<Long> eventIds);

    // Events a user owns or manages (owner or member of the event team)
    @Query("""
        SELECT DISTINCT e
        FROM Event e
        WHERE e.ownerId = :userId
           OR e.id IN (SELECT tm.event.id FROM EventTeamMember tm WHERE tm.user.id = :userId)
        """)
    List<Event> findAccessibleToUser(@Param("userId") Long userId);

    @Query("SELECT DISTINCT e.ownerId FROM Event e WHERE e.ownerId IS NOT NULL")
    List<Long> findDistinctOwnerIds();

    @Query("""
        SELECT u.id,
               u.firstName,
               u.lastName,
               COUNT(DISTINCT e.id),
               COALESCE(SUM(e.registeredCount), 0),
               AVG(CASE WHEN e.capacity IS NOT NULL AND e.capacity > 0
                        THEN e.registeredCount * 1.0 / e.capacity END)
        FROM User u, Event e
        WHERE (e.ownerId = u.id
               OR e.id IN (SELECT tm.event.id FROM EventTeamMember tm WHERE tm.user.id = u.id))
          AND u.id IN (SELECT DISTINCT e2.ownerId FROM Event e2 WHERE e2.ownerId IS NOT NULL)
        GROUP BY u.id, u.firstName, u.lastName
        """)
    List<Object[]> aggregateOrganizerInsights();
}
