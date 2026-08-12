package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

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
     * Public events (not cancelled) overlapping the given window, excluding the
     * event currently being replaced. Used by
     * {@code GET /api/events/alternatives} (#15370).
     */
    @Query("SELECT e FROM Event e WHERE e.id <> :excludeId "
            + "AND e.isPublic = true AND e.status <> 'CANCELLED' "
            + "AND e.eventDate >= :from AND e.eventDate <= :to")
    Page<Event> findPublicAlternativesInWindow(
            @Param("excludeId") Long excludeId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);
}
