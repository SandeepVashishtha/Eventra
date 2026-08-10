package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.RecoverySession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RecoverySessionRepository extends JpaRepository<RecoverySession, String> {
    List<RecoverySession> findByUser_IdAndExpiresAtAfterOrderByUpdatedAtDesc(Long userId, LocalDateTime now);
    Optional<RecoverySession> findByIdAndUser_Id(String id, Long userId);
    long deleteByUser_IdAndExpiresAtBefore(Long userId, LocalDateTime now);
    void deleteByIdAndUser_Id(String id, Long userId);
}
