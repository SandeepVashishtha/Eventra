package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface RegistrationAnalyticsRepository
        extends JpaRepository<EventRegistration, Long> {

    // ── Trends — note: field is registeredAt, NOT createdAt ──────────────────
    // All queries accept a nullable collection of event IDs: null = global,
    // non-null = restrict to those events (e.g. a caller's accessible events).

    @Query("""
        SELECT FUNCTION('FORMATDATETIME', r.registeredAt, 'yyyy-MM') AS period,
               COUNT(r) AS regCount
        FROM EventRegistration r
        WHERE r.registeredAt >= :from
          AND r.status = 'CONFIRMED'
          AND (:eventIds IS NULL OR r.event.id IN :eventIds)
        GROUP BY period
        ORDER BY period ASC
        """)
    List<Object[]> findMonthlyTrend(@Param("from") LocalDateTime from, @Param("eventIds") Collection<Long> eventIds);

    @Query("""
        SELECT CAST(FUNCTION('YEAR', r.registeredAt) AS int) * 100
             + CAST(FUNCTION('WEEK', r.registeredAt) AS int) AS period,
               COUNT(r) AS regCount
        FROM EventRegistration r
        WHERE r.registeredAt >= :from
          AND r.status = 'CONFIRMED'
          AND (:eventIds IS NULL OR r.event.id IN :eventIds)
        GROUP BY period
        ORDER BY period ASC
        """)
    List<Object[]> findWeeklyTrend(@Param("from") LocalDateTime from, @Param("eventIds") Collection<Long> eventIds);

    @Query("""
        SELECT CAST(r.registeredAt AS date) AS period,
               COUNT(r) AS regCount
        FROM EventRegistration r
        WHERE r.registeredAt >= :from
          AND r.status = 'CONFIRMED'
          AND (:eventIds IS NULL OR r.event.id IN :eventIds)
        GROUP BY period
        ORDER BY period ASC
        """)
    List<Object[]> findDailyTrend(@Param("from") LocalDateTime from, @Param("eventIds") Collection<Long> eventIds);

    // ── Peak registration periods ─────────────────────────────────────────────
    @Query("""
        SELECT FUNCTION('DAY_OF_WEEK', r.registeredAt) AS dow,
               FUNCTION('HOUR', r.registeredAt)      AS hr,
               COUNT(r)                              AS cnt
        FROM EventRegistration r
        WHERE r.status = 'CONFIRMED'
          AND (:eventIds IS NULL OR r.event.id IN :eventIds)
        GROUP BY dow, hr
        ORDER BY cnt DESC
        """)
    List<Object[]> findPeakPeriods(@Param("eventIds") Collection<Long> eventIds);

    // Total confirmed registrations
    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.status = 'CONFIRMED' AND (:eventIds IS NULL OR r.event.id IN :eventIds)")
    long countConfirmedRegistrations(@Param("eventIds") Collection<Long> eventIds);

    // Earliest confirmed registration — used to derive "hours active"
    @Query("SELECT MIN(r.registeredAt) FROM EventRegistration r WHERE r.status = 'CONFIRMED' AND (:eventIds IS NULL OR r.event.id IN :eventIds)")
    LocalDateTime findEarliestRegistration(@Param("eventIds") Collection<Long> eventIds);
}
