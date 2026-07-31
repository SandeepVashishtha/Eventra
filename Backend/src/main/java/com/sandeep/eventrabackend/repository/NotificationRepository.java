package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);
    Optional<Notification> findByIdAndUserEmail(Long id, String email);
}
