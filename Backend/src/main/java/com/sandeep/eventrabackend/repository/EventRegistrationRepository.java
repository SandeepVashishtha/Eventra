package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    boolean existsByEvent_IdAndUser_Email(Long eventId, String userEmail);

    List<EventRegistration> findByUser_EmailOrderByRegisteredAtDesc(String userEmail);

    void deleteByEventId(Long eventId);
}
