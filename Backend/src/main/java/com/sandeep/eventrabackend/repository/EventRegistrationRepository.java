package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    boolean existsByEvent_IdAndUser_Email(Long eventId, String userEmail);

    List<EventRegistration> findByUser_EmailOrderByRegisteredAtDesc(String userEmail);

    Optional<EventRegistration> findByEvent_IdAndSeatId(Long eventId, String seatId);

    List<EventRegistration> findByEvent_Id(Long eventId);

    void deleteByEventId(Long eventId);
}
