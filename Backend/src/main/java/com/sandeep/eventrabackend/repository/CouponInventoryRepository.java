package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.CouponInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponInventoryRepository extends JpaRepository<CouponInventory, String> {

    /**
     * Atomically consumes one coupon slot, guarded by {@code remaining > 0}.
     * Executes within the caller's transaction, so a rollback restores the slot.
     *
     * @return number of rows updated (1 = redeemed, 0 = exhausted/unknown code)
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE CouponInventory c SET c.remaining = c.remaining - 1 WHERE c.code = :code AND c.remaining > 0")
    int decrementRemaining(@Param("code") String code);
}
