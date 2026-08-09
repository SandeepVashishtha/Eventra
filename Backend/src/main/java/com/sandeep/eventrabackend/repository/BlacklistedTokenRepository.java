package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, String> {

    boolean existsByTokenHashAndExpiresAtAfter(String tokenHash, Instant now);

    @Modifying
    @Query("DELETE FROM BlacklistedToken t WHERE t.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);
}
