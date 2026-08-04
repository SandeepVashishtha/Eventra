package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventWaitlist;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventWaitlistRepository extends JpaRepository<EventWaitlist, Long> {

    boolean existsByEvent_IdAndUser_EmailAndStatus(Long eventId, String userEmail, String status);

    Optional<EventWaitlist> findByEvent_IdAndUser_EmailAndStatus(Long eventId, String userEmail, String status);

    List<EventWaitlist> findByEvent_IdAndStatusOrderByPositionAscJoinedAtAsc(Long eventId, String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT w FROM EventWaitlist w
            WHERE w.event.id = :eventId AND w.status = 'WAITING'
            ORDER BY w.position ASC, w.joinedAt ASC
            """)
    List<EventWaitlist> findWaitingByEventIdWithLock(@Param("eventId") Long eventId);

    @Query("SELECT COALESCE(MAX(w.position), 0) FROM EventWaitlist w WHERE w.event.id = :eventId")
    int findMaxPositionByEventId(@Param("eventId") Long eventId);

    void deleteByEvent_Id(Long eventId);
}
