package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Event;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventAnalyticsRepository extends JpaRepository<Event, Long> {

    // "Active" = event date is in the future (no status field on Event)
    @Query("SELECT COUNT(e) FROM Event e WHERE e.eventDate > :now")
    long countActiveEvents(@Param("now") LocalDateTime now);

    // "Completed" = event date is in the past
    @Query("SELECT COUNT(e) FROM Event e WHERE e.eventDate <= :now")
    long countCompletedEvents(@Param("now") LocalDateTime now);

    // Uses registeredCount (denormalised counter already on Event — free query!)
    // Returns: [id, title, registeredCount, capacity, utilization]
    @Query("""
        SELECT e.id,
               e.title,
               e.registeredCount,
               e.capacity,
               (e.registeredCount * 1.0 / NULLIF(e.capacity, 0))
        FROM Event e
        ORDER BY e.registeredCount DESC
        """)
    List<Object[]> findMostPopularEvents(Pageable pageable);

    // Average utilization across events that have a capacity set
    @Query("""
        SELECT AVG(e.registeredCount * 1.0 / NULLIF(e.capacity, 0))
        FROM Event e
        WHERE e.capacity IS NOT NULL AND e.capacity > 0
        """)
    Double findAverageCapacityUtilization();

    // Total unique participants via the join table
    @Query("SELECT COUNT(DISTINCT a.id) FROM Event e JOIN e.attendees a")
    long countUniqueParticipants();
}
