package com.eventra.repository;

import com.eventra.model.EventWaitlist;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventWaitlistRepository extends JpaRepository<EventWaitlist, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM EventWaitlist w WHERE w.eventId = :eventId AND w.status = 'PENDING' ORDER BY w.createdAt ASC LIMIT 1")
    Optional<EventWaitlist> findNextPendingWithPessimisticWriteLock(@Param("eventId") Long eventId);

    List<EventWaitlist> findByStatusAndExpirationTimeBefore(String status, LocalDateTime now);
}
