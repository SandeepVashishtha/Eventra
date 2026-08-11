package com.eventra.repository;

import com.eventra.model.ParticipantGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipantGroupRepository extends JpaRepository<ParticipantGroup, Long> {
    List<ParticipantGroup> findByEventId(Long eventId);
}
