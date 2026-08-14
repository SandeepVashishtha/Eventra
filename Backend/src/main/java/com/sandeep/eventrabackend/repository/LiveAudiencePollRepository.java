package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.LiveAudiencePoll;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LiveAudiencePollRepository extends JpaRepository<LiveAudiencePoll, Long> {

    List<LiveAudiencePoll> findByEventIdOrderByCreatedAtDesc(Long eventId);

    List<LiveAudiencePoll> findByEventIdAndStatusOrderByCreatedAtDesc(Long eventId, String status);

    Optional<LiveAudiencePoll> findByIdAndEventId(Long id, Long eventId);

    /**
     * Locked read used when casting a vote: serializes concurrent voters on
     * the same poll row so the read-modify-write on the results JSON cannot
     * lose updates (#14509).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM LiveAudiencePoll p WHERE p.id = :id AND p.eventId = :eventId")
    Optional<LiveAudiencePoll> findByIdAndEventIdForUpdate(@Param("id") Long id, @Param("eventId") Long eventId);

    void deleteByEventId(Long eventId);
}
