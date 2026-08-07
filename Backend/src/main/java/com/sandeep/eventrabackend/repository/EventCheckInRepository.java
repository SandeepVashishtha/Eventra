package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventCheckInRepository extends JpaRepository<EventCheckIn, Long> {

    List<EventCheckIn> findByEventIdOrderByCheckedInAtDesc(Long eventId);

    List<EventCheckIn> findAllByOrderByCheckedInAtDesc();
}
