package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.TicketTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketTierRepository extends JpaRepository<TicketTier, String> {

    Optional<TicketTier> findByTier(String tier);

    /**
     * Atomically decrements the tier's remaining capacity, guarded by
     * {@code remaining >= quantity}. Executes within the caller's transaction,
     * so a rollback restores the slot.
     *
     * @return number of rows updated (1 = purchased, 0 = exhausted/unknown tier)
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE TicketTier t
            SET t.remaining = t.remaining - :quantity
            WHERE t.tier = :tier AND t.remaining >= :quantity
            """)
    int decrementRemainingIfAvailable(@Param("tier") String tier, @Param("quantity") int quantity);

    @Query("SELECT COALESCE(SUM(t.remaining), 0) FROM TicketTier t")
    int sumRemaining();
}
