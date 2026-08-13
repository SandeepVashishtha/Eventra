package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    Optional<PushSubscription> findByUser_IdAndEndpoint(Long userId, String endpoint);
    void deleteByUser_IdAndEndpoint(Long userId, String endpoint);
    void deleteByUser_Id(Long userId);
}
