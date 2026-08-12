package com.eventra.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.Optional;

@Repository
public interface CouponRepository {

    // Atomic update query ensuring maxRedemptions is respected under concurrency
    @Modifying
    @Query("UPDATE Coupon c SET c.currentRedemptions = c.currentRedemptions + 1 " +
           "WHERE c.code = :code AND c.currentRedemptions < c.maxRedemptions")
    int incrementRedemptionCountAtomically(@Param("code") String code);

    // Pessimistic write lock backup for transactional verification
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Coupon c WHERE c.code = :code")
    Optional<Object> findByCodeWithPessimisticLock(@Param("code") String code);
}
