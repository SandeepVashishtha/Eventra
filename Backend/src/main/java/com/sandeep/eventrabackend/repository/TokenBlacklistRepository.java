package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<BlacklistedToken, Long> {

    boolean existsByTokenHash(String tokenHash);

    void deleteByExpiresAtBefore(LocalDateTime now);
}
