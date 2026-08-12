package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithLock(@Param("id") Long id);

    /**
     * FIX (#13914): Atomic single-query capacity guard for registration.
     *
     * <p>Increments {@code registeredCount} in one UPDATE only while a seat is
     * free (a null {@code capacity} means unlimited), so concurrent
     * registrations cannot both pass a read-modify-write check and overshoot
     * capacity. The affected row count distinguishes "granted" (1) from
     * "event full" (0). Built against the real {@code capacity} /
     * {@code registeredCount} fields — no {@code availableSeats} column exists.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Event e SET e.registeredCount = e.registeredCount + 1 "
            + "WHERE e.id = :id AND (e.capacity IS NULL OR e.capacity > e.registeredCount)")
    int incrementRegisteredCountAtomically(@Param("id") Long id);

    /**
     * Case-insensitive search over title OR description.
     * Used by {@code GET /api/events/search} (#15364).
     */
    List<Event> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title, String description);

    /**
     * Grouped aggregate query for category statistics (Issue #16693).
     * Calculates event count per category directly in the database to avoid loading all entities into JVM heap.
     */
    @Query("SELECT e.category, COUNT(e) FROM Event e WHERE e.category IS NOT NULL AND e.category <> '' GROUP BY e.category")
    List<Object[]> countEventsByCategory();

    @Query("""
            SELECT e FROM Event e WHERE
            e.id <> :excludeEventId AND
            e.isPublic = true AND
            e.status <> 'CANCELLED' AND
            e.eventDate >= :from AND
            e.eventDate <= :to
            ORDER BY e.eventDate ASC
            """)
    List<Event> findPublicAlternativesInWindow(
            @Param("excludeEventId") Long excludeEventId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            org.springframework.data.domain.Pageable pageable);
}
