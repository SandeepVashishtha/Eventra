package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    boolean existsByEvent_IdAndUser_Email(Long eventId, String userEmail);

    long countByEvent_IdAndStatus(Long eventId, String status);

    List<EventRegistration> findByUser_EmailOrderByRegisteredAtDesc(String userEmail);

    Optional<EventRegistration> findByEvent_IdAndSeatId(Long eventId, String seatId);

    Optional<EventRegistration> findByEvent_IdAndUser_Email(Long eventId, String userEmail);

    List<EventRegistration> findByEvent_Id(Long eventId);

    List<EventRegistration> findByEvent_IdAndStatus(Long eventId, String status);

    List<EventRegistration> findByEvent_IdAndShowProfileInAttendeeDirectoryTrueOrderByRegisteredAtAsc(Long eventId);

    void deleteByEventId(Long eventId);

    void deleteByUser_Id(Long userId);
}
