package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.TicketCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketCheckInRepository extends JpaRepository<TicketCheckIn, Long> {

    Optional<TicketCheckIn> findByEventIdAndRegistrationId(Long eventId, Long registrationId);

    boolean existsByEventIdAndRegistrationId(Long eventId, Long registrationId);

    List<TicketCheckIn> findByEventIdOrderByCheckedInAtDesc(Long eventId);

    long countByEventId(Long eventId);
}
