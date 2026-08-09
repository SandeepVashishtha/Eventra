package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.LiveAudiencePoll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LiveAudiencePollRepository extends JpaRepository<LiveAudiencePoll, Long> {

    List<LiveAudiencePoll> findByEventIdOrderByCreatedAtDesc(Long eventId);

    Optional<LiveAudiencePoll> findByIdAndEventId(Long id, Long eventId);

    void deleteByEventId(Long eventId);
}
