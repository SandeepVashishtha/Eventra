package com.eventra.repository;

import com.eventra.model.RecoverySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecoverySessionRepository extends JpaRepository<RecoverySession, Long> {

    Optional<RecoverySession> findByToken(String token);
}
